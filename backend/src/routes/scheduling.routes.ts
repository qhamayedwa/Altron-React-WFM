import { Router, Response } from 'express';
import { body } from 'express-validator';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

router.use(authenticate);

// Get shift types
router.get('/shift-types', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT * FROM shift_types WHERE is_active = true ORDER BY name'
    );

    res.json({
      shiftTypes: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        startTime: row.start_time,
        endTime: row.end_time,
        duration: row.duration,
        color: row.color
      }))
    });
  } catch (error) {
    console.error('Get shift types error:', error);
    res.status(500).json({ error: 'Failed to retrieve shift types' });
  }
});

// Get user's schedule
router.get('/my-schedule', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    let sql = `
      SELECT s.*, st.name as shift_name, st.code as shift_code, st.color
      FROM schedules s
      JOIN shift_types st ON s.shift_type_id = st.id
      WHERE s.user_id = $1
    `;
    const params: any[] = [req.user!.id];
    
    if (startDate) {
      params.push(startDate);
      sql += ` AND s.date >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      sql += ` AND s.date <= $${params.length}`;
    }
    
    sql += ' ORDER BY s.date, s.start_time';
    
    const result = await query(sql, params);

    res.json({
      schedules: result.rows.map(row => ({
        id: row.id,
        date: row.date,
        shiftName: row.shift_name,
        shiftCode: row.shift_code,
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        color: row.color,
        notes: row.notes
      }))
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to retrieve schedule' });
  }
});

// Manager: Get team schedule
router.get('/team-schedule', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId, startDate, endDate } = req.query;
    
    let sql = `
      SELECT s.*, u.first_name, u.last_name, u.employee_number, d.name as department_name,
             st.name as shift_name, st.description as shift_description,
             DATE(s.start_time) as schedule_date
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN shift_types st ON s.shift_type_id = st.id
      WHERE u.tenant_id = $1
    `;
    const params: any[] = [req.user!.tenantId];
    
    if (departmentId) {
      params.push(departmentId);
      sql += ` AND u.department_id = $${params.length}`;
    }
    
    if (startDate) {
      params.push(startDate);
      sql += ` AND DATE(s.start_time) >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      sql += ` AND DATE(s.start_time) <= $${params.length}`;
    }
    
    sql += ' ORDER BY s.start_time';
    
    const result = await query(sql, params);

    res.json({
      schedules: result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        employeeName: `${row.first_name} ${row.last_name}`,
        employeeNumber: row.employee_number,
        department: row.department_name,
        date: row.schedule_date,
        shiftName: row.shift_name,
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status
      }))
    });
  } catch (error) {
    console.error('Get team schedule error:', error);
    res.status(500).json({ error: 'Failed to retrieve team schedule' });
  }
});

// Manager: Create schedule
router.post(
  '/create',
  [
    body('userId').isInt(),
    body('shiftTypeId').isInt(),
    body('date').isISO8601(),
    body('startTime').matches(/^\d{2}:\d{2}$/),
    body('endTime').matches(/^\d{2}:\d{2}$/)
  ],
  requireRole('Manager', 'Super User'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, shiftTypeId, date, startTime, endTime, notes } = req.body;
      
      const result = await query(
        `INSERT INTO schedules (user_id, shift_type_id, start_time, end_time, status, notes, assigned_by_manager_id)
         VALUES ($1, $2, $3, $4, 'scheduled', $5, $6)
         RETURNING *`,
        [userId, shiftTypeId, 
         `${date} ${startTime}`, 
         `${date} ${endTime}`, 
         notes,
         req.user!.id]
      );

      res.json({
        success: true,
        schedule: {
          id: result.rows[0].id,
          userId: result.rows[0].user_id,
          date: date,
          startTime: result.rows[0].start_time,
          endTime: result.rows[0].end_time,
          status: result.rows[0].status
        }
      });
    } catch (error) {
      console.error('Create schedule error:', error);
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  }
);

// Manager: Update schedule
router.put('/:id', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, status, notes, shiftTypeId } = req.body;
    
    let updateFields: string[] = [];
    let params: any[] = [];
    let paramIndex = 0;
    
    if (date && startTime) {
      paramIndex++;
      updateFields.push(`start_time = $${paramIndex}`);
      params.push(`${date} ${startTime}`);
    }
    
    if (date && endTime) {
      paramIndex++;
      updateFields.push(`end_time = $${paramIndex}`);
      params.push(`${date} ${endTime}`);
    }
    
    if (status) {
      paramIndex++;
      updateFields.push(`status = $${paramIndex}`);
      params.push(status);
    }
    
    if (notes !== undefined) {
      paramIndex++;
      updateFields.push(`notes = $${paramIndex}`);
      params.push(notes);
    }
    
    if (shiftTypeId) {
      paramIndex++;
      updateFields.push(`shift_type_id = $${paramIndex}`);
      params.push(shiftTypeId);
    }
    
    updateFields.push('updated_at = NOW()');
    paramIndex++;
    params.push(id);
    
    const result = await query(
      `UPDATE schedules
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    res.json({
      success: true,
      schedule: result.rows[0]
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Manager: Delete schedule
router.delete('/:id', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM schedules WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Schedule deleted'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// Get single schedule by ID
router.get('/:id', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT s.*, u.first_name, u.last_name, u.username, u.email,
              st.name as shift_type_name
       FROM schedules s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN shift_types st ON s.shift_type_id = st.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }

    const schedule = result.rows[0];
    res.json({
      schedule: {
        id: schedule.id,
        userId: schedule.user_id,
        shiftTypeId: schedule.shift_type_id,
        shiftTypeName: schedule.shift_type_name,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        date: schedule.date,
        status: schedule.status,
        notes: schedule.notes,
        isActive: schedule.is_active,
        employee: {
          firstName: schedule.first_name,
          lastName: schedule.last_name,
          username: schedule.username,
          email: schedule.email,
          fullName: `${schedule.first_name || ''} ${schedule.last_name || ''}`.trim() || schedule.username
        },
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at
      }
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to retrieve schedule' });
  }
});

// ===== SHIFT TYPES CRUD ENDPOINTS =====

// Create shift type
router.post('/shift-types', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, defaultStartTime, defaultEndTime } = req.body;
    
    const result = await query(
      `INSERT INTO shift_types (name, description, default_start_time, default_end_time, is_active, tenant_id)
       VALUES ($1, $2, $3, $4, true, $5)
       RETURNING *`,
      [name, description, defaultStartTime, defaultEndTime, req.user!.tenantId]
    );

    res.json({
      success: true,
      shiftType: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        defaultStartTime: result.rows[0].default_start_time,
        defaultEndTime: result.rows[0].default_end_time,
        isActive: result.rows[0].is_active
      }
    });
  } catch (error) {
    console.error('Create shift type error:', error);
    res.status(500).json({ error: 'Failed to create shift type' });
  }
});

// Get single shift type by ID
router.get('/shift-types/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM shift_types WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Shift type not found' });
      return;
    }

    const shiftType = result.rows[0];
    res.json({
      shiftType: {
        id: shiftType.id,
        name: shiftType.name,
        description: shiftType.description,
        code: shiftType.code,
        defaultStartTime: shiftType.default_start_time,
        defaultEndTime: shiftType.default_end_time,
        duration: shiftType.duration,
        color: shiftType.color,
        isActive: shiftType.is_active,
        createdAt: shiftType.created_at,
        updatedAt: shiftType.updated_at
      }
    });
  } catch (error) {
    console.error('Get shift type error:', error);
    res.status(500).json({ error: 'Failed to retrieve shift type' });
  }
});

// Update shift type
router.put('/shift-types/:id', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, defaultStartTime, defaultEndTime, isActive } = req.body;
    
    const result = await query(
      `UPDATE shift_types
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           default_start_time = COALESCE($3, default_start_time),
           default_end_time = COALESCE($4, default_end_time),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, description, defaultStartTime, defaultEndTime, isActive, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Shift type not found' });
      return;
    }

    res.json({
      success: true,
      shiftType: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        defaultStartTime: result.rows[0].default_start_time,
        defaultEndTime: result.rows[0].default_end_time,
        isActive: result.rows[0].is_active
      }
    });
  } catch (error) {
    console.error('Update shift type error:', error);
    res.status(500).json({ error: 'Failed to update shift type' });
  }
});

// Delete shift type
router.delete('/shift-types/:id', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if shift type is in use
    const usageCheck = await query(
      'SELECT COUNT(*) as count FROM schedules WHERE shift_type_id = $1',
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      res.status(400).json({ 
        error: 'Cannot delete shift type that is in use',
        message: 'This shift type is currently being used in schedules. Please update or delete those schedules first.'
      });
      return;
    }
    
    const result = await query(
      'DELETE FROM shift_types WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Shift type not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Shift type deleted'
    });
  } catch (error) {
    console.error('Delete shift type error:', error);
    res.status(500).json({ error: 'Failed to delete shift type' });
  }
});

// Manager: Get team employees for scheduling
router.get('/team-employees', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department } = req.query;

    let sql = `
      SELECT u.id, u.first_name, u.last_name, u.username, d.name as department
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.tenant_id = $1 AND u.is_active = true
    `;
    const params: any[] = [req.user!.tenantId];

    if (department) {
      params.push(department);
      sql += ` AND d.name = $${params.length}`;
    }

    sql += ' ORDER BY u.first_name, u.last_name';

    const result = await query(sql, params);

    res.json({
      employees: result.rows.map(row => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        username: row.username,
        department: row.department
      })),
      schedules: {},
      stats: {
        totalSchedules: 0,
        totalHours: 0,
        overtimeHours: 0,
        pendingApprovals: 0
      }
    });
  } catch (error) {
    console.error('Get team employees error:', error);
    res.status(500).json({ error: 'Failed to retrieve team employees' });
  }
});

// Get employee schedule by ID
router.get('/employee-schedule/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let sql = `
      SELECT s.*, st.name as shift_name
      FROM schedules s
      JOIN shift_types st ON s.shift_type_id = st.id
      WHERE s.user_id = $1
    `;
    const params: any[] = [id];

    if (startDate) {
      params.push(startDate);
      sql += ` AND s.date >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      sql += ` AND s.date <= $${params.length}`;
    }

    sql += ' ORDER BY s.date, s.start_time';

    const result = await query(sql, params);

    const schedules = result.rows.map(row => ({
      id: row.id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      shiftType: { name: row.shift_name },
      location: row.location,
      durationHours: 8
    }));

    res.json({
      schedules,
      totalHours: schedules.length * 8,
      scheduledDays: schedules.length,
      overtimeHours: 0,
      upcomingShifts: schedules.slice(0, 5)
    });
  } catch (error) {
    console.error('Get employee schedule error:', error);
    res.status(500).json({ error: 'Failed to retrieve employee schedule' });
  }
});

// Request schedule change
router.post('/request-change', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId, changeType, date, reason, priority } = req.body;

    const result = await query(
      `INSERT INTO schedule_change_requests 
       (employee_id, change_type, date, reason, priority, status, created_by)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)
       RETURNING *`,
      [employeeId || req.user!.id, changeType, date, reason, priority, req.user!.id]
    );

    res.status(201).json({
      success: true,
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Request schedule change error:', error);
    res.status(500).json({ error: 'Failed to submit schedule change request' });
  }
});

// Get batch schedules
router.get('/batch/:batchId', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { batchId } = req.params;

    const result = await query(
      `SELECT s.*, u.username, u.first_name, u.last_name, d.name as department_name
       FROM schedules s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE s.batch_id = $1`,
      [batchId]
    );

    const batchSchedules = result.rows.map(row => ({
      id: row.id,
      employee: {
        id: row.user_id,
        username: row.username,
        fullName: `${row.first_name} ${row.last_name}`,
        department: row.department_name
      }
    }));

    const templateSchedule = result.rows.length > 0 ? {
      startTime: result.rows[0].start_time,
      endTime: result.rows[0].end_time,
      shiftTypeId: result.rows[0].shift_type_id,
      notes: result.rows[0].notes
    } : null;

    res.json({
      batchSchedules,
      templateSchedule
    });
  } catch (error) {
    console.error('Get batch schedules error:', error);
    res.status(500).json({ error: 'Failed to retrieve batch schedules' });
  }
});

// Update batch schedules
router.put('/batch/:batchId', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { batchId } = req.params;
    const { startDate, startTime, endTime, shiftTypeId, notes } = req.body;

    await query(
      `UPDATE schedules 
       SET date = $1, start_time = $2, end_time = $3, shift_type_id = $4, notes = $5, updated_at = NOW()
       WHERE batch_id = $6`,
      [startDate, startTime, endTime, shiftTypeId || null, notes, batchId]
    );

    res.json({
      success: true,
      message: 'Batch schedules updated successfully'
    });
  } catch (error) {
    console.error('Update batch schedules error:', error);
    res.status(500).json({ error: 'Failed to update batch schedules' });
  }
});

// Create schedule
router.post('/create', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId, date, shiftTypeId, startTime, endTime, location, notes, recurring } = req.body;

    const result = await query(
      `INSERT INTO schedules 
       (user_id, date, shift_type_id, start_time, end_time, location, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [employeeId, date, shiftTypeId, startTime, endTime, location, notes, req.user!.id]
    );

    res.status(201).json({
      success: true,
      schedule: result.rows[0]
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

export default router;
