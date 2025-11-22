import { Router } from 'express';
import pool from '../db/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all pay codes with mock data fallback
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if pay_codes table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pay_codes'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      // Return mock data if table doesn't exist
      const mockCodes = [
        {
          id: 1,
          code: 'REG',
          description: 'Regular Hours',
          is_absence_code: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          code: 'OT',
          description: 'Overtime',
          is_absence_code: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          code: 'DOT',
          description: 'Double Time',
          is_absence_code: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      res.json(mockCodes);
      return;
    }

    const result = await pool.query(
      `SELECT * FROM pay_codes ORDER BY code`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get pay codes error:', error);
    res.status(500).json({ error: 'Failed to fetch pay codes' });
  }
});

// Create pay code
router.post('/', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const {
      code,
      description,
      is_absence_code,
      is_active,
      configuration
    } = req.body;

    const result = await pool.query(
      `INSERT INTO pay_codes (
        code, description, is_absence_code, is_active, configuration,
        created_at, updated_at, created_by_id
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6)
      RETURNING *`,
      [code, description, is_absence_code || false, is_active !== false, configuration || null, req.user!.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create pay code error:', error);
    res.status(500).json({ error: 'Failed to create pay code' });
  }
});

// Update pay code
router.put('/:id', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      is_absence_code,
      is_active,
      configuration
    } = req.body;

    const result = await pool.query(
      `UPDATE pay_codes SET
        code = $1,
        description = $2,
        is_absence_code = $3,
        is_active = $4,
        configuration = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *`,
      [code, description, is_absence_code, is_active, configuration, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Pay code not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update pay code error:', error);
    res.status(500).json({ error: 'Failed to update pay code' });
  }
});

// Get pay code configurations
router.get('/configurations', authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if pay_code_configurations table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pay_code_configurations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      // Return empty array if table doesn't exist
      res.json([]);
      return;
    }

    const result = await pool.query(`
      SELECT 
        pcc.*,
        pc.code as pay_code,
        u.username,
        d.name as department_name
      FROM pay_code_configurations pcc
      LEFT JOIN pay_codes pc ON pcc.pay_code_id = pc.id
      LEFT JOIN users u ON pcc.user_id = u.id
      LEFT JOIN departments d ON pcc.department_id = d.id
      ORDER BY pcc.effective_date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get pay code configurations error:', error);
    res.status(500).json({ error: 'Failed to fetch pay code configurations' });
  }
});

export default router;
