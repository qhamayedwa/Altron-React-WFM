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
      SELECT te.*, u.first_name, u.last_name, u.employee_number, d.name as department_name
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      LEFT JOIN departments d ON te.department_id = d.id
      WHERE te.tenant_id = $1
    `;
    const params: any[] = [req.user!.tenantId];
    
    if (departmentId) {
      params.push(departmentId);
      sql += ` AND te.department_id = $${params.length}`;
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
        employeeName: `${row.first_name} ${row.last_name}`,
        employeeNumber: row.employee_number,
        department: row.department_name,
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
      totalHours: entry.total_hours ? parseFloat(entry.total_hours.toFixed(2)) : null,
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

export default router;
