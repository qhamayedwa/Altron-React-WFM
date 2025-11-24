import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

// Get current clock status
router.get('/current-status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await query(
      `SELECT id, clock_in_time, clock_out_time, status, break_start_time, break_end_time
       FROM time_entries 
       WHERE user_id = $1 AND status = 'Open'
       ORDER BY clock_in_time DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length > 0) {
      const entry = result.rows[0];
      res.json({
        status: 'clocked_in',
        entry_id: entry.id,
        clock_in_time: entry.clock_in_time,
        on_break: entry.break_start_time && !entry.break_end_time,
        break_start_time: entry.break_start_time
      });
      return;
    } else {
      res.json({
        status: 'clocked_out'
      });
      return;
    }
  } catch (error) {
    console.error('Error getting current status:', error);
    res.status(500).json({ error: 'Failed to get current status' });
    return;
  }
});

// Clock in
router.post('/clock-in', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { latitude, longitude, notes } = req.body;

    // Check if user already has an open time entry
    const openEntry = await query(
      'SELECT id FROM time_entries WHERE user_id = $1 AND status = $2',
      [userId, 'Open']
    );

    if (openEntry.rows.length > 0) {
      res.status(400).json({ 
        success: false,
        error: 'You already have an open time entry. Please clock out first.' 
      });
      return;
    }

    // Create new time entry
    const result = await query(
      `INSERT INTO time_entries 
       (user_id, clock_in_time, status, clock_in_latitude, clock_in_longitude, notes, created_at, updated_at, is_overtime_approved)
       VALUES ($1, NOW(), $2, $3, $4, $5, NOW(), NOW(), false)
       RETURNING id, clock_in_time`,
      [userId, 'Open', latitude, longitude, notes || null]
    );

    res.json({
      success: true,
      message: 'Successfully clocked in!',
      entry: {
        id: result.rows[0].id,
        clock_in_time: result.rows[0].clock_in_time
      }
    });
    return;
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to clock in' 
    });
    return;
  }
});

// Clock out
router.post('/clock-out', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { latitude, longitude, notes } = req.body;

    // Find the open time entry
    const openEntry = await query(
      'SELECT id, notes FROM time_entries WHERE user_id = $1 AND status = $2',
      [userId, 'Open']
    );

    if (openEntry.rows.length === 0) {
      res.status(400).json({ 
        success: false,
        error: 'No open time entry found. Please clock in first.' 
      });
      return;
    }

    const entryId = openEntry.rows[0].id;
    const existingNotes = openEntry.rows[0].notes || '';
    const updatedNotes = notes 
      ? `${existingNotes}${existingNotes ? ' | ' : ''}Clock-out notes: ${notes}`
      : existingNotes;

    // Update time entry
    const result = await query(
      `UPDATE time_entries 
       SET clock_out_time = NOW(), 
           status = $1, 
           clock_out_latitude = $2, 
           clock_out_longitude = $3, 
           notes = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING clock_out_time`,
      ['Closed', latitude, longitude, updatedNotes, entryId]
    );

    res.json({
      success: true,
      message: 'Successfully clocked out!',
      clock_out_time: result.rows[0].clock_out_time
    });
    return;
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to clock out' 
    });
    return;
  }
});

// Start break
router.post('/break/start', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Find the open time entry
    const openEntry = await query(
      'SELECT id, break_start_time FROM time_entries WHERE user_id = $1 AND status = $2',
      [userId, 'Open']
    );

    if (openEntry.rows.length === 0) {
      res.status(400).json({ 
        success: false,
        error: 'No open time entry found. Please clock in first.' 
      });
      return;
    }

    if (openEntry.rows[0].break_start_time) {
      res.status(400).json({ 
        success: false,
        error: 'You are already on a break.' 
      });
      return;
    }

    const entryId = openEntry.rows[0].id;

    // Start break
    const result = await query(
      `UPDATE time_entries 
       SET break_start_time = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING break_start_time`,
      [entryId]
    );

    res.json({
      success: true,
      message: 'Break started',
      break_start_time: result.rows[0].break_start_time
    });
    return;
  } catch (error) {
    console.error('Error starting break:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to start break' 
    });
    return;
  }
});

// End break
router.post('/break/end', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Find the open time entry with an active break
    const openEntry = await query(
      `SELECT id, break_start_time, break_end_time, total_break_minutes 
       FROM time_entries 
       WHERE user_id = $1 AND status = $2 AND break_start_time IS NOT NULL`,
      [userId, 'Open']
    );

    if (openEntry.rows.length === 0) {
      res.status(400).json({ 
        success: false,
        error: 'No active break found.' 
      });
      return;
    }

    if (openEntry.rows[0].break_end_time) {
      res.status(400).json({ 
        success: false,
        error: 'Break has already ended.' 
      });
      return;
    }

    const entryId = openEntry.rows[0].id;
    const breakStartTime = new Date(openEntry.rows[0].break_start_time);
    const breakEndTime = new Date();
    const breakMinutes = Math.floor((breakEndTime.getTime() - breakStartTime.getTime()) / 60000);
    const totalBreakMinutes = (openEntry.rows[0].total_break_minutes || 0) + breakMinutes;

    // End break and update total break minutes
    const result = await query(
      `UPDATE time_entries 
       SET break_end_time = NOW(), 
           total_break_minutes = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING break_end_time, total_break_minutes`,
      [totalBreakMinutes, entryId]
    );

    res.json({
      success: true,
      message: 'Break ended',
      break_end_time: result.rows[0].break_end_time,
      break_minutes: breakMinutes,
      total_break_minutes: result.rows[0].total_break_minutes
    });
    return;
  } catch (error) {
    console.error('Error ending break:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to end break' 
    });
    return;
  }
});

// Get time entries with filters
router.get('/entries', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { start_date, end_date, page = '1', per_page = '10' } = req.query;

    let queryStr = `
      SELECT 
        id,
        clock_in_time,
        clock_out_time,
        status,
        notes,
        total_break_minutes,
        CASE 
          WHEN clock_out_time IS NOT NULL THEN
            EXTRACT(EPOCH FROM (clock_out_time - clock_in_time)) / 3600 - 
            COALESCE(total_break_minutes, 0) / 60.0
          ELSE 0
        END as total_hours,
        CASE 
          WHEN clock_out_time IS NOT NULL THEN
            GREATEST(0, (EXTRACT(EPOCH FROM (clock_out_time - clock_in_time)) / 3600 - 
            COALESCE(total_break_minutes, 0) / 60.0) - 8)
          ELSE 0
        END as overtime_hours,
        is_overtime_approved
      FROM time_entries
      WHERE user_id = $1
    `;

    const params: any[] = [userId];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      queryStr += ` AND DATE(clock_in_time) >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      queryStr += ` AND DATE(clock_in_time) <= $${paramCount}`;
      params.push(end_date);
    }

    queryStr += ` ORDER BY clock_in_time DESC`;

    // Get total count for pagination
    const countResult = await query(
      queryStr.replace('SELECT id,', 'SELECT COUNT(*) as count FROM (SELECT id,').replace('ORDER BY clock_in_time DESC', ') as subq'),
      params
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const pageNum = parseInt(page as string);
    const perPageNum = parseInt(per_page as string);
    const totalPages = Math.ceil(totalItems / perPageNum);
    const offset = (pageNum - 1) * perPageNum;

    // Add pagination
    queryStr += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(perPageNum, offset);

    const result = await query(queryStr, params);

    res.json({
      entries: result.rows,
      pagination: {
        page: pageNum,
        per_page: perPageNum,
        total_items: totalItems,
        total_pages: totalPages,
        has_prev: pageNum > 1,
        has_next: pageNum < totalPages
      }
    });
    return;
  } catch (error) {
    console.error('Error getting time entries:', error);
    res.status(500).json({ error: 'Failed to get time entries' });
    return;
  }
});

// Get summary stats
router.get('/summary', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { start_date, end_date } = req.query;

    let queryStr = `
      SELECT 
        SUM(CASE 
          WHEN clock_out_time IS NOT NULL THEN
            EXTRACT(EPOCH FROM (clock_out_time - clock_in_time)) / 3600 - 
            COALESCE(total_break_minutes, 0) / 60.0
          ELSE 0
        END) as total_hours,
        SUM(CASE 
          WHEN clock_out_time IS NOT NULL THEN
            GREATEST(0, (EXTRACT(EPOCH FROM (clock_out_time - clock_in_time)) / 3600 - 
            COALESCE(total_break_minutes, 0) / 60.0) - 8)
          ELSE 0
        END) as total_overtime
      FROM time_entries
      WHERE user_id = $1
    `;

    const params: any[] = [userId];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      queryStr += ` AND DATE(clock_in_time) >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      queryStr += ` AND DATE(clock_in_time) <= $${paramCount}`;
      params.push(end_date);
    }

    const result = await query(queryStr, params);

    res.json({
      total_hours: parseFloat(result.rows[0].total_hours || 0).toFixed(2),
      total_overtime: parseFloat(result.rows[0].total_overtime || 0).toFixed(2)
    });
    return;
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: 'Failed to get summary' });
    return;
  }
});

export default router;
