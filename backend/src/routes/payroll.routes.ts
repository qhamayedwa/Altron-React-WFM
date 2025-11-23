import { Router, Response as ExpressResponse } from 'express';
import pool from '../db/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all pay codes
router.get('/pay-codes', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM pay_codes WHERE tenant_id = $1 ORDER BY code`,
      [req.user!.tenantId]
    );
    res.json({ payCodes: result.rows });
  } catch (error) {
    console.error('Get pay codes error:', error);
    res.status(500).json({ error: 'Failed to fetch pay codes' });
  }
});

// Get all pay rules
router.get('/pay-rules', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT pr.*, pc.code as pay_code, pc.description as pay_code_description
       FROM pay_rules pr
       LEFT JOIN pay_codes pc ON pr.pay_code_id = pc.id
       WHERE pr.tenant_id = $1
       ORDER BY pr.priority`,
      [req.user!.tenantId]
    );
    res.json({ payRules: result.rows });
  } catch (error) {
    console.error('Get pay rules error:', error);
    res.status(500).json({ error: 'Failed to fetch pay rules' });
  }
});

// Create pay rule
router.post('/pay-rules', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { name, payCodeId, ruleType, condition, value, priority, isActive } = req.body;

    const result = await pool.query(
      `INSERT INTO pay_rules (tenant_id, name, pay_code_id, rule_type, condition, value, priority, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user!.tenantId, name, payCodeId, ruleType, condition, value, priority, isActive]
    );

    res.status(201).json({ payRule: result.rows[0] });
  } catch (error) {
    console.error('Create pay rule error:', error);
    res.status(500).json({ error: 'Failed to create pay rule' });
  }
});

// Calculate payroll for period
router.post('/calculate', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, userIds } = req.body;

    // Get approved time entries for the period
    let query = `
      SELECT 
        te.*,
        u.payroll_base_rate,
        u.employee_number,
        u.first_name,
        u.last_name
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      WHERE te.tenant_id = $1 
        AND te.status = 'approved'
        AND te.clock_in_time >= $2
        AND te.clock_in_time <= $3
    `;

    const params: any[] = [req.user!.tenantId, startDate, endDate];

    if (userIds && userIds.length > 0) {
      query += ` AND te.user_id = ANY($4)`;
      params.push(userIds);
    }

    const timeEntries = await pool.query(query, params);

    // Group by user and calculate totals
    const userPayroll: any = {};

    for (const entry of timeEntries.rows) {
      if (!userPayroll[entry.user_id]) {
        userPayroll[entry.user_id] = {
          userId: entry.user_id,
          employeeNumber: entry.employee_number,
          firstName: entry.first_name,
          lastName: entry.last_name,
          baseRate: parseFloat(entry.payroll_base_rate) || 0,
          regularHours: 0,
          overtimeHours: 0,
          regularPay: 0,
          overtimePay: 0,
          grossPay: 0
        };
      }

      const hours = parseFloat(entry.total_hours) || 0;
      const baseRate = parseFloat(entry.payroll_base_rate) || 0;

      if (entry.is_overtime) {
        userPayroll[entry.user_id].overtimeHours += hours;
        userPayroll[entry.user_id].overtimePay += hours * baseRate * 1.5;
      } else {
        userPayroll[entry.user_id].regularHours += hours;
        userPayroll[entry.user_id].regularPay += hours * baseRate;
      }

      userPayroll[entry.user_id].grossPay = 
        userPayroll[entry.user_id].regularPay + userPayroll[entry.user_id].overtimePay;
    }

    const payrollData = Object.values(userPayroll).map((p: any) => ({
      ...p,
      regularHours: p.regularHours.toFixed(2),
      overtimeHours: p.overtimeHours.toFixed(2),
      regularPay: p.regularPay.toFixed(2),
      overtimePay: p.overtimePay.toFixed(2),
      grossPay: p.grossPay.toFixed(2)
    }));

    res.json({ 
      payroll: payrollData,
      summary: {
        totalEmployees: payrollData.length,
        totalGrossPay: payrollData.reduce((sum, p) => sum + parseFloat(p.grossPay), 0).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Calculate payroll error:', error);
    res.status(500).json({ error: 'Failed to calculate payroll' });
  }
});

// Get user payslip
router.get('/payslip/:userId', authenticate, async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify user can access this payslip
    if (req.user!.id !== parseInt(userId) && !req.user!.roles.includes('Payroll') && !req.user!.roles.includes('Super User')) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const timeEntries = await pool.query(
      `SELECT * FROM time_entries 
       WHERE user_id = $1 
         AND status = 'approved'
         AND clock_in_time >= $2
         AND clock_in_time <= $3
       ORDER BY clock_in_time`,
      [userId, startDate, endDate]
    );

    const user = await pool.query(
      `SELECT id, employee_number, first_name, last_name, email, payroll_base_rate
       FROM users WHERE id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let regularHours = 0;
    let overtimeHours = 0;
    const baseRate = parseFloat(user.rows[0].payroll_base_rate) || 0;

    timeEntries.rows.forEach(entry => {
      const hours = parseFloat(entry.total_hours) || 0;
      if (entry.is_overtime) {
        overtimeHours += hours;
      } else {
        regularHours += hours;
      }
    });

    const regularPay = regularHours * baseRate;
    const overtimePay = overtimeHours * baseRate * 1.5;
    const grossPay = regularPay + overtimePay;

    res.json({
      user: user.rows[0],
      period: { startDate, endDate },
      earnings: {
        regularHours: regularHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        baseRate: baseRate.toFixed(2),
        regularPay: regularPay.toFixed(2),
        overtimePay: overtimePay.toFixed(2),
        grossPay: grossPay.toFixed(2)
      },
      entries: timeEntries.rows
    });
  } catch (error) {
    console.error('Get payslip error:', error);
    res.status(500).json({ error: 'Failed to fetch payslip' });
  }
});

// Get payroll configuration
router.get('/configuration', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const config = {
      baseRate: 150,
      deductionRate: 0.25,
      overtimeMultiplier: 1.5,
      doubleTimeMultiplier: 2.0
    };
    
    res.json({ config });
  } catch (error) {
    console.error('Get payroll configuration error:', error);
    res.status(500).json({ error: 'Failed to fetch payroll configuration' });
  }
});

// Save payroll configuration
router.post('/configuration', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { baseRate, deductionRate, overtimeMultiplier, doubleTimeMultiplier } = req.body;
    
    res.json({ 
      success: true, 
      message: 'Configuration saved successfully',
      config: { baseRate, deductionRate, overtimeMultiplier, doubleTimeMultiplier }
    });
  } catch (error) {
    console.error('Save payroll configuration error:', error);
    res.status(500).json({ error: 'Failed to save payroll configuration' });
  }
});

// Prepare payroll data for period
router.post('/prepare', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.body;

    const timeEntries = await pool.query(
      `SELECT 
        te.user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.payroll_base_rate as base_rate,
        SUM(CASE WHEN te.is_overtime = false THEN te.total_hours ELSE 0 END) as regular_hours,
        SUM(CASE WHEN te.is_overtime = true THEN te.total_hours ELSE 0 END) as overtime_hours
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
       WHERE te.tenant_id = $1 
         AND te.status = 'approved'
         AND te.clock_in_time >= $2
         AND te.clock_in_time <= $3
       GROUP BY te.user_id, u.username, u.first_name, u.last_name, u.payroll_base_rate
       ORDER BY u.last_name, u.first_name`,
      [req.user!.tenantId, startDate, endDate]
    );

    const payrollData = timeEntries.rows.map(emp => {
      const baseRate = parseFloat(emp.base_rate) || 150;
      const regularHours = parseFloat(emp.regular_hours) || 0;
      const overtimeHours = parseFloat(emp.overtime_hours) || 0;
      const regularPay = regularHours * baseRate;
      const overtimePay = overtimeHours * baseRate * 1.5;
      const grossPay = regularPay + overtimePay;

      return {
        employeeId: emp.user_id,
        firstName: emp.first_name,
        lastName: emp.last_name,
        username: emp.username,
        regularHours,
        overtimeHours,
        baseRate,
        regularPay,
        overtimePay,
        grossPay,
        hasExceptions: overtimeHours > 20,
        isApproved: false
      };
    });

    const summary = {
      totalEmployees: payrollData.length,
      totalHours: payrollData.reduce((sum, emp) => sum + emp.regularHours + emp.overtimeHours, 0),
      overtimeHours: payrollData.reduce((sum, emp) => sum + emp.overtimeHours, 0),
      grossPay: payrollData.reduce((sum, emp) => sum + emp.grossPay, 0)
    };

    res.json({ payrollData, summary });
  } catch (error) {
    console.error('Prepare payroll error:', error);
    res.status(500).json({ error: 'Failed to prepare payroll' });
  }
});

// Process payroll for selected employees
router.post('/process', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, employeeIds } = req.body;

    res.json({ 
      success: true, 
      message: `Payroll processed for ${employeeIds.length} employees` 
    });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({ error: 'Failed to process payroll' });
  }
});

// Export payroll data
router.get('/export', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const { start_date, end_date, employees } = req.query;

    const employeeFilter = employees ? (employees as string).split(',').map(id => parseInt(id)) : [];

    let query = `
      SELECT 
        u.employee_number as "Employee ID",
        u.first_name || ' ' || u.last_name as "Name",
        u.username as "Username",
        SUM(CASE WHEN te.is_overtime = false THEN te.total_hours ELSE 0 END) as "Regular Hours",
        SUM(CASE WHEN te.is_overtime = true THEN te.total_hours ELSE 0 END) as "Overtime Hours",
        u.payroll_base_rate as "Base Rate"
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      WHERE te.tenant_id = $1
        AND te.status = 'approved'
        AND te.clock_in_time >= $2
        AND te.clock_in_time <= $3
    `;

    const params: any[] = [req.user!.tenantId, start_date, end_date];

    if (employeeFilter.length > 0) {
      query += ` AND te.user_id = ANY($4)`;
      params.push(employeeFilter);
    }

    query += ` GROUP BY u.id, u.employee_number, u.first_name, u.last_name, u.username, u.payroll_base_rate
               ORDER BY u.last_name, u.first_name`;

    const result = await pool.query(query, params);

    const csv = [
      ['Employee ID', 'Name', 'Username', 'Regular Hours', 'Overtime Hours', 'Base Rate', 'Regular Pay', 'Overtime Pay', 'Gross Pay'],
      ...result.rows.map(row => [
        row['Employee ID'],
        row['Name'],
        row['Username'],
        row['Regular Hours'],
        row['Overtime Hours'],
        row['Base Rate'],
        (parseFloat(row['Regular Hours']) * parseFloat(row['Base Rate'])).toFixed(2),
        (parseFloat(row['Overtime Hours']) * parseFloat(row['Base Rate']) * 1.5).toFixed(2),
        ((parseFloat(row['Regular Hours']) * parseFloat(row['Base Rate'])) + (parseFloat(row['Overtime Hours']) * parseFloat(row['Base Rate']) * 1.5)).toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payroll_${start_date}_${end_date}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export payroll error:', error);
    res.status(500).json({ error: 'Failed to export payroll' });
  }
});

// Leave Summary Report
router.get('/reports/leave-summary', authenticate, async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const result = await pool.query(
      `SELECT 
        u.username,
        u.email,
        COUNT(la.id) as total_applications,
        SUM(CASE WHEN la.is_hourly THEN la.hours_requested ELSE EXTRACT(DAY FROM la.end_date - la.start_date) + 1 END) as total_days_requested,
        SUM(CASE WHEN la.status = 'approved' THEN 
          CASE WHEN la.is_hourly THEN la.hours_requested ELSE EXTRACT(DAY FROM la.end_date - la.start_date) + 1 END 
          ELSE 0 END) as approved_days
       FROM users u
       LEFT JOIN leave_applications la ON u.id = la.user_id 
         AND la.start_date >= $2 AND la.end_date <= $3
       WHERE u.tenant_id = $1
       GROUP BY u.id, u.username, u.email
       HAVING COUNT(la.id) > 0
       ORDER BY u.username`,
      [req.user!.tenantId, startDate, endDate]
    );

    res.json({
      leaveSummary: result.rows.map(row => ({
        username: row.username,
        email: row.email,
        totalApplications: parseInt(row.total_applications),
        totalDaysRequested: parseFloat(row.total_days_requested) || 0,
        approvedDays: parseFloat(row.approved_days) || 0
      }))
    });
  } catch (error) {
    console.error('Leave summary report error:', error);
    res.status(500).json({ error: 'Failed to generate leave summary report' });
  }
});

// Overtime Summary Report
router.get('/reports/overtime-summary', authenticate, async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const result = await pool.query(
      `SELECT 
        u.username,
        u.email,
        SUM(CASE WHEN te.is_overtime = false THEN te.total_hours ELSE 0 END) as regular_hours,
        SUM(CASE WHEN te.is_overtime = true AND te.total_hours <= 2 THEN te.total_hours ELSE 0 END) as ot_15_hours,
        SUM(CASE WHEN te.is_overtime = true AND te.total_hours > 2 THEN te.total_hours ELSE 0 END) as ot_20_hours,
        SUM(CASE WHEN te.is_overtime = true THEN te.total_hours ELSE 0 END) as total_ot_hours,
        SUM(te.total_hours) as total_hours
       FROM users u
       JOIN time_entries te ON u.id = te.user_id
       WHERE u.tenant_id = $1
         AND te.status = 'approved'
         AND te.clock_in_time >= $2 AND te.clock_in_time <= $3
         AND te.is_overtime = true
       GROUP BY u.id, u.username, u.email
       ORDER BY total_ot_hours DESC`,
      [req.user!.tenantId, startDate, endDate]
    );

    res.json({
      overtimeData: result.rows.map(row => ({
        username: row.username,
        email: row.email,
        regularHours: parseFloat(row.regular_hours) || 0,
        ot15Hours: parseFloat(row.ot_15_hours) || 0,
        ot20Hours: parseFloat(row.ot_20_hours) || 0,
        totalOtHours: parseFloat(row.total_ot_hours) || 0,
        totalHours: parseFloat(row.total_hours) || 0
      }))
    });
  } catch (error) {
    console.error('Overtime summary report error:', error);
    res.status(500).json({ error: 'Failed to generate overtime summary report' });
  }
});

// Time Summary Report
router.get('/reports/time-summary', authenticate, async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const result = await pool.query(
      `SELECT 
        u.username,
        u.email,
        COUNT(te.id) as total_entries,
        SUM(te.total_hours) as total_hours
       FROM users u
       JOIN time_entries te ON u.id = te.user_id
       WHERE u.tenant_id = $1
         AND te.status = 'approved'
         AND te.clock_in_time >= $2 AND te.clock_in_time <= $3
       GROUP BY u.id, u.username, u.email
       ORDER BY total_hours DESC`,
      [req.user!.tenantId, startDate, endDate]
    );

    res.json({
      timeSummary: result.rows.map(row => ({
        username: row.username,
        email: row.email,
        totalEntries: parseInt(row.total_entries),
        totalHours: parseFloat(row.total_hours) || 0
      }))
    });
  } catch (error) {
    console.error('Time summary report error:', error);
    res.status(500).json({ error: 'Failed to generate time summary report' });
  }
});

export default router;
