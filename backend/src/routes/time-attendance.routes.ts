import { Router, Response } from 'express';
import { body } from 'express-validator';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Clock In
router.post(
  '/clock-in',
  [
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { latitude, longitude } = req.body;
      
      const result = await query(
        `INSERT INTO time_entries (user_id, clock_in_time, clock_in_latitude, clock_in_longitude, status)
         VALUES ($1, NOW(), $2, $3, 'clocked_in')
         RETURNING *`,
        [req.user!.id, latitude, longitude]
      );

      res.json({
        success: true,
        timeEntry: {
          id: result.rows[0].id,
          clockInTime: result.rows[0].clock_in_time,
          status: result.rows[0].status
        }
      });
    } catch (error) {
      console.error('Clock in error:', error);
      res.status(500).json({ error: 'Failed to clock in' });
    }
  }
);

// Clock Out
router.post(
  '/clock-out/:id',
  [
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat(),
    body('breakMinutes').optional().isInt()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { latitude, longitude, breakMinutes = 0 } = req.body;

      const result = await query(
        `UPDATE time_entries
         SET clock_out_time = NOW(),
             clock_out_latitude = $1,
             clock_out_longitude = $2,
             break_minutes = $3,
             total_hours = EXTRACT(EPOCH FROM (NOW() - clock_in_time)) / 3600.0 - ($3 / 60.0),
             status = 'clocked_out'
         WHERE id = $4 AND user_id = $5 AND clock_out_time IS NULL
         RETURNING *`,
        [latitude, longitude, breakMinutes, id, req.user!.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Time entry not found or already clocked out' });
        return;
      }

      res.json({
        success: true,
        timeEntry: {
          id: result.rows[0].id,
          clockInTime: result.rows[0].clock_in_time,
          clockOutTime: result.rows[0].clock_out_time,
          totalHours: result.rows[0].total_hours,
          status: result.rows[0].status
        }
      });
    } catch (error) {
      console.error('Clock out error:', error);
      res.status(500).json({ error: 'Failed to clock out' });
    }
  }
);

// Get user's time entries
router.get('/entries', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let sql = `SELECT * FROM time_entries WHERE user_id = $1`;
    const params: any[] = [req.user!.id];
    
    if (startDate) {
      params.push(startDate);
      sql += ` AND clock_in_time >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      sql += ` AND clock_in_time <= $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    
    sql += ' ORDER BY clock_in_time DESC LIMIT 100';
    
    const result = await query(sql, params);

    res.json({
      timeEntries: result.rows.map(row => ({
        id: row.id,
        clockInTime: row.clock_in_time,
        clockOutTime: row.clock_out_time,
        breakMinutes: row.break_minutes,
        totalHours: row.total_hours,
        status: row.status,
        approvedBy: row.approved_by,
        approvedAt: row.approved_at
      }))
    });
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ error: 'Failed to retrieve time entries' });
  }
});

// Manager: Get team time entries
router.get('/team-entries', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId, status, startDate, endDate } = req.query;
    
    let sql = `
      SELECT te.*, u.first_name, u.last_name, u.employee_number, u.username, 
             d.name as department_name,
             CASE 
               WHEN te.clock_out_time IS NOT NULL THEN 
                 EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0
               ELSE 0 
             END as total_hours
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.tenant_id = $1
    `;
    const params: any[] = [req.user!.tenantId];
    
    if (departmentId) {
      params.push(departmentId);
      sql += ` AND u.department_id = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      sql += ` AND te.status = $${params.length}`;
    }
    
    if (startDate) {
      params.push(startDate);
      sql += ` AND te.clock_in_time >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      sql += ` AND te.clock_in_time <= $${params.length}`;
    }
    
    sql += ' ORDER BY te.clock_in_time DESC LIMIT 500';
    
    const result = await query(sql, params);

    res.json({
      timeEntries: result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        employeeName: `${row.first_name} ${row.last_name}`,
        employeeNumber: row.employee_number,
        employee_number: row.employee_number,
        department: row.department_name,
        department_name: row.department_name,
        clockInTime: row.clock_in_time,
        clock_in_time: row.clock_in_time,
        clockOutTime: row.clock_out_time,
        clock_out_time: row.clock_out_time,
        breakMinutes: row.total_break_minutes || 0,
        break_minutes: row.total_break_minutes || 0,
        totalHours: parseFloat(row.total_hours) || 0,
        total_hours: parseFloat(row.total_hours) || 0,
        status: row.status,
        approvedBy: row.approved_by_manager_id,
        approved_by: row.approved_by_manager_id,
        notes: row.notes
      }))
    });
  } catch (error) {
    console.error('Get team entries error:', error);
    res.status(500).json({ error: 'Failed to retrieve team time entries' });
  }
});

// Manager: Approve time entry
router.post('/approve/:id', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `UPDATE time_entries
       SET status = 'approved', approved_by = $1, approved_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.user!.id, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Time entry not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Time entry approved'
    });
  } catch (error) {
    console.error('Approve time entry error:', error);
    res.status(500).json({ error: 'Failed to approve time entry' });
  }
});

// Manual Time Entry (Admin/Manager)
router.post(
  '/manual-entry',
  [
    body('userId').isInt().withMessage('User ID is required'),
    body('clockInTime').notEmpty().withMessage('Clock in time is required'),
    body('clockOutTime').optional(),
    body('notes').optional(),
    body('approveOvertime').optional().isBoolean()
  ],
  requireRole('Admin', 'Manager', 'Super User'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, clockInTime, clockOutTime, notes, approveOvertime } = req.body;

      // Check if user exists
      const userResult = await query(
        'SELECT id FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Insert manual time entry (respects the clockInTime date for backdating)
      const result = await query(
        `INSERT INTO time_entries (
          user_id, clock_in_time, clock_out_time,
          status, notes, is_overtime_approved,
          approved_by_manager_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          userId,
          clockInTime,
          clockOutTime || null,
          clockOutTime ? 'approved' : 'clocked_in',
          notes || null,
          approveOvertime || false,
          req.user!.id
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Manual time entry created successfully',
        timeEntry: result.rows[0]
      });
    } catch (error) {
      console.error('Manual time entry error:', error);
      res.status(500).json({ error: 'Failed to create manual time entry' });
    }
  }
);

// Export team time entries to CSV
router.get('/team-entries/export', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId, status, startDate, endDate } = req.query;
    
    let sql = `
      SELECT 
        u.username,
        u.first_name,
        u.last_name,
        u.employee_number,
        u.email,
        d.name as department_name,
        te.clock_in_time,
        te.clock_out_time,
        te.total_break_minutes,
        CASE WHEN te.clock_out_time IS NOT NULL 
          THEN ROUND(CAST(EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 AS numeric), 2)
          ELSE 0 
        END as total_hours,
        te.status,
        te.notes
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.tenant_id = $1
    `;
    const params: any[] = [req.user!.tenantId];
    
    if (departmentId) {
      params.push(departmentId);
      sql += ` AND u.department_id = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      sql += ` AND te.status = $${params.length}`;
    }
    
    if (startDate) {
      params.push(startDate);
      sql += ` AND te.clock_in_time >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      sql += ` AND te.clock_in_time <= $${params.length}`;
    }
    
    sql += ' ORDER BY te.clock_in_time DESC';
    
    const result = await query(sql, params);

    // Generate CSV
    const headers = ['Username', 'First Name', 'Last Name', 'Employee #', 'Email', 'Department', 'Clock In', 'Clock Out', 'Break (min)', 'Total Hours', 'Status', 'Notes'];
    const csvRows = [headers.join(',')];

    result.rows.forEach(row => {
      const values = [
        `"${row.username || ''}"`,
        `"${row.first_name || ''}"`,
        `"${row.last_name || ''}"`,
        `"${row.employee_number || ''}"`,
        `"${row.email || ''}"`,
        `"${row.department_name || ''}"`,
        row.clock_in_time ? new Date(row.clock_in_time).toISOString() : '',
        row.clock_out_time ? new Date(row.clock_out_time).toISOString() : '',
        row.total_break_minutes || '0',
        row.total_hours || '0',
        row.status || '',
        `"${(row.notes || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=team-timecard-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export team entries error:', error);
    res.status(500).json({ error: 'Failed to export team time entries' });
  }
});

// Get Recent Time Entries (Admin/Manager)
router.get('/recent-entries', requireRole('Admin', 'Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT 
        te.id,
        te.user_id,
        te.clock_in_time,
        te.clock_out_time,
        te.status,
        te.notes,
        te.is_overtime_approved,
        u.username,
        u.first_name,
        u.last_name,
        EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 as total_hours
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
       ORDER BY te.clock_in_time DESC
       LIMIT 50`
    );

    const entries = result.rows.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      username: entry.username,
      employeeName: `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || entry.username,
      clockInTime: entry.clock_in_time,
      clockOutTime: entry.clock_out_time,
      totalHours: entry.total_hours ? parseFloat(parseFloat(entry.total_hours).toFixed(2)) : null,
      status: entry.status,
      notes: entry.notes,
      isOvertimeApproved: entry.is_overtime_approved
    }));

    res.json(entries);
  } catch (error) {
    console.error('Get recent entries error:', error);
    res.status(500).json({ error: 'Failed to retrieve recent entries' });
  }
});

// Get Exceptions (entries with issues that need manager attention)
router.get('/exceptions', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT 
        te.id,
        te.user_id,
        te.clock_in_time,
        te.clock_out_time,
        te.status,
        te.notes,
        te.is_overtime_approved,
        te.approved_by_manager_id,
        te.total_break_minutes,
        u.username,
        u.first_name,
        u.last_name,
        CASE 
          WHEN te.clock_out_time IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0
          ELSE 0 
        END as total_hours
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
       WHERE u.tenant_id = $1
         AND (
           te.status = 'exception'
           OR te.clock_out_time IS NULL
           OR (EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 > 10)
           OR (EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 > 8 AND te.is_overtime_approved = false)
         )
       ORDER BY te.clock_in_time DESC
       LIMIT 100`,
      [req.user!.tenantId]
    );

    const exceptions = result.rows.map(entry => {
      const totalHours = parseFloat(entry.total_hours) || 0;
      const overtimeHours = totalHours > 8 ? totalHours - 8 : 0;
      return {
        id: entry.id,
        user_id: entry.user_id,
        username: entry.username,
        first_name: entry.first_name,
        last_name: entry.last_name,
        full_name: `${entry.first_name || ''} ${entry.last_name || ''}`.trim(),
        work_date: entry.clock_in_time,
        clock_in_time: entry.clock_in_time,
        clock_out_time: entry.clock_out_time,
        total_hours: totalHours,
        overtime_hours: overtimeHours,
        status: entry.status,
        notes: entry.notes,
        is_overtime: totalHours > 8,
        is_overtime_approved: entry.is_overtime_approved || false,
        approved_by_manager_id: entry.approved_by_manager_id
      };
    });

    res.json({ exceptions });
  } catch (error) {
    console.error('Get exceptions error:', error);
    res.status(500).json({ error: 'Failed to retrieve exceptions' });
  }
});

// Approve overtime for a time entry
router.post('/approve-overtime/:id', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `UPDATE time_entries
       SET is_overtime_approved = true, approved_by_manager_id = $1
       WHERE id = $2
       RETURNING *`,
      [req.user!.id, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Time entry not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Overtime approved successfully'
    });
  } catch (error) {
    console.error('Approve overtime error:', error);
    res.status(500).json({ error: 'Failed to approve overtime' });
  }
});

// Add clock out time to a time entry
router.post('/add-clock-out/:id', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { clockOutTime, notes } = req.body;
    
    const result = await query(
      `UPDATE time_entries
       SET clock_out_time = $1, 
           notes = COALESCE(notes, '') || ' ' || COALESCE($2, ''),
           status = 'approved',
           approved_by_manager_id = $3
       WHERE id = $4 AND clock_out_time IS NULL
       RETURNING *`,
      [clockOutTime, notes, req.user!.id, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Time entry not found or already has clock out time' });
      return;
    }

    res.json({
      success: true,
      message: 'Clock out time added successfully'
    });
  } catch (error) {
    console.error('Add clock out error:', error);
    res.status(500).json({ error: 'Failed to add clock out time' });
  }
});

// Add note to a time entry
router.post('/add-note/:id', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    const result = await query(
      `UPDATE time_entries
       SET notes = COALESCE(notes, '') || ' [Manager Note: ' || $1 || ']'
       WHERE id = $2
       RETURNING *`,
      [note, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Time entry not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Get employee timecards with comprehensive data
router.get('/employee-timecards', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_id, start_date, end_date, page = '1', per_page = '20', summary_group = 'pay_code' } = req.query;
    const pageNum = parseInt(page as string);
    const perPageNum = parseInt(per_page as string);
    const offset = (pageNum - 1) * perPageNum;
    
    // Default to last 30 days if no dates provided
    const today = new Date();
    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(today.getDate() - 30);
    
    const startDateStr = (start_date as string) || defaultStartDate.toISOString().split('T')[0];
    const endDateStr = (end_date as string) || today.toISOString().split('T')[0];
    
    // Build the main query for timecard records
    let whereConditions = [`DATE(te.clock_in_time) >= $1`, `DATE(te.clock_in_time) <= $2`];
    const params: any[] = [startDateStr, endDateStr];
    let paramIndex = 2;
    
    // Filter by specific user if provided
    if (user_id) {
      paramIndex++;
      whereConditions.push(`te.user_id = $${paramIndex}`);
      params.push(user_id);
    }
    
    // For managers, filter by managed departments (unless Super User)
    const isSuperUser = req.user!.roles?.includes('Super User');
    if (!isSuperUser) {
      const managedDepts = await query(
        `SELECT id FROM departments WHERE manager_id = $1`,
        [req.user!.id]
      );
      if (managedDepts.rows.length > 0) {
        const deptIds = managedDepts.rows.map(d => d.id);
        paramIndex++;
        whereConditions.push(`u.department_id = ANY($${paramIndex})`);
        params.push(deptIds);
      } else {
        // No managed departments, return empty
        res.json({
          timecards: [],
          pagination: { total: 0, page: pageNum, per_page: perPageNum, pages: 0 },
          summary: { total_records: 0, total_hours: 0, total_amount: 0, absences: 0 },
          pay_code_summary: []
        });
        return;
      }
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);
    
    // Get timecard records with user, department, and schedule info
    const timecardResult = await query(
      `SELECT 
        te.id,
        te.user_id,
        te.clock_in_time,
        te.clock_out_time,
        te.total_break_minutes,
        te.status,
        te.notes,
        te.clock_in_latitude,
        te.clock_in_longitude,
        te.clock_out_latitude,
        te.clock_out_longitude,
        COALESCE(EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0, 0) as total_hours,
        u.username,
        u.first_name,
        u.last_name,
        u.employee_number,
        u.hourly_rate,
        u.pay_code,
        d.id as department_id,
        d.name as department_name,
        DATE(te.clock_in_time) as entry_date
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE ${whereClause}
       ORDER BY te.clock_in_time DESC
       LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`,
      [...params, perPageNum, offset]
    );
    
    // Calculate summary stats
    const summaryResult = await query(
      `SELECT 
        COUNT(*) as total_records,
        COALESCE(SUM(EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0), 0) as total_hours,
        COALESCE(SUM(
          (EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0) * COALESCE(u.hourly_rate, 0)
        ), 0) as total_amount
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE ${whereClause} AND te.clock_out_time IS NOT NULL`,
      params
    );
    
    // Get absence count (leave applications in the date range)
    const absenceResult = await query(
      `SELECT COUNT(*) as absences
       FROM leave_applications la
       JOIN users u ON la.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE la.start_date <= $2 AND la.end_date >= $1 
         AND la.status = 'approved'
         ${user_id ? `AND la.user_id = $${paramIndex}` : ''}`,
      user_id ? [startDateStr, endDateStr, user_id] : [startDateStr, endDateStr]
    );
    
    // Get pay code summary
    let payCodeSummary: any[] = [];
    
    if (summary_group === 'pay_code') {
      const payCodeResult = await query(
        `SELECT 
          COALESCE(u.pay_code, 'Standard') as pay_code,
          COALESCE(u.hourly_rate, 0) as rate,
          COUNT(DISTINCT u.id) as employee_count,
          COALESCE(SUM(EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0), 0) as total_hours,
          COALESCE(SUM(
            (EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0) * COALESCE(u.hourly_rate, 0)
          ), 0) as total_amount
         FROM time_entries te
         JOIN users u ON te.user_id = u.id
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE ${whereClause} AND te.clock_out_time IS NOT NULL
         GROUP BY u.pay_code, u.hourly_rate
         ORDER BY total_amount DESC`,
        params
      );
      payCodeSummary = payCodeResult.rows;
    } else if (summary_group === 'employee') {
      const employeeSummaryResult = await query(
        `SELECT 
          u.id as user_id,
          u.username,
          u.first_name,
          u.last_name,
          d.name as department_name,
          COALESCE(u.pay_code, 'Standard') as pay_code,
          COALESCE(SUM(EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0), 0) as total_hours,
          COALESCE(SUM(
            (EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0) * COALESCE(u.hourly_rate, 0)
          ), 0) as total_amount
         FROM time_entries te
         JOIN users u ON te.user_id = u.id
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE ${whereClause} AND te.clock_out_time IS NOT NULL
         GROUP BY u.id, u.username, u.first_name, u.last_name, d.name, u.pay_code
         ORDER BY total_amount DESC`,
        params
      );
      payCodeSummary = employeeSummaryResult.rows;
    } else if (summary_group === 'department') {
      const deptSummaryResult = await query(
        `SELECT 
          d.id as department_id,
          d.name as department_name,
          COUNT(DISTINCT u.id) as employee_count,
          COALESCE(SUM(EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0), 0) as total_hours,
          COALESCE(SUM(
            (EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - COALESCE(te.total_break_minutes, 0) / 60.0) * COALESCE(u.hourly_rate, 0)
          ), 0) as total_amount
         FROM time_entries te
         JOIN users u ON te.user_id = u.id
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE ${whereClause} AND te.clock_out_time IS NOT NULL
         GROUP BY d.id, d.name
         ORDER BY total_amount DESC`,
        params
      );
      payCodeSummary = deptSummaryResult.rows;
    }
    
    // Format timecard records
    const timecards = timecardResult.rows.map(row => {
      const totalHours = parseFloat(row.total_hours) || 0;
      const hourlyRate = parseFloat(row.hourly_rate) || 0;
      const amountEarned = totalHours * hourlyRate;
      
      return {
        id: row.id,
        user_id: row.user_id,
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        full_name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.username,
        employee_number: row.employee_number,
        department: row.department_name,
        department_id: row.department_id,
        date: row.entry_date,
        clock_in: row.clock_in_time,
        clock_out: row.clock_out_time,
        break_minutes: row.break_minutes || 0,
        total_hours: totalHours,
        hourly_rate: hourlyRate,
        pay_code: row.pay_code || 'Standard',
        amount_earned: amountEarned,
        status: row.status,
        notes: row.notes,
        clock_in_location: row.clock_in_latitude && row.clock_in_longitude 
          ? { lat: row.clock_in_latitude, lng: row.clock_in_longitude }
          : null,
        clock_out_location: row.clock_out_latitude && row.clock_out_longitude
          ? { lat: row.clock_out_latitude, lng: row.clock_out_longitude }
          : null
      };
    });
    
    res.json({
      timecards,
      pagination: {
        total,
        page: pageNum,
        per_page: perPageNum,
        pages: Math.ceil(total / perPageNum),
        has_prev: pageNum > 1,
        has_next: pageNum < Math.ceil(total / perPageNum)
      },
      summary: {
        total_records: parseInt(summaryResult.rows[0]?.total_records) || 0,
        total_hours: parseFloat(summaryResult.rows[0]?.total_hours) || 0,
        total_amount: parseFloat(summaryResult.rows[0]?.total_amount) || 0,
        absences: parseInt(absenceResult.rows[0]?.absences) || 0
      },
      pay_code_summary: payCodeSummary.map(row => ({
        ...row,
        total_hours: parseFloat(row.total_hours) || 0,
        total_amount: parseFloat(row.total_amount) || 0,
        rate: parseFloat(row.rate) || 0,
        employee_count: parseInt(row.employee_count) || 0
      })),
      date_range: {
        start_date: startDateStr,
        end_date: endDateStr
      }
    });
  } catch (error) {
    console.error('Get employee timecards error:', error);
    res.status(500).json({ error: 'Failed to retrieve employee timecards' });
  }
});

// Get schedules for a user in a date range
router.get('/schedules', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user_id, start_date, end_date } = req.query;
    
    let whereConditions = ['1=1'];
    const params: any[] = [];
    let paramIndex = 0;
    
    if (user_id) {
      paramIndex++;
      whereConditions.push(`s.user_id = $${paramIndex}`);
      params.push(user_id);
    } else {
      paramIndex++;
      whereConditions.push(`s.user_id = $${paramIndex}`);
      params.push(req.user!.id);
    }
    
    if (start_date) {
      paramIndex++;
      whereConditions.push(`s.date >= $${paramIndex}`);
      params.push(start_date);
    }
    
    if (end_date) {
      paramIndex++;
      whereConditions.push(`s.date <= $${paramIndex}`);
      params.push(end_date);
    }
    
    const result = await query(
      `SELECT 
        s.*,
        st.name as shift_type_name,
        st.start_time as shift_start_time,
        st.end_time as shift_end_time
       FROM schedules s
       LEFT JOIN shift_types st ON s.shift_type_id = st.id
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY s.date ASC`,
      params
    );
    
    res.json({
      schedules: result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        date: row.date,
        shift_type: row.shift_type_name,
        start_time: row.shift_start_time || row.start_time,
        end_time: row.shift_end_time || row.end_time,
        notes: row.notes
      }))
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Failed to retrieve schedules' });
  }
});

export default router;
