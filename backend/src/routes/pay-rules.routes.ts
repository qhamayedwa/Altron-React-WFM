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
          name: 'Standard Overtime',
          description: 'Applies 1.5x rate for hours over 8 per day',
          conditions: JSON.stringify({ overtime_threshold: 8 }),
          actions: JSON.stringify({ pay_multiplier: 1.5, component_name: 'overtime_1_5' }),
          priority: 100,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by_id: 1
        },
        {
          id: 2,
          name: 'Double Time',
          description: 'Applies 2.0x rate for hours over 12 per day',
          conditions: JSON.stringify({ overtime_threshold: 12 }),
          actions: JSON.stringify({ pay_multiplier: 2.0, component_name: 'double_time' }),
          priority: 200,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by_id: 1
        }
      ];
      res.json(mockRules);
      return;
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
      name,
      description,
      conditions,
      actions,
      priority,
      is_active
    } = req.body;

    // Convert conditions and actions objects to JSON strings
    const conditionsJson = conditions ? JSON.stringify(conditions) : '{}';
    const actionsJson = actions ? JSON.stringify(actions) : '{}';

    const result = await pool.query(
      `INSERT INTO pay_rules (
        name, description, conditions, actions, priority, is_active,
        created_at, updated_at, created_by_id
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
      RETURNING *`,
      [
        name,
        description,
        conditionsJson,
        actionsJson,
        priority || 100,
        is_active !== false,
        req.user!.id
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
      name,
      description,
      conditions,
      actions,
      priority,
      is_active
    } = req.body;

    // Convert conditions and actions objects to JSON strings
    const conditionsJson = conditions ? JSON.stringify(conditions) : '{}';
    const actionsJson = actions ? JSON.stringify(actions) : '{}';

    const result = await pool.query(
      `UPDATE pay_rules SET
        name = $1,
        description = $2,
        conditions = $3,
        actions = $4,
        priority = $5,
        is_active = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *`,
      [
        name,
        description,
        conditionsJson,
        actionsJson,
        priority,
        is_active,
        id
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Pay rule not found' });
      return;
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
      res.status(404).json({ error: 'Pay rule not found' });
      return;
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
