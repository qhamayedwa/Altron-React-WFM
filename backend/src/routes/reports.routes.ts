import { Router } from 'express';
import pool from '../db/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Summary report - employee totals
router.get('/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    const query = `
      SELECT 
        u.username,
        COUNT(te.id) as total_entries,
        COALESCE(SUM(te.total_hours), 0) as total_hours,
        COALESCE(SUM(CASE WHEN te.is_overtime THEN te.total_hours ELSE 0 END), 0) as overtime_hours
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id 
        AND te.status IN ('approved', 'pending', 'clocked_out')
        ${start_date ? `AND te.clock_in_time >= $2` : ''}
        ${end_date ? `AND te.clock_in_time <= $${start_date ? '3' : '2'}` : ''}
      WHERE u.tenant_id = $1 AND u.is_active = true
      GROUP BY u.id, u.username
      HAVING COUNT(te.id) > 0
      ORDER BY total_hours DESC
    `;

    const params: any[] = [currentUser.tenantId];
    if (start_date) params.push(start_date);
    if (end_date) params.push(end_date);

    const result = await pool.query(query, params);

    res.json({
      entries: result.rows.map(row => ({
        username: row.username,
        total_entries: parseInt(row.total_entries),
        total_hours: parseFloat(row.total_hours),
        overtime_hours: parseFloat(row.overtime_hours)
      })),
      summary: {
        total_hours: result.rows.reduce((sum, r) => sum + parseFloat(r.total_hours), 0),
        overtime_hours: result.rows.reduce((sum, r) => sum + parseFloat(r.overtime_hours), 0),
        total_entries: result.rows.reduce((sum, r) => sum + parseInt(r.total_entries), 0),
        avg_hours: result.rows.length > 0 ? result.rows.reduce((sum, r) => sum + parseFloat(r.total_hours), 0) / result.rows.length : 0
      }
    });
  } catch (error) {
    console.error('Summary report error:', error);
    res.status(500).json({ error: 'Failed to generate summary report' });
  }
});

// Detailed report - all time entries
router.get('/detailed', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    const query = `
      SELECT 
        te.id,
        te.clock_in_time,
        te.clock_out_time,
        te.total_hours,
        te.overtime_hours,
        te.total_break_minutes,
        te.status,
        te.notes,
        DATE(te.clock_in_time) as work_date,
        u.username,
        json_build_object('username', u.username) as employee
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      WHERE te.tenant_id = $1
        ${start_date ? `AND te.clock_in_time >= $2` : ''}
        ${end_date ? `AND te.clock_in_time <= $${start_date ? '3' : '2'}` : ''}
      ORDER BY te.clock_in_time DESC
      LIMIT 500
    `;

    const params: any[] = [currentUser.tenantId];
    if (start_date) params.push(start_date);
    if (end_date) params.push(end_date);

    const result = await pool.query(query, params);

    res.json({
      entries: result.rows.map(row => ({
        ...row,
        total_hours: parseFloat(row.total_hours) || 0,
        overtime_hours: parseFloat(row.overtime_hours) || 0
      })),
      summary: {
        total_hours: result.rows.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0),
        overtime_hours: result.rows.reduce((sum, r) => sum + (parseFloat(r.overtime_hours) || 0), 0),
        total_entries: result.rows.length,
        avg_hours: result.rows.length > 0 ? result.rows.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0) / result.rows.length : 0
      }
    });
  } catch (error) {
    console.error('Detailed report error:', error);
    res.status(500).json({ error: 'Failed to generate detailed report' });
  }
});

// Overtime report
router.get('/overtime', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    const query = `
      SELECT 
        te.id,
        te.clock_in_time,
        te.clock_out_time,
        te.total_hours,
        te.overtime_hours,
        te.total_break_minutes,
        te.status,
        te.notes,
        DATE(te.clock_in_time) as work_date,
        u.username,
        json_build_object('username', u.username) as employee
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      WHERE te.tenant_id = $1
        AND te.is_overtime = true
        AND te.overtime_hours > 0
        ${start_date ? `AND te.clock_in_time >= $2` : ''}
        ${end_date ? `AND te.clock_in_time <= $${start_date ? '3' : '2'}` : ''}
      ORDER BY te.overtime_hours DESC, te.clock_in_time DESC
      LIMIT 500
    `;

    const params: any[] = [currentUser.tenantId];
    if (start_date) params.push(start_date);
    if (end_date) params.push(end_date);

    const result = await pool.query(query, params);

    res.json({
      entries: result.rows.map(row => ({
        ...row,
        total_hours: parseFloat(row.total_hours) || 0,
        overtime_hours: parseFloat(row.overtime_hours) || 0
      })),
      summary: {
        total_hours: result.rows.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0),
        overtime_hours: result.rows.reduce((sum, r) => sum + (parseFloat(r.overtime_hours) || 0), 0),
        total_entries: result.rows.length,
        avg_hours: result.rows.length > 0 ? result.rows.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0) / result.rows.length : 0
      }
    });
  } catch (error) {
    console.error('Overtime report error:', error);
    res.status(500).json({ error: 'Failed to generate overtime report' });
  }
});

// Exceptions report - incomplete or problematic entries
router.get('/exceptions', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    const query = `
      SELECT 
        te.id,
        te.clock_in_time,
        te.clock_out_time,
        te.total_hours,
        te.overtime_hours,
        te.total_break_minutes,
        te.status,
        te.notes,
        DATE(te.clock_in_time) as work_date,
        u.username,
        json_build_object('username', u.username) as employee
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      WHERE te.tenant_id = $1
        AND (
          te.clock_out_time IS NULL 
          OR te.total_hours < 0 
          OR te.total_hours > 24
          OR te.status = 'pending'
        )
        ${start_date ? `AND te.clock_in_time >= $2` : ''}
        ${end_date ? `AND te.clock_in_time <= $${start_date ? '3' : '2'}` : ''}
      ORDER BY te.clock_in_time DESC
      LIMIT 500
    `;

    const params: any[] = [currentUser.tenantId];
    if (start_date) params.push(start_date);
    if (end_date) params.push(end_date);

    const result = await pool.query(query, params);

    res.json({
      entries: result.rows.map(row => ({
        ...row,
        total_hours: parseFloat(row.total_hours) || 0,
        overtime_hours: parseFloat(row.overtime_hours) || 0
      })),
      summary: {
        total_hours: result.rows.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0),
        overtime_hours: result.rows.reduce((sum, r) => sum + (parseFloat(r.overtime_hours) || 0), 0),
        total_entries: result.rows.length,
        avg_hours: result.rows.length > 0 ? result.rows.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0) / result.rows.length : 0
      }
    });
  } catch (error) {
    console.error('Exceptions report error:', error);
    res.status(500).json({ error: 'Failed to generate exceptions report' });
  }
});

// Attendance summary report (matches Flask reports.html)
router.get('/attendance', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    // Get employee attendance summary
    const summaryQuery = `
      SELECT 
        u.id,
        u.username,
        u.email,
        COUNT(DISTINCT DATE(te.clock_in_time)) as total_days,
        COALESCE(SUM(te.total_hours), 0) as total_hours,
        COALESCE(AVG(te.total_hours), 0) as avg_hours
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id 
        AND te.status IN ('approved', 'pending')
        ${start_date ? `AND te.clock_in_time >= $2` : ''}
        ${end_date ? `AND te.clock_in_time <= $${start_date ? '3' : '2'}` : ''}
      WHERE u.tenant_id = $1 AND u.is_active = true
      GROUP BY u.id, u.username, u.email
      HAVING COUNT(te.id) > 0
      ORDER BY total_hours DESC
    `;

    const summaryParams: any[] = [currentUser.tenantId];
    if (start_date) summaryParams.push(start_date);
    if (end_date) summaryParams.push(end_date);

    const summaryResult = await pool.query(summaryQuery, summaryParams);

    // Calculate total hours and overtime
    const totalHoursQuery = `
      SELECT 
        COALESCE(SUM(total_hours), 0) as total_hours,
        COALESCE(SUM(CASE WHEN is_overtime THEN total_hours ELSE 0 END), 0) as overtime_hours
      FROM time_entries
      WHERE tenant_id = $1
        AND status IN ('approved', 'pending')
        ${start_date ? `AND clock_in_time >= $2` : ''}
        ${end_date ? `AND clock_in_time <= $${start_date ? '3' : '2'}` : ''}
    `;

    const totalsResult = await pool.query(totalHoursQuery, summaryParams);

    // Get pay period summary (if applicable)
    const payPeriodQuery = `
      SELECT 
        DATE_TRUNC('week', clock_in_time) as period_start,
        DATE_TRUNC('week', clock_in_time) + INTERVAL '6 days' as period_end,
        SUM(CASE WHEN NOT is_overtime THEN total_hours ELSE 0 END) as regular_hours,
        SUM(CASE WHEN is_overtime THEN total_hours ELSE 0 END) as overtime_hours,
        SUM(total_hours) as total_hours,
        SUM(
          CASE WHEN NOT is_overtime THEN total_hours * COALESCE(u.payroll_base_rate, 0)
          ELSE total_hours * COALESCE(u.payroll_base_rate, 0) * 1.5 END
        ) as gross_pay
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      WHERE te.tenant_id = $1
        AND te.status = 'approved'
        ${start_date ? `AND te.clock_in_time >= $2` : ''}
        ${end_date ? `AND te.clock_in_time <= $${start_date ? '3' : '2'}` : ''}
      GROUP BY DATE_TRUNC('week', clock_in_time)
      ORDER BY period_start DESC
      LIMIT 4
    `;

    const payPeriodResult = await pool.query(payPeriodQuery, summaryParams);

    res.json({
      total_hours: parseFloat(totalsResult.rows[0]?.total_hours || 0),
      overtime_hours: parseFloat(totalsResult.rows[0]?.overtime_hours || 0),
      attendance_summary: summaryResult.rows.map(row => ({
        username: row.username,
        email: row.email,
        total_days: parseInt(row.total_days),
        total_hours: parseFloat(row.total_hours),
        avg_hours: parseFloat(row.avg_hours)
      })),
      pay_period_summary: payPeriodResult.rows.map(row => ({
        period_start: row.period_start,
        period_end: row.period_end,
        regular_hours: parseFloat(row.regular_hours),
        overtime_hours: parseFloat(row.overtime_hours),
        total_hours: parseFloat(row.total_hours),
        gross_pay: parseFloat(row.gross_pay)
      }))
    });
  } catch (error) {
    console.error('Attendance summary report error:', error);
    res.status(500).json({ error: 'Failed to generate attendance summary report' });
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
router.get('/export-attendance-csv', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    const query = `
      SELECT 
        u.employee_number,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        DATE(te.clock_in_time) as work_date,
        te.clock_in_time,
        te.clock_out_time,
        te.total_hours,
        te.status,
        d.name as department
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE te.tenant_id = $1
        ${start_date ? `AND te.clock_in_time >= $2` : ''}
        ${end_date ? `AND te.clock_in_time <= $${start_date ? '3' : '2'}` : ''}
      ORDER BY work_date DESC, u.last_name, u.first_name
    `;

    const params: any[] = [currentUser.tenantId];
    if (start_date) params.push(start_date);
    if (end_date) params.push(end_date);

    const result = await pool.query(query, params);

    // Create CSV content
    const headers = ['Employee Number', 'Username', 'First Name', 'Last Name', 'Email', 'Department', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status'];
    const rows = result.rows.map(row => [
      row.employee_number || '',
      row.username,
      row.first_name || '',
      row.last_name || '',
      row.email,
      row.department || '',
      new Date(row.work_date).toLocaleDateString(),
      new Date(row.clock_in_time).toLocaleTimeString(),
      row.clock_out_time ? new Date(row.clock_out_time).toLocaleTimeString() : '',
      row.total_hours || '',
      row.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${start_date || 'all'}_${end_date || 'all'}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export attendance CSV error:', error);
    res.status(500).json({ error: 'Failed to export attendance to CSV' });
  }
});

// Export payroll to CSV
router.get('/export-payroll-csv', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    const query = `
      SELECT 
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
        ${start_date ? `AND te.clock_in_time >= $2` : ''}
        ${end_date ? `AND te.clock_in_time <= $${start_date ? '3' : '2'}` : ''}
      WHERE u.tenant_id = $1 AND u.is_active = true
      GROUP BY u.id, u.employee_number, u.first_name, u.last_name, u.payroll_base_rate, d.name
      ORDER BY u.employee_number
    `;

    const params: any[] = [currentUser.tenantId];
    if (start_date) params.push(start_date);
    if (end_date) params.push(end_date);

    const result = await pool.query(query, params);

    // Create CSV content with payroll calculations
    const headers = ['Employee Number', 'First Name', 'Last Name', 'Department', 'Base Rate', 'Regular Hours', 'Overtime Hours', 'Total Hours', 'Regular Pay', 'Overtime Pay', 'Gross Pay'];
    const rows = result.rows.map(row => {
      const regularHours = parseFloat(row.total_hours) - parseFloat(row.overtime_hours);
      const baseRate = parseFloat(row.payroll_base_rate) || 0;
      const regularPay = regularHours * baseRate;
      const overtimePay = parseFloat(row.overtime_hours) * baseRate * 1.5;
      const grossPay = regularPay + overtimePay;

      return [
        row.employee_number || '',
        row.first_name || '',
        row.last_name || '',
        row.department || '',
        baseRate.toFixed(2),
        regularHours.toFixed(2),
        parseFloat(row.overtime_hours).toFixed(2),
        parseFloat(row.total_hours).toFixed(2),
        regularPay.toFixed(2),
        overtimePay.toFixed(2),
        grossPay.toFixed(2)
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payroll_report_${start_date || 'all'}_${end_date || 'all'}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export payroll CSV error:', error);
    res.status(500).json({ error: 'Failed to export payroll to CSV' });
  }
});

export default router;
