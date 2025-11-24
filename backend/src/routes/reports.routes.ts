import { Router } from 'express';
import pool from '../db/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Attendance summary report (matching Flask template)
router.get('/attendance', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    // Default to last 30 days if no dates provided
    const endDate = end_date ? new Date(end_date as string) : new Date();
    const startDate = start_date 
      ? new Date(start_date as string) 
      : new Date(new Date().setDate(endDate.getDate() - 30));

    // Query to get employee attendance summary
    const attendanceQuery = `
      SELECT 
        u.username,
        u.email,
        COUNT(DISTINCT DATE(te.clock_in_time)) as total_days,
        COALESCE(SUM(te.total_hours), 0) as total_hours
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id 
        AND te.clock_in_time >= $2
        AND te.clock_in_time <= $3
        AND te.status = 'approved'
      WHERE u.tenant_id = $1 AND u.is_active = true
      GROUP BY u.id, u.username, u.email
      HAVING COUNT(te.id) > 0
      ORDER BY total_hours DESC
    `;

    const attendanceResult = await pool.query(attendanceQuery, [
      currentUser.tenantId,
      startDate,
      endDate
    ]);

    // Calculate summary statistics
    const totalHours = attendanceResult.rows.reduce(
      (sum, row) => sum + parseFloat(row.total_hours || '0'), 
      0
    );

    // Query to get overtime hours
    const overtimeQuery = `
      SELECT COALESCE(SUM(overtime_hours), 0) as overtime_hours
      FROM time_entries
      WHERE tenant_id = $1
        AND clock_in_time >= $2
        AND clock_in_time <= $3
        AND status = 'approved'
    `;

    const overtimeResult = await pool.query(overtimeQuery, [
      currentUser.tenantId,
      startDate,
      endDate
    ]);

    const overtimeHours = parseFloat(overtimeResult.rows[0]?.overtime_hours || '0');

    // Process attendance summary with calculated average hours
    const attendanceSummary = attendanceResult.rows.map(row => ({
      username: row.username,
      email: row.email,
      total_days: parseInt(row.total_days),
      total_hours: parseFloat(row.total_hours),
      avg_hours: parseInt(row.total_days) > 0 
        ? parseFloat(row.total_hours) / parseInt(row.total_days)
        : 0
    }));

    // Mock pay period summary (can be implemented with actual payroll data later)
    const payPeriodSummary: any[] = [];

    res.json({
      total_hours: totalHours,
      overtime_hours: overtimeHours,
      attendance_summary: attendanceSummary,
      pay_period_summary: payPeriodSummary
    });
  } catch (error) {
    console.error('Attendance report error:', error);
    res.status(500).json({ error: 'Failed to generate attendance report' });
  }
});

// Time attendance report
router.get('/time-attendance', authenticate, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, userId, departmentId } = req.query;
    const currentUser = req.user!;

    let query = `
      SELECT 
        te.id,
        te.clock_in_time,
        te.clock_out_time,
        te.total_hours,
        te.status,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.employee_number,
        d.name as department
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE te.tenant_id = $1
    `;
    
    const params: any[] = [currentUser.tenantId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND te.clock_in_time >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND te.clock_in_time <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (userId) {
      query += ` AND te.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (departmentId) {
      query += ` AND u.department_id = $${paramIndex}`;
      params.push(departmentId);
      paramIndex++;
    }

    query += ` ORDER BY te.clock_in_time DESC`;

    const result = await pool.query(query, params);

    // Calculate summary statistics
    const totalHours = result.rows.reduce((sum, row) => sum + (parseFloat(row.total_hours) || 0), 0);
    const approvedHours = result.rows
      .filter(row => row.status === 'approved')
      .reduce((sum, row) => sum + (parseFloat(row.total_hours) || 0), 0);

    res.json({
      entries: result.rows,
      summary: {
        totalEntries: result.rows.length,
        totalHours: totalHours.toFixed(2),
        approvedHours: approvedHours.toFixed(2),
        pendingEntries: result.rows.filter(r => r.status === 'pending').length
      }
    });
  } catch (error) {
    console.error('Time attendance report error:', error);
    res.status(500).json({ error: 'Failed to generate time attendance report' });
  }
});

// Leave report
router.get('/leave', authenticate, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, userId, status } = req.query;
    const currentUser = req.user!;

    let query = `
      SELECT 
        lr.id,
        lr.start_date,
        lr.end_date,
        lr.days,
        lr.leave_type,
        lr.status,
        lr.reason,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.employee_number,
        d.name as department
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE lr.tenant_id = $1
    `;
    
    const params: any[] = [currentUser.tenantId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND lr.start_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND lr.end_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (userId) {
      query += ` AND lr.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (status) {
      query += ` AND lr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY lr.start_date DESC`;

    const result = await pool.query(query, params);

    // Calculate summary
    const totalDays = result.rows.reduce((sum, row) => sum + parseFloat(row.days), 0);
    const approvedDays = result.rows
      .filter(row => row.status === 'approved')
      .reduce((sum, row) => sum + parseFloat(row.days), 0);

    res.json({
      requests: result.rows,
      summary: {
        totalRequests: result.rows.length,
        totalDays: totalDays.toFixed(1),
        approvedDays: approvedDays.toFixed(1),
        pendingRequests: result.rows.filter(r => r.status === 'pending').length
      }
    });
  } catch (error) {
    console.error('Leave report error:', error);
    res.status(500).json({ error: 'Failed to generate leave report' });
  }
});

// Payroll summary report
router.get('/payroll', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    const currentUser = req.user!;

    let query = `
      SELECT 
        u.id,
        u.employee_number,
        u.first_name,
        u.last_name,
        u.payroll_base_rate,
        d.name as department,
        COALESCE(SUM(te.total_hours), 0) as total_hours,
        COALESCE(SUM(CASE WHEN te.is_overtime THEN te.total_hours ELSE 0 END), 0) as overtime_hours
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN time_entries te ON u.id = te.user_id 
        AND te.status = 'approved'
        AND te.clock_in_time >= $2
        AND te.clock_in_time <= $3
      WHERE u.tenant_id = $1 AND u.is_active = true
      GROUP BY u.id, u.employee_number, u.first_name, u.last_name, u.payroll_base_rate, d.name
      ORDER BY u.employee_number
    `;

    const result = await pool.query(query, [
      currentUser.tenantId,
      startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate || new Date()
    ]);

    // Calculate payroll amounts
    const payrollData = result.rows.map(row => {
      const regularHours = parseFloat(row.total_hours) - parseFloat(row.overtime_hours);
      const baseRate = parseFloat(row.payroll_base_rate) || 0;
      const regularPay = regularHours * baseRate;
      const overtimePay = parseFloat(row.overtime_hours) * baseRate * 1.5;
      const grossPay = regularPay + overtimePay;

      return {
        ...row,
        regularHours: regularHours.toFixed(2),
        overtimeHours: parseFloat(row.overtime_hours).toFixed(2),
        regularPay: regularPay.toFixed(2),
        overtimePay: overtimePay.toFixed(2),
        grossPay: grossPay.toFixed(2)
      };
    });

    const totalGross = payrollData.reduce((sum, row) => sum + parseFloat(row.grossPay), 0);

    res.json({
      employees: payrollData,
      summary: {
        totalEmployees: payrollData.length,
        totalGrossPay: totalGross.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Payroll report error:', error);
    res.status(500).json({ error: 'Failed to generate payroll report' });
  }
});

// Export attendance to CSV
router.get('/export/csv', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    const endDate = end_date ? new Date(end_date as string) : new Date();
    const startDate = start_date 
      ? new Date(start_date as string) 
      : new Date(new Date().setDate(endDate.getDate() - 30));

    const query = `
      SELECT 
        u.username,
        u.email,
        u.employee_number,
        te.clock_in_time,
        te.clock_out_time,
        te.total_hours,
        te.overtime_hours,
        te.status
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      WHERE te.tenant_id = $1
        AND te.clock_in_time >= $2
        AND te.clock_in_time <= $3
      ORDER BY te.clock_in_time DESC
    `;

    const result = await pool.query(query, [currentUser.tenantId, startDate, endDate]);

    // Generate CSV
    const headers = ['Username', 'Email', 'Employee #', 'Clock In', 'Clock Out', 'Total Hours', 'Overtime Hours', 'Status'];
    const csvRows = [headers.join(',')];

    result.rows.forEach(row => {
      const values = [
        row.username,
        row.email,
        row.employee_number,
        new Date(row.clock_in_time).toISOString(),
        row.clock_out_time ? new Date(row.clock_out_time).toISOString() : '',
        row.total_hours || '0',
        row.overtime_hours || '0',
        row.status
      ];
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export payroll to CSV
router.get('/export/payroll-csv', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    const endDate = end_date ? new Date(end_date as string) : new Date();
    const startDate = start_date 
      ? new Date(start_date as string) 
      : new Date(new Date().setDate(endDate.getDate() - 30));

    const query = `
      SELECT 
        u.employee_number,
        u.first_name,
        u.last_name,
        u.payroll_base_rate,
        COALESCE(SUM(te.total_hours), 0) as total_hours,
        COALESCE(SUM(CASE WHEN te.is_overtime THEN te.total_hours ELSE 0 END), 0) as overtime_hours
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id 
        AND te.status = 'approved'
        AND te.clock_in_time >= $2
        AND te.clock_in_time <= $3
      WHERE u.tenant_id = $1 AND u.is_active = true
      GROUP BY u.id, u.employee_number, u.first_name, u.last_name, u.payroll_base_rate
      ORDER BY u.employee_number
    `;

    const result = await pool.query(query, [currentUser.tenantId, startDate, endDate]);

    // Generate CSV with payroll calculations
    const headers = ['Employee #', 'First Name', 'Last Name', 'Base Rate', 'Regular Hours', 'Overtime Hours', 'Regular Pay', 'Overtime Pay', 'Gross Pay'];
    const csvRows = [headers.join(',')];

    result.rows.forEach(row => {
      const regularHours = parseFloat(row.total_hours) - parseFloat(row.overtime_hours);
      const baseRate = parseFloat(row.payroll_base_rate) || 0;
      const regularPay = regularHours * baseRate;
      const overtimePay = parseFloat(row.overtime_hours) * baseRate * 1.5;
      const grossPay = regularPay + overtimePay;

      const values = [
        row.employee_number,
        row.first_name,
        row.last_name,
        baseRate.toFixed(2),
        regularHours.toFixed(2),
        parseFloat(row.overtime_hours).toFixed(2),
        regularPay.toFixed(2),
        overtimePay.toFixed(2),
        grossPay.toFixed(2)
      ];
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payroll-report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Payroll CSV export error:', error);
    res.status(500).json({ error: 'Failed to export payroll CSV' });
  }
});

export default router;
