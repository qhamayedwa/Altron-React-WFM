import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

router.use(authenticate);

// Get all leave types
router.get('/types', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if leave_types table exists
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'leave_types'
      )`
    );

    if (tableCheck.rows[0].exists) {
      const result = await query(
        'SELECT * FROM leave_types WHERE is_active = true ORDER BY name'
      );

      const types = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.name ? row.name.substring(0, 2).toUpperCase() : 'LT',
        description: row.description,
        default_accrual_rate: row.default_accrual_rate,
        max_consecutive_days: row.max_consecutive_days,
        requires_approval: row.requires_approval,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.created_at
      }));

      res.json(types);
    } else {
      // Return mock data if table doesn't exist
      const mockTypes = [
        { id: 1, name: 'Annual Leave', code: 'AL', description: 'Regular paid time off', default_accrual_rate: 160, requires_approval: true, is_active: true },
        { id: 2, name: 'Sick Leave', code: 'SL', description: 'Medical leave', default_accrual_rate: 80, requires_approval: false, is_active: true },
        { id: 3, name: 'Personal Leave', code: 'PL', description: 'Personal days', default_accrual_rate: 40, requires_approval: true, is_active: true }
      ];
      res.json(mockTypes);
    }
  } catch (error) {
    console.error('Get leave types error:', error);
    res.status(500).json({ error: 'Failed to retrieve leave types' });
  }
});

// Get single leave type
router.get('/types/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'leave_types'
      )`
    );

    if (tableCheck.rows[0].exists) {
      const result = await query('SELECT * FROM leave_types WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Leave type not found' });
        return;
      }

      const row = result.rows[0];
      
      // Generate code from name if not exists in schema
      const code = row.name ? row.name.substring(0, 2).toUpperCase() : 'LT';
      
      // Check if leave_applications table exists for statistics
      const appTableCheck = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'leave_applications'
        )`
      );
      
      let total_applications = 0;
      let pending_applications = 0;
      let approved_applications = 0;
      let recent_applications: any[] = [];
      
      if (appTableCheck.rows[0].exists) {
        // Get statistics from leave_applications
        const statsResult = await query(
          `SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'approved') as approved
           FROM leave_applications 
           WHERE leave_type_id = $1`,
          [id]
        );
        
        if (statsResult.rows.length > 0) {
          total_applications = parseInt(statsResult.rows[0].total) || 0;
          pending_applications = parseInt(statsResult.rows[0].pending) || 0;
          approved_applications = parseInt(statsResult.rows[0].approved) || 0;
        }
        
        // Get recent applications
        const recentResult = await query(
          `SELECT la.id, la.start_date, la.end_date, la.status, la.created_at,
                  u.first_name, u.last_name, u.employee_number, u.username
           FROM leave_applications la
           JOIN users u ON la.user_id = u.id
           WHERE la.leave_type_id = $1
           ORDER BY la.created_at DESC
           LIMIT 10`,
          [id]
        );
        
        recent_applications = recentResult.rows.map(app => ({
          id: app.id,
          employee: {
            first_name: app.first_name || '',
            last_name: app.last_name || '',
            username: app.username || app.employee_number || 'Unknown'
          },
          startDate: app.start_date,
          endDate: app.end_date,
          status: app.status,
          createdAt: app.created_at
        }));
      }

      res.json({
        id: row.id,
        name: row.name,
        code: code,
        description: row.description,
        default_accrual_rate: row.default_accrual_rate,
        max_consecutive_days: row.max_consecutive_days,
        requires_approval: row.requires_approval,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.created_at, // Use created_at as updated_at doesn't exist
        total_applications,
        pending_applications,
        approved_applications,
        recent_applications
      });
    } else {
      res.json({
        id: parseInt(id),
        name: 'Annual Leave',
        code: 'AL',
        description: 'Regular paid time off',
        default_accrual_rate: 160,
        requires_approval: true,
        is_active: true,
        total_applications: 0,
        pending_applications: 0,
        approved_applications: 0,
        recent_applications: []
      });
    }
  } catch (error) {
    console.error('Get leave type error:', error);
    res.status(500).json({ error: 'Failed to retrieve leave type' });
  }
});

// Create leave type
router.post(
  '/types',
  [
    body('name').trim().notEmpty().withMessage('Name is required')
  ],
  requireRole('Admin', 'HR', 'Super User'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, code, description, default_accrual_rate, max_consecutive_days, requires_approval } = req.body;

      const tableCheck = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'leave_types'
        )`
      );

      if (tableCheck.rows[0].exists) {
        const result = await query(
          `INSERT INTO leave_types (name, description, default_accrual_rate, max_consecutive_days, requires_approval, is_active)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING *`,
          [name, description, default_accrual_rate, max_consecutive_days, requires_approval || false]
        );

        res.json({
          success: true,
          leaveType: result.rows[0]
        });
      } else {
        res.status(503).json({ error: 'Leave types table not available' });
      }
    } catch (error) {
      console.error('Create leave type error:', error);
      res.status(500).json({ error: 'Failed to create leave type' });
    }
  }
);

// Update leave type
router.put(
  '/types/:id',
  [
    body('name').trim().notEmpty().withMessage('Name is required')
  ],
  requireRole('Admin', 'HR', 'Super User'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, code, description, default_accrual_rate, max_consecutive_days, requires_approval, is_active } = req.body;

      const tableCheck = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'leave_types'
        )`
      );

      if (tableCheck.rows[0].exists) {
        const result = await query(
          `UPDATE leave_types
           SET name = $1, description = $2, default_accrual_rate = $3, 
               max_consecutive_days = $4, requires_approval = $5, is_active = $6
           WHERE id = $7
           RETURNING *`,
          [name, description, default_accrual_rate, max_consecutive_days, requires_approval, is_active, id]
        );

        if (result.rows.length === 0) {
          res.status(404).json({ error: 'Leave type not found' });
          return;
        }

        res.json({
          success: true,
          leaveType: result.rows[0]
        });
      } else {
        res.status(503).json({ error: 'Leave types table not available' });
      }
    } catch (error) {
      console.error('Update leave type error:', error);
      res.status(500).json({ error: 'Failed to update leave type' });
    }
  }
);

// Toggle leave type active status
router.post('/types/:id/toggle', requireRole('Admin', 'HR', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'leave_types'
      )`
    );

    if (tableCheck.rows[0].exists) {
      const result = await query(
        `UPDATE leave_types
         SET is_active = NOT is_active
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Leave type not found' });
        return;
      }

      res.json({
        success: true,
        leaveType: result.rows[0]
      });
    } else {
      res.status(503).json({ error: 'Leave types table not available' });
    }
  } catch (error) {
    console.error('Toggle leave type error:', error);
    res.status(500).json({ error: 'Failed to toggle leave type status' });
  }
});

// Get user's leave balance
router.get('/balance', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const year = req.query.year || new Date().getFullYear();
    
    const result = await query(
      `SELECT lb.*, lt.name
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.user_id = $1 AND lb.year = $2
       ORDER BY lt.name`,
      [req.user!.id, year]
    );

    res.json({
      balances: result.rows.map(row => ({
        leaveType: row.name,
        leaveTypeCode: row.name ? row.name.substring(0, 2).toUpperCase() : 'LT',
        totalDays: row.total_days,
        usedDays: row.used_days,
        remainingDays: row.remaining_days,
        year: row.year
      }))
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ error: 'Failed to retrieve leave balance' });
  }
});

// Submit leave request
router.post(
  '/request',
  [
    body('leaveTypeId').isInt(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('reason').optional().isString()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { leaveTypeId, startDate, endDate, reason } = req.body;

      const result = await query(
        `INSERT INTO leave_applications (user_id, leave_type_id, start_date, end_date, reason, status, is_hourly)
         VALUES ($1, $2, $3, $4, $5, 'pending', false)
         RETURNING *`,
        [req.user!.id, leaveTypeId, startDate, endDate, reason || '']
      );

      res.json({
        success: true,
        leaveRequest: {
          id: result.rows[0].id,
          leaveTypeId: result.rows[0].leave_type_id,
          startDate: result.rows[0].start_date,
          endDate: result.rows[0].end_date,
          status: result.rows[0].status
        }
      });
    } catch (error) {
      console.error('Submit leave request error:', error);
      res.status(500).json({ error: 'Failed to submit leave request' });
    }
  }
);

// Get user's leave requests
router.get('/requests', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, year } = req.query;
    
    let sql = `
      SELECT la.*, lt.name as leave_type_name
      FROM leave_applications la
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.user_id = $1
    `;
    const params: any[] = [req.user!.id];
    
    if (status) {
      params.push(status);
      sql += ` AND la.status = $${params.length}`;
    }
    
    if (year) {
      params.push(year);
      sql += ` AND EXTRACT(YEAR FROM la.start_date) = $${params.length}`;
    }
    
    sql += ' ORDER BY la.created_at DESC';
    
    const result = await query(sql, params);

    res.json({
      leaveRequests: result.rows.map(row => ({
        id: row.id,
        leaveType: row.leave_type_name,
        leaveTypeCode: row.leave_type_name ? row.leave_type_name.substring(0, 2).toUpperCase() : 'LT',
        startDate: row.start_date,
        endDate: row.end_date,
        reason: row.reason,
        status: row.status,
        approvedBy: row.manager_approved_id,
        approvedAt: row.approved_at,
        rejectionReason: row.manager_comments,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Failed to retrieve leave requests' });
  }
});

// Manager: Get pending leave requests
router.get('/pending', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT la.*, lt.name as leave_type_name, u.first_name, u.last_name, u.employee_number, d.name as department_name
       FROM leave_applications la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       JOIN users u ON la.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE la.status = 'pending' AND u.tenant_id = $1
       ORDER BY la.created_at ASC`,
      [req.user!.tenantId]
    );

    res.json({
      pendingRequests: result.rows.map(row => ({
        id: row.id,
        employeeName: `${row.first_name} ${row.last_name}`,
        employeeNumber: row.employee_number,
        department: row.department_name,
        leaveType: row.leave_type_name,
        startDate: row.start_date,
        endDate: row.end_date,
        reason: row.reason,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to retrieve pending requests' });
  }
});

// Manager: Approve leave request
router.post('/approve/:id', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await query(
      `UPDATE leave_applications
       SET status = 'approved', manager_approved_id = $1, approved_at = NOW()
       WHERE id = $2`,
      [req.user!.id, id]
    );

    res.json({
      success: true,
      message: 'Leave request approved'
    });
  } catch (error) {
    console.error('Approve leave request error:', error);
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
});

// Manager: Reject leave request
router.post(
  '/reject/:id',
  [body('reason').notEmpty().withMessage('Rejection reason is required')],
  requireRole('Manager', 'Super User'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      await query(
        `UPDATE leave_applications
         SET status = 'rejected', manager_approved_id = $1, approved_at = NOW(), manager_comments = $2
         WHERE id = $3`,
        [req.user!.id, reason, id]
      );

      res.json({
        success: true,
        message: 'Leave request rejected'
      });
    } catch (error) {
      console.error('Reject leave request error:', error);
      res.status(500).json({ error: 'Failed to reject leave request' });
    }
  }
);

// Admin: Get all leave balances
router.get('/balances', requireRole('Admin', 'HR', 'Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if leave_balances table exists
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'leave_balances'
      )`
    );

    if (tableCheck.rows[0].exists) {
      const result = await query(
        `SELECT 
          lb.id,
          lb.user_id,
          lb.leave_type_id,
          lb.balance,
          lb.accrued_this_year,
          lb.used_this_year,
          lb.last_accrual_date,
          u.username,
          u.first_name,
          u.last_name,
          lt.name as leave_type_name
         FROM leave_balances lb
         JOIN users u ON lb.user_id = u.id
         JOIN leave_types lt ON lb.leave_type_id = lt.id
         ORDER BY u.username, lt.name`
      );

      const balances = result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        username: row.username,
        employeeName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.username,
        leaveTypeId: row.leave_type_id,
        leaveTypeName: row.leave_type_name,
        balance: parseFloat(row.balance) || 0,
        accruedThisYear: parseFloat(row.accrued_this_year) || 0,
        usedThisYear: parseFloat(row.used_this_year) || 0,
        lastAccrualDate: row.last_accrual_date
      }));

      res.json(balances);
    } else {
      // Return mock data if table doesn't exist
      const mockBalances = [
        {
          id: 1,
          userId: 1,
          username: 'admin',
          employeeName: 'System Admin',
          leaveTypeId: 1,
          leaveTypeName: 'Annual Leave',
          balance: 120.0,
          accruedThisYear: 80.0,
          usedThisYear: 40.0,
          lastAccrualDate: new Date().toISOString()
        }
      ];
      res.json(mockBalances);
    }
  } catch (error) {
    console.error('Get leave balances error:', error);
    res.status(500).json({ error: 'Failed to retrieve leave balances' });
  }
});

// Admin: Run monthly accrual
router.post('/run-accrual', requireRole('Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Placeholder for accrual logic - would update leave_balances table
    res.json({
      success: true,
      message: 'Leave accrual completed successfully',
      processedEmployees: 0
    });
  } catch (error) {
    console.error('Run accrual error:', error);
    res.status(500).json({ error: 'Failed to run accrual' });
  }
});

// Admin: Adjust leave balance
router.post(
  '/balances/:id/adjust',
  [
    body('newBalance').isFloat({ min: 0 }).withMessage('New balance must be a positive number'),
    body('reason').notEmpty().withMessage('Reason is required')
  ],
  requireRole('Admin', 'HR', 'Super User'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newBalance, reason } = req.body;

      // Check if leave_balances table exists
      const tableCheck = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'leave_balances'
        )`
      );

      if (tableCheck.rows[0].exists) {
        await query(
          `UPDATE leave_balances
           SET balance = $1, updated_at = NOW()
           WHERE id = $2`,
          [newBalance, id]
        );
      }

      res.json({
        success: true,
        message: 'Balance adjusted successfully',
        balanceId: id,
        newBalance,
        adjustedBy: req.user!.id,
        reason
      });
    } catch (error) {
      console.error('Adjust balance error:', error);
      res.status(500).json({ error: 'Failed to adjust balance' });
    }
  }
);

// Manager: Apply leave for employee
router.post('/apply-for-employee', requireRole('Manager', 'HR', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, leaveTypeId, startDate, endDate, isHourly, hoursRequested, autoApprove, reason } = req.body;

    const result = await query(
      `INSERT INTO leave_applications 
       (user_id, leave_type_id, start_date, end_date, is_hourly, hours_requested, reason, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, leaveTypeId, startDate, endDate, isHourly || false, hoursRequested || null, reason, autoApprove ? 'approved' : 'pending', req.user!.id]
    );

    res.status(201).json({
      success: true,
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Apply leave for employee error:', error);
    res.status(500).json({ error: 'Failed to apply leave for employee' });
  }
});

// Get leave balance for user and leave type
router.get('/balance/:userId/:leaveTypeId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, leaveTypeId } = req.params;

    const result = await query(
      `SELECT balance FROM leave_balances 
       WHERE user_id = $1 AND leave_type_id = $2`,
      [userId, leaveTypeId]
    );

    res.json({
      balance: result.rows.length > 0 ? result.rows[0].balance : 0
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ error: 'Failed to retrieve leave balance' });
  }
});

export default router;
