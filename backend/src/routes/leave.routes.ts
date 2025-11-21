import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

router.use(authenticate);

// Get leave types
router.get('/types', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT * FROM leave_types WHERE is_active = true ORDER BY name'
    );

    res.json({
      leaveTypes: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        accrualRate: row.accrual_rate,
        maxDaysPerYear: row.max_days_per_year,
        isPaid: row.is_paid,
        requiresApproval: row.requires_approval
      }))
    });
  } catch (error) {
    console.error('Get leave types error:', error);
    res.status(500).json({ error: 'Failed to retrieve leave types' });
  }
});

// Get user's leave balance
router.get('/balance', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const year = req.query.year || new Date().getFullYear();
    
    const result = await query(
      `SELECT lb.*, lt.name, lt.code
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.user_id = $1 AND lb.year = $2
       ORDER BY lt.name`,
      [req.user!.id, year]
    );

    res.json({
      balances: result.rows.map(row => ({
        leaveType: row.name,
        leaveTypeCode: row.code,
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

      // Calculate days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const result = await query(
        `INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, days, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [req.user!.id, leaveTypeId, startDate, endDate, days, reason]
      );

      res.json({
        success: true,
        leaveRequest: {
          id: result.rows[0].id,
          leaveTypeId: result.rows[0].leave_type_id,
          startDate: result.rows[0].start_date,
          endDate: result.rows[0].end_date,
          days: result.rows[0].days,
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
      SELECT lr.*, lt.name as leave_type_name, lt.code as leave_type_code
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.user_id = $1
    `;
    const params: any[] = [req.user!.id];
    
    if (status) {
      params.push(status);
      sql += ` AND lr.status = $${params.length}`;
    }
    
    if (year) {
      params.push(year);
      sql += ` AND EXTRACT(YEAR FROM lr.start_date) = $${params.length}`;
    }
    
    sql += ' ORDER BY lr.created_at DESC';
    
    const result = await query(sql, params);

    res.json({
      leaveRequests: result.rows.map(row => ({
        id: row.id,
        leaveType: row.leave_type_name,
        leaveTypeCode: row.leave_type_code,
        startDate: row.start_date,
        endDate: row.end_date,
        days: row.days,
        reason: row.reason,
        status: row.status,
        approvedBy: row.approved_by,
        approvedAt: row.approved_at,
        rejectionReason: row.rejection_reason,
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
      `SELECT lr.*, lt.name as leave_type_name, u.first_name, u.last_name, u.employee_number, d.name as department_name
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       JOIN users u ON lr.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE lr.status = 'pending' AND u.tenant_id = $1
       ORDER BY lr.created_at ASC`,
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
        days: row.days,
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
      `UPDATE leave_requests
       SET status = 'approved', approved_by = $1, approved_at = NOW()
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
        `UPDATE leave_requests
         SET status = 'rejected', approved_by = $1, approved_at = NOW(), rejection_reason = $2
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

export default router;
