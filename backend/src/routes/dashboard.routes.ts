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

// Get super admin dashboard statistics
router.get('/super-admin/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    // System health stats
    const activeUsersToday = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM time_entries 
       WHERE DATE(clock_in_time) = CURRENT_DATE`
    );

    // Organization stats
    const orgStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM companies) as companies,
        (SELECT COUNT(*) FROM regions) as regions,
        (SELECT COUNT(*) FROM sites) as sites,
        (SELECT COUNT(*) FROM departments) as departments,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as active_employees,
        (SELECT COUNT(*) FROM users) as total_employees
    `);

    // User stats by role
    const userStats = await pool.query(`
      SELECT 
        r.name as role_name,
        COUNT(DISTINCT ur.user_id) as count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      GROUP BY r.name
    `);

    const roleMap: any = {};
    userStats.rows.forEach((row: any) => {
      roleMap[row.role_name.toLowerCase().replace(' ', '_')] = parseInt(row.count);
    });

    // Attendance stats
    const attendanceStats = await pool.query(`
      SELECT 
        COUNT(*) as clock_ins_today,
        COUNT(*) FILTER (WHERE clock_in_time::time <= shift_start_time + INTERVAL '15 minutes') as on_time,
        COALESCE(SUM(total_hours), 0) as total_hours
      FROM time_entries
      WHERE DATE(clock_in_time) = CURRENT_DATE
    `);

    const clockInsToday = parseInt(attendanceStats.rows[0]?.clock_ins_today || 0);
    const onTime = parseInt(attendanceStats.rows[0]?.on_time || 0);
    const onTimePercentage = clockInsToday > 0 ? Math.round((onTime / clockInsToday) * 100) : 0;

    // Overtime hours
    const overtimeResult = await pool.query(`
      SELECT COALESCE(SUM(total_hours - 8), 0) as overtime_hours
      FROM time_entries
      WHERE DATE(clock_in_time) = CURRENT_DATE AND total_hours > 8
    `);

    // Time exceptions
    const exceptionsResult = await pool.query(`
      SELECT COUNT(*) as count FROM time_entries 
      WHERE DATE(clock_in_time) = CURRENT_DATE 
      AND (total_hours > 12 OR total_hours < 4)
    `);

    // Workflow stats
    const workflowStats = {
      active_workflows: 5,
      automation_rate: 85,
      pending_approvals: 0,
      completed_today: 0
    };

    // Check for pending approvals
    const pendingApprovals = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM time_entries WHERE status = 'pending') +
        (SELECT COUNT(*) FROM leave_applications WHERE status = 'pending') as count
    `);
    workflowStats.pending_approvals = parseInt(pendingApprovals.rows[0]?.count || 0);

    // Payroll stats
    const payrollStats = await pool.query(`
      SELECT 
        COALESCE(SUM(total_hours), 0) as total_hours,
        COUNT(DISTINCT user_id) as processed_employees
      FROM time_entries
      WHERE DATE(clock_in_time) >= DATE_TRUNC('month', CURRENT_DATE)
      AND status = 'approved'
    `);

    // Leave stats
    const leaveStats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
        COUNT(*) FILTER (WHERE status = 'approved' AND DATE(start_date) >= DATE_TRUNC('month', CURRENT_DATE)) as approved_month
      FROM leave_applications
    `);

    // Schedule stats
    const scheduleStats = await pool.query(`
      SELECT 
        COUNT(*) as shifts_today
      FROM shift_assignments
      WHERE shift_date = CURRENT_DATE
    `);

    res.json({
      systemStats: {
        uptime: 99.9,
        activeUsers: parseInt(activeUsersToday.rows[0]?.count || 0),
        pendingTasks: workflowStats.pending_approvals,
        dataIntegrity: 100
      },
      orgStats: {
        companies: parseInt(orgStats.rows[0]?.companies || 0),
        regions: parseInt(orgStats.rows[0]?.regions || 0),
        sites: parseInt(orgStats.rows[0]?.sites || 0),
        departments: parseInt(orgStats.rows[0]?.departments || 0),
        activeEmployees: parseInt(orgStats.rows[0]?.active_employees || 0),
        totalEmployees: parseInt(orgStats.rows[0]?.total_employees || 0)
      },
      userStats: {
        superUsers: roleMap.super_user || 0,
        managers: roleMap.manager || 0,
        employees: roleMap.employee || 0,
        recentLogins: parseInt(activeUsersToday.rows[0]?.count || 0),
        activeAccounts: parseInt(orgStats.rows[0]?.active_employees || 0)
      },
      attendanceStats: {
        clockInsToday: clockInsToday,
        expectedClockIns: parseInt(orgStats.rows[0]?.active_employees || 0),
        onTimePercentage: onTimePercentage,
        overtimeHours: parseFloat(overtimeResult.rows[0]?.overtime_hours || 0).toFixed(1),
        exceptions: parseInt(exceptionsResult.rows[0]?.count || 0)
      },
      workflowStats: {
        activeWorkflows: workflowStats.active_workflows,
        automationRate: workflowStats.automation_rate,
        pendingApprovals: workflowStats.pending_approvals,
        completedToday: workflowStats.completed_today
      },
      payrollStats: {
        totalHours: parseFloat(payrollStats.rows[0]?.total_hours || 0).toFixed(2),
        totalPayroll: (parseFloat(payrollStats.rows[0]?.total_hours || 0) * 150).toFixed(2),
        overtimeCost: 15,
        pendingCalculations: parseInt(pendingApprovals.rows[0]?.count || 0),
        processedEmployees: parseInt(payrollStats.rows[0]?.processed_employees || 0)
      },
      leaveStats: {
        pendingApplications: parseInt(leaveStats.rows[0]?.pending_applications || 0),
        approvedMonth: parseInt(leaveStats.rows[0]?.approved_month || 0),
        balanceIssues: 0
      },
      scheduleStats: {
        shiftsToday: parseInt(scheduleStats.rows[0]?.shifts_today || 0),
        coverageRate: 95,
        conflicts: 0,
        upcomingShifts: 0
      }
    });
  } catch (error) {
    console.error('Super admin dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch super admin dashboard statistics' });
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
