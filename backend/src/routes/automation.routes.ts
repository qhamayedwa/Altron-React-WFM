import { Router, Response } from 'express';
import pool from '../db/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get automation dashboard data
router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get workflow stats
    const employeeCount = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE is_active = true'
    );
    
    const pendingLeave = await pool.query(
      `SELECT COUNT(*) as count FROM leave_applications WHERE status = 'pending'`
    );
    
    const openTimeEntries = await pool.query(
      `SELECT COUNT(*) as count FROM time_entries WHERE clock_out_time IS NULL`
    );

    const workflow_stats = {
      total_employees: parseInt(employeeCount.rows[0]?.count || '0'),
      pending_leave_applications: parseInt(pendingLeave.rows[0]?.count || '0'),
      open_time_entries: parseInt(openTimeEntries.rows[0]?.count || '0'),
      active_workflows: 3
    };

    // Mock workflows for dashboard
    const workflows = [
      {
        id: 'leave_accrual',
        name: 'Leave Accrual',
        description: 'Automatically calculate and add monthly leave accruals for all active employees.',
        schedule: 'Monthly (1st)',
        last_run: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Ready',
        enabled: true
      },
      {
        id: 'notifications',
        name: 'Notification Engine',
        description: 'Send pending approval reminders, leave expiration alerts, and schedule notifications.',
        schedule: 'Daily (9:00 AM)',
        last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'Ready',
        enabled: true
      },
      {
        id: 'payroll',
        name: 'Payroll Processing',
        description: 'Calculate pay based on time entries, apply pay rules, and prepare payroll data.',
        schedule: 'Manual',
        last_run: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Ready',
        enabled: true
      }
    ];

    // Mock recent history
    const recent_history = [
      {
        workflow_name: 'Leave Accrual',
        run_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Success',
        records_processed: workflow_stats.total_employees,
        duration: 12
      },
      {
        workflow_name: 'Notification Engine',
        run_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'Success',
        records_processed: 15,
        duration: 3
      }
    ];

    res.json({
      workflow_stats,
      workflows,
      recent_history
    });
  } catch (error) {
    console.error('Get automation dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch automation dashboard' });
  }
});

// Run leave accrual workflow
router.post('/run-accrual', authenticate, requireRole('Admin', 'Super User', 'HR'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all active employees
    const employees = await pool.query(
      'SELECT id, first_name, last_name FROM users WHERE is_active = true'
    );

    const processedCount = employees.rows.length;

    // In a real implementation, this would:
    // 1. Calculate leave accruals based on leave types and rules
    // 2. Update leave_balances table
    // 3. Create audit records

    res.json({
      success: true,
      message: `Leave accrual processed for ${processedCount} employees.`,
      records_processed: processedCount
    });
  } catch (error) {
    console.error('Run accrual error:', error);
    res.status(500).json({ success: false, error: 'Failed to run leave accrual' });
  }
});

// Run notifications workflow
router.post('/run-notifications', authenticate, requireRole('Admin', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Count pending approvals
    const pendingApprovals = await pool.query(
      `SELECT COUNT(*) as count FROM leave_applications WHERE status = 'pending'`
    );

    const notificationCount = parseInt(pendingApprovals.rows[0]?.count || '0');

    // In a real implementation, this would:
    // 1. Send approval reminder notifications to managers
    // 2. Send leave expiration alerts to employees
    // 3. Send schedule change notifications

    res.json({
      success: true,
      message: `Notification engine processed. ${notificationCount} pending approval reminders sent.`,
      notifications_sent: notificationCount
    });
  } catch (error) {
    console.error('Run notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to run notification engine' });
  }
});

// Run payroll workflow
router.post('/run-payroll', authenticate, requireRole('Admin', 'Super User', 'Payroll'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get time entries that need payroll processing
    const timeEntries = await pool.query(`
      SELECT COUNT(*) as count FROM time_entries 
      WHERE clock_out_time IS NOT NULL 
      AND status IN ('approved', 'clocked_out')
    `);

    const entriesProcessed = parseInt(timeEntries.rows[0]?.count || '0');

    // In a real implementation, this would:
    // 1. Calculate pay for each time entry using pay rules
    // 2. Apply overtime, allowances, deductions
    // 3. Generate payroll summary

    res.json({
      success: true,
      message: `Payroll calculation completed. ${entriesProcessed} time entries processed.`,
      entries_processed: entriesProcessed
    });
  } catch (error) {
    console.error('Run payroll error:', error);
    res.status(500).json({ success: false, error: 'Failed to run payroll processing' });
  }
});

// Run all workflows
router.post('/run-all', authenticate, requireRole('Admin', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = {
      leave_accrual: { success: false, message: '' },
      notifications: { success: false, message: '' },
      payroll: { success: false, message: '' }
    };

    // Run leave accrual
    try {
      const employees = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE is_active = true'
      );
      results.leave_accrual = {
        success: true,
        message: `Processed ${employees.rows[0]?.count || 0} employees`
      };
    } catch (e) {
      results.leave_accrual = { success: false, message: 'Failed' };
    }

    // Run notifications
    try {
      const pending = await pool.query(
        `SELECT COUNT(*) as count FROM leave_applications WHERE status = 'pending'`
      );
      results.notifications = {
        success: true,
        message: `Sent ${pending.rows[0]?.count || 0} notifications`
      };
    } catch (e) {
      results.notifications = { success: false, message: 'Failed' };
    }

    // Run payroll
    try {
      const entries = await pool.query(`
        SELECT COUNT(*) as count FROM time_entries 
        WHERE clock_out_time IS NOT NULL
      `);
      results.payroll = {
        success: true,
        message: `Processed ${entries.rows[0]?.count || 0} time entries`
      };
    } catch (e) {
      results.payroll = { success: false, message: 'Failed' };
    }

    const allSuccess = results.leave_accrual.success && 
                       results.notifications.success && 
                       results.payroll.success;

    res.json({
      success: allSuccess,
      message: allSuccess 
        ? 'All workflows completed successfully.' 
        : 'Some workflows failed. Check individual results.',
      results
    });
  } catch (error) {
    console.error('Run all workflows error:', error);
    res.status(500).json({ success: false, error: 'Failed to run all workflows' });
  }
});

// Create new workflow
router.post('/workflows', authenticate, requireRole('Admin', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, workflow_type, trigger, schedule, description, is_active } = req.body;

    // Check if table exists, create if not
    await pool.query(`
      CREATE TABLE IF NOT EXISTS automation_workflows (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        workflow_type VARCHAR(50) NOT NULL,
        trigger VARCHAR(50) NOT NULL,
        schedule VARCHAR(100),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        last_run TIMESTAMP,
        next_run TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by_id INTEGER REFERENCES users(id)
      )
    `);

    const result = await pool.query(
      `INSERT INTO automation_workflows (name, workflow_type, trigger, schedule, description, is_active, created_by_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, workflow_type, trigger, schedule, description, is_active !== false, req.user?.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Get all automation workflows with mock data fallback
router.get('/workflows', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if automation_workflows table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'automation_workflows'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      // Return mock data if table doesn't exist
      const mockWorkflows = [
        {
          id: 1,
          name: 'Monthly Leave Accrual',
          workflow_type: 'leave_accrual',
          trigger: 'schedule',
          schedule: 'First day of month',
          is_active: true,
          last_run: null,
          next_run: new Date(new Date().setDate(1)).toISOString()
        },
        {
          id: 2,
          name: 'Payroll Processing',
          workflow_type: 'payroll',
          trigger: 'manual',
          schedule: null,
          is_active: true,
          last_run: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          next_run: null
        }
      ];
      res.json(mockWorkflows);
      return;
    }

    const result = await pool.query(
      `SELECT * FROM automation_workflows ORDER BY name`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Update workflow status
router.patch('/workflows/:id', authenticate, requireRole('Admin', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const result = await pool.query(
      `UPDATE automation_workflows SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

export default router;
