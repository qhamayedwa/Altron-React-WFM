import { Router } from 'express';
import pool from '../db/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get dashboard statistics for current user
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get time entries today
    const timeEntriesToday = await pool.query(
      `SELECT COUNT(*) as count FROM time_entries 
       WHERE user_id = $1 AND DATE(clock_in_time) = CURRENT_DATE`,
      [userId]
    );

    // Get pending leave requests
    const pendingLeaveRequests = await pool.query(
      `SELECT COUNT(*) as count FROM leave_applications 
       WHERE user_id = $1 AND status = 'pending'`,
      [userId]
    );

    // Get upcoming shifts
    const upcomingShifts = await pool.query(
      `SELECT COUNT(*) as count FROM shift_assignments 
       WHERE user_id = $1 AND shift_date >= CURRENT_DATE 
       AND shift_date <= CURRENT_DATE + INTERVAL '7 days'`,
      [userId]
    );

    // Get team members count (if manager)
    const managedDepartments = await pool.query(
      `SELECT id FROM departments WHERE manager_id = $1`,
      [userId]
    );
    
    let teamMembers = 0;
    if (managedDepartments.rows.length > 0) {
      const deptIds = managedDepartments.rows.map(d => d.id);
      const teamMembersResult = await pool.query(
        `SELECT COUNT(*) as count FROM users 
         WHERE department_id = ANY($1) AND is_active = true`,
        [deptIds]
      );
      teamMembers = parseInt(teamMembersResult.rows[0].count);
    }

    res.json({
      timeEntriesToday: parseInt(timeEntriesToday.rows[0].count),
      pendingLeaveRequests: parseInt(pendingLeaveRequests.rows[0].count),
      upcomingShifts: parseInt(upcomingShifts.rows[0].count),
      teamMembers
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent activity
router.get('/activity', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    const activities = await pool.query(
      `SELECT 
        'time_entry' as type,
        id,
        clock_in_time as timestamp,
        status,
        total_hours as details
       FROM time_entries
       WHERE user_id = $1
       UNION ALL
       SELECT 
        'leave_request' as type,
        id,
        created_at as timestamp,
        status,
        CONCAT(leave_type, ': ', days, ' days') as details
       FROM leave_requests
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({ activities: activities.rows });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

export default router;
