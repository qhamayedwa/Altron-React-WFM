import { Router } from 'express';
import pool from '../db/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all pay rules with mock data fallback
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if pay_rules table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pay_rules'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      // Return mock data if table doesn't exist
      const mockRules = [
        {
          id: 1,
          rule_name: 'Standard Overtime',
          rule_category: 'overtime',
          rule_type: 'percentage',
          calculation_method: 'hours_worked',
          priority: 1,
          is_active: true,
          description: 'Applies 1.5x rate for hours over 8 per day',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          rule_name: 'Double Time',
          rule_category: 'overtime',
          rule_type: 'percentage',
          calculation_method: 'hours_worked',
          priority: 0,
          is_active: true,
          description: 'Applies 2.0x rate for hours over 12 per day',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      return res.json(mockRules);
    }

    const result = await pool.query(
      `SELECT * FROM pay_rules ORDER BY priority, id`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get pay rules error:', error);
    res.status(500).json({ error: 'Failed to fetch pay rules' });
  }
});

// Create pay rule
router.post('/', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const {
      rule_name,
      rule_category,
      rule_type,
      calculation_method,
      base_rate,
      multiplier,
      cap_amount,
      priority,
      is_active,
      description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO pay_rules (
        rule_name, rule_category, rule_type, calculation_method,
        base_rate, multiplier, cap_amount, priority, is_active, description,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [
        rule_name,
        rule_category,
        rule_type,
        calculation_method,
        base_rate,
        multiplier,
        cap_amount,
        priority,
        is_active,
        description
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create pay rule error:', error);
    res.status(500).json({ error: 'Failed to create pay rule' });
  }
});

// Update pay rule
router.put('/:id', authenticate, requireRole('Payroll', 'Super User'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      rule_name,
      rule_category,
      rule_type,
      calculation_method,
      base_rate,
      multiplier,
      cap_amount,
      priority,
      is_active,
      description
    } = req.body;

    const result = await pool.query(
      `UPDATE pay_rules SET
        rule_name = $1,
        rule_category = $2,
        rule_type = $3,
        calculation_method = $4,
        base_rate = $5,
        multiplier = $6,
        cap_amount = $7,
        priority = $8,
        is_active = $9,
        description = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING *`,
      [
        rule_name,
        rule_category,
        rule_type,
        calculation_method,
        base_rate,
        multiplier,
        cap_amount,
        priority,
        is_active,
        description,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pay rule not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update pay rule error:', error);
    res.status(500).json({ error: 'Failed to update pay rule' });
  }
});

// Test pay rule
router.post('/:id/test', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { hours_worked, base_rate } = req.body;

    const ruleResult = await pool.query('SELECT * FROM pay_rules WHERE id = $1', [id]);
    
    if (ruleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pay rule not found' });
    }

    const rule = ruleResult.rows[0];
    let calculated_amount = 0;

    // Simple calculation logic based on rule type
    if (rule.rule_type === 'percentage' && rule.multiplier) {
      calculated_amount = hours_worked * base_rate * parseFloat(rule.multiplier);
    } else if (rule.rule_type === 'fixed' && rule.base_rate) {
      calculated_amount = parseFloat(rule.base_rate);
    } else {
      calculated_amount = hours_worked * base_rate;
    }

    // Apply cap if set
    if (rule.cap_amount && calculated_amount > parseFloat(rule.cap_amount)) {
      calculated_amount = parseFloat(rule.cap_amount);
    }

    res.json({
      rule_name: rule.rule_name,
      hours_worked,
      base_rate,
      calculated_amount: parseFloat(calculated_amount.toFixed(2))
    });
  } catch (error) {
    console.error('Test pay rule error:', error);
    res.status(500).json({ error: 'Failed to test pay rule' });
  }
});

export default router;
