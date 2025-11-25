import { Router } from 'express';
import pool from '../db/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all pay codes with all required fields
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
          name: 'Regular Hours',
          description: 'Regular Hours',
          hourly_rate: null,
          is_overtime: false,
          overtime_multiplier: null,
          usage_count: 0,
          is_absence_code: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          code: 'OT',
          name: 'Overtime',
          description: 'Overtime',
          hourly_rate: null,
          is_overtime: true,
          overtime_multiplier: 1.5,
          usage_count: 0,
          is_absence_code: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          code: 'DOT',
          name: 'Double Time',
          description: 'Double Time',
          hourly_rate: null,
          is_overtime: true,
          overtime_multiplier: 2.0,
          usage_count: 0,
          is_absence_code: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      res.json(mockCodes);
      return;
    }

    // Check if user_pay_codes table exists for usage_count
    const userPayCodesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_pay_codes'
      );
    `);

    const hasUserPayCodes = userPayCodesCheck.rows[0].exists;

    let result;
    if (hasUserPayCodes) {
      // Join with user_pay_codes to get usage count
      result = await pool.query(`
        SELECT 
          pc.*,
          pc.description as name,
          NULL::numeric as hourly_rate,
          false as is_overtime,
          NULL::numeric as overtime_multiplier,
          COALESCE(COUNT(upc.user_id), 0)::integer as usage_count
        FROM pay_codes pc
        LEFT JOIN user_pay_codes upc ON pc.id = upc.pay_code_id
        GROUP BY pc.id, pc.code, pc.description, pc.is_absence_code, 
                 pc.is_active, pc.created_at, pc.updated_at, 
                 pc.created_by_id, pc.configuration
        ORDER BY pc.code
      `);
    } else {
      // No user_pay_codes table, set usage_count to 0
      result = await pool.query(`
        SELECT 
          pc.*,
          pc.description as name,
          NULL::numeric as hourly_rate,
          false as is_overtime,
          NULL::numeric as overtime_multiplier,
          0 as usage_count
        FROM pay_codes pc
        ORDER BY pc.code
      `);
    }
    
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

// Get pay code statistics - MUST be before /:id route
router.get('/statistics', authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if pay_codes table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pay_codes'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      res.json({
        total_pay_codes: 0,
        active_pay_codes: 0,
        pay_codes_in_use: 0,
        unassigned_employees: 0
      });
      return;
    }

    // Check if user_pay_codes table exists
    const userPayCodesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_pay_codes'
      );
    `);

    const hasUserPayCodes = userPayCodesCheck.rows[0].exists;

    // Get pay code statistics
    const payCodeStats = await pool.query(`
      SELECT 
        COUNT(*)::integer as total_pay_codes,
        COUNT(*) FILTER (WHERE is_active = true)::integer as active_pay_codes
      FROM pay_codes
    `);

    let payCodesInUse = 0;
    let unassignedEmployees = 0;

    if (hasUserPayCodes) {
      // Count pay codes that are assigned to at least one employee
      const inUseResult = await pool.query(`
        SELECT COUNT(DISTINCT pay_code_id)::integer as count
        FROM user_pay_codes
      `);
      payCodesInUse = inUseResult.rows[0].count;

      // Count employees without any pay code assigned
      const unassignedResult = await pool.query(`
        SELECT COUNT(*)::integer as count
        FROM users u
        WHERE NOT EXISTS (
          SELECT 1 FROM user_pay_codes upc 
          WHERE upc.user_id = u.id
        )
      `);
      unassignedEmployees = unassignedResult.rows[0].count;
    } else {
      // If user_pay_codes table doesn't exist, all employees are unassigned
      const totalUsersResult = await pool.query(`
        SELECT COUNT(*)::integer as count FROM users
      `);
      unassignedEmployees = totalUsersResult.rows[0].count;
      payCodesInUse = 0;
    }

    res.json({
      total_pay_codes: payCodeStats.rows[0].total_pay_codes,
      active_pay_codes: payCodeStats.rows[0].active_pay_codes,
      pay_codes_in_use: payCodesInUse,
      unassigned_employees: unassignedEmployees
    });
  } catch (error) {
    console.error('Get pay code statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch pay code statistics' });
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

// Get single pay code by ID - MUST be after /statistics and /configurations routes
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        pc.*,
        pc.description as name,
        NULL::numeric as hourly_rate,
        false as is_overtime,
        NULL::numeric as overtime_multiplier
      FROM pay_codes pc
      WHERE pc.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Pay code not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get pay code error:', error);
    res.status(500).json({ error: 'Failed to fetch pay code' });
  }
});

// Delete pay code
router.delete('/:id', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if pay code is in use
    const userPayCodesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_pay_codes'
      );
    `);

    if (userPayCodesCheck.rows[0].exists) {
      const usageCheck = await pool.query(
        `SELECT COUNT(*) as count FROM user_pay_codes WHERE pay_code_id = $1`,
        [id]
      );

      if (parseInt(usageCheck.rows[0].count) > 0) {
        res.status(400).json({ error: 'Cannot delete pay code that is assigned to employees' });
        return;
      }
    }

    const result = await pool.query(
      `DELETE FROM pay_codes WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Pay code not found' });
      return;
    }

    res.json({ message: 'Pay code deleted successfully' });
  } catch (error) {
    console.error('Delete pay code error:', error);
    res.status(500).json({ error: 'Failed to delete pay code' });
  }
});

export default router;
