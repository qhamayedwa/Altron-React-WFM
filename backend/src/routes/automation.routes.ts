import { Router } from 'express';
import pool from '../db/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all automation workflows with mock data fallback
router.get('/workflows', authenticate, async (req: AuthRequest, res) => {
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
      return res.json(mockWorkflows);
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
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

export default router;
