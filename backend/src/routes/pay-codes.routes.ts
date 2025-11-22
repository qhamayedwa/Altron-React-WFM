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
          pay_type: 'earning',
          rate_type: 'hourly',
          rate_value: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          code: 'OT',
          description: 'Overtime',
          pay_type: 'earning',
          rate_type: 'hourly',
          rate_value: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          code: 'DOT',
          description: 'Double Time',
          pay_type: 'earning',
          rate_type: 'hourly',
          rate_value: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      return res.json(mockCodes);
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
      pay_type,
      rate_type,
      rate_value,
      is_active
    } = req.body;

    const result = await pool.query(
      `INSERT INTO pay_codes (
        code, description, pay_type, rate_type, rate_value, is_active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [code, description, pay_type, rate_type, rate_value, is_active]
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
      pay_type,
      rate_type,
      rate_value,
      is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE pay_codes SET
        code = $1,
        description = $2,
        pay_type = $3,
        rate_type = $4,
        rate_value = $5,
        is_active = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *`,
      [code, description, pay_type, rate_type, rate_value, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pay code not found' });
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
      return res.json([]);
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
