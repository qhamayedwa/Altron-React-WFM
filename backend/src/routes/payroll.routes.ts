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

export default router;
