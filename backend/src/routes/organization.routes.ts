import { Router, Response } from 'express';
import { body } from 'express-validator';
import { authenticate, AuthRequest, requireSuperUser } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

router.use(authenticate);

// Get organization hierarchy
router.get('/hierarchy', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [companies, regions, sites, departments] = await Promise.all([
      query('SELECT * FROM companies WHERE tenant_id = $1 AND is_active = true ORDER BY name', [req.user!.tenantId]),
      query('SELECT * FROM regions WHERE is_active = true ORDER BY name'),
      query('SELECT * FROM sites WHERE is_active = true ORDER BY name'),
      query('SELECT * FROM departments WHERE is_active = true ORDER BY name')
    ]);

    res.json({
      companies: companies.rows,
      regions: regions.rows,
      sites: sites.rows,
      departments: departments.rows
    });
  } catch (error) {
    console.error('Get hierarchy error:', error);
    res.status(500).json({ error: 'Failed to retrieve organization hierarchy' });
  }
});

// Get departments
router.get('/departments', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT d.*, s.name as site_name, u.first_name || ' ' || u.last_name as manager_name
       FROM departments d
       LEFT JOIN sites s ON d.site_id = s.id
       LEFT JOIN users u ON d.manager_id = u.id
       WHERE d.is_active = true
       ORDER BY d.name`
    );

    res.json({
      departments: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        siteName: row.site_name,
        managerName: row.manager_name,
        costCenter: row.cost_center
      }))
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to retrieve departments' });
  }
});

// Create department
router.post(
  '/departments',
  [
    body('name').trim().notEmpty(),
    body('siteId').isInt()
  ],
  requireSuperUser,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, code, siteId, managerId, description, costCenter } = req.body;
      
      const result = await query(
        `INSERT INTO departments (site_id, name, code, manager_id, description, cost_center)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [siteId, name, code, managerId, description, costCenter]
      );

      res.json({
        success: true,
        department: result.rows[0]
      });
    } catch (error) {
      console.error('Create department error:', error);
      res.status(500).json({ error: 'Failed to create department' });
    }
  }
);

// Get sites
router.get('/sites', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT s.*, r.name as region_name
       FROM sites s
       LEFT JOIN regions r ON s.region_id = r.id
       WHERE s.is_active = true
       ORDER BY s.name`
    );

    res.json({
      sites: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        regionName: row.region_name,
        city: row.city,
        latitude: row.latitude,
        longitude: row.longitude
      }))
    });
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({ error: 'Failed to retrieve sites' });
  }
});

export default router;
