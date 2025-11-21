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
             st.name as shift_name, st.code as shift_code, st.color
      FROM schedules s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      JOIN shift_types st ON s.shift_type_id = st.id
      WHERE u.tenant_id = $1
    `;
    const params: any[] = [req.user!.tenantId];
    
    if (departmentId) {
      params.push(departmentId);
      sql += ` AND u.department_id = $${params.length}`;
    }
    
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
        userId: row.user_id,
        employeeName: `${row.first_name} ${row.last_name}`,
        employeeNumber: row.employee_number,
        department: row.department_name,
        date: row.date,
        shiftName: row.shift_name,
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        color: row.color
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
        `INSERT INTO schedules (user_id, shift_type_id, date, start_time, end_time, status, notes)
         VALUES ($1, $2, $3, $4, $5, 'scheduled', $6)
         RETURNING *`,
        [userId, shiftTypeId, date, 
         `${date} ${startTime}`, 
         `${date} ${endTime}`, 
         notes]
      );

      res.json({
        success: true,
        schedule: {
          id: result.rows[0].id,
          userId: result.rows[0].user_id,
          date: result.rows[0].date,
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
    const { date, startTime, endTime, status, notes } = req.body;
    
    const result = await query(
      `UPDATE schedules
       SET date = COALESCE($1, date),
           start_time = COALESCE($2, start_time),
           end_time = COALESCE($3, end_time),
           status = COALESCE($4, status),
           notes = COALESCE($5, notes),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [date, startTime, endTime, status, notes, id]
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

export default router;
