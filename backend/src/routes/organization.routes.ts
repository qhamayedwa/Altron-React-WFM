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

// Get single department with employees
router.get('/departments/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deptResult = await query(
      `SELECT d.*, s.name as site_name, s.id as site_id,
              r.name as region_name, r.id as region_id,
              c.name as company_name, c.id as company_id,
              u.first_name || ' ' || u.last_name as manager_name
       FROM departments d
       LEFT JOIN sites s ON d.site_id = s.id
       LEFT JOIN regions r ON s.region_id = r.id
       LEFT JOIN companies c ON r.company_id = c.id
       LEFT JOIN users u ON d.manager_id = u.id
       WHERE d.id = $1`,
      [id]
    );

    if (deptResult.rows.length === 0) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const dept = deptResult.rows[0];
    
    const employeesResult = await query(
      `SELECT id, employee_number, first_name, last_name, email, phone, is_active
       FROM users
       WHERE department_id = $1
       ORDER BY last_name, first_name`,
      [id]
    );

    res.json({
      department: {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        manager_name: dept.manager_name,
        email: dept.email,
        phone: dept.phone,
        extension: dept.extension,
        cost_center: dept.cost_center,
        budget_code: dept.budget_code,
        standard_hours_per_day: dept.standard_hours_per_day || 8.0,
        standard_hours_per_week: dept.standard_hours_per_week || 40.0,
        site: {
          id: dept.site_id,
          name: dept.site_name,
          region: {
            id: dept.region_id,
            name: dept.region_name,
            company: {
              id: dept.company_id,
              name: dept.company_name
            }
          }
        }
      },
      employees: employeesResult.rows.map(emp => ({
        id: emp.id,
        employee_number: emp.employee_number,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        phone: emp.phone,
        is_active: emp.is_active
      }))
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ error: 'Failed to retrieve department' });
  }
});

// Get current user's department
router.get('/my-department', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deptResult = await query(
      `SELECT d.*, COUNT(DISTINCT u.id) as employee_count
       FROM departments d
       LEFT JOIN users u ON u.department_id = d.id
       WHERE d.manager_id = $1
       GROUP BY d.id`,
      [req.user!.id]
    );

    if (deptResult.rows.length === 0) {
      res.json({
        department: null,
        team_members: [],
        active_count: 0,
        on_leave_count: 0,
        scheduled_count: 0
      });
      return;
    }

    const dept = deptResult.rows[0];
    
    const teamResult = await query(
      `SELECT u.id, u.username, u.first_name || ' ' || u.last_name as full_name,
              u.email, u.phone, u.employee_number
       FROM users u
       WHERE u.department_id = $1
       ORDER BY u.last_name, u.first_name`,
      [dept.id]
    );

    res.json({
      department: {
        id: dept.id,
        name: dept.name,
        description: dept.description
      },
      team_members: teamResult.rows.map(member => ({
        id: member.id,
        username: member.username,
        full_name: member.full_name,
        email: member.email,
        phone: member.phone,
        employee_number: member.employee_number
      })),
      active_count: 0,
      on_leave_count: 0,
      scheduled_count: 0
    });
  } catch (error) {
    console.error('Get my department error:', error);
    res.status(500).json({ error: 'Failed to retrieve department' });
  }
});

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

// Get single site with departments and stats
router.get('/sites/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const siteResult = await query(
      `SELECT s.*, r.name as region_name, r.id as region_id,
              c.name as company_name, c.id as company_id
       FROM sites s
       LEFT JOIN regions r ON s.region_id = r.id
       LEFT JOIN companies c ON r.company_id = c.id
       WHERE s.id = $1`,
      [id]
    );

    if (siteResult.rows.length === 0) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const site = siteResult.rows[0];
    
    const departmentsResult = await query(
      `SELECT d.id, d.name, d.code, u.first_name || ' ' || u.last_name as manager_name,
              COUNT(DISTINCT ue.id) as employee_count
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       LEFT JOIN users ue ON ue.department_id = d.id
       WHERE d.site_id = $1 AND d.is_active = true
       GROUP BY d.id, d.name, d.code, u.first_name, u.last_name
       ORDER BY d.name`,
      [id]
    );

    const employeeCount = await query(
      `SELECT COUNT(DISTINCT u.id) as total
       FROM users u
       JOIN departments d ON u.department_id = d.id
       WHERE d.site_id = $1`,
      [id]
    );

    res.json({
      site: {
        id: site.id,
        name: site.name,
        code: site.code,
        description: site.description,
        regionId: site.region_id,
        regionName: site.region_name,
        companyId: site.company_id,
        companyName: site.company_name,
        managerName: site.manager_name,
        email: site.email,
        phone: site.phone,
        addressLine1: site.address_line1,
        addressLine2: site.address_line2,
        city: site.city,
        stateProvince: site.state_province,
        postalCode: site.postal_code,
        timezone: site.timezone
      },
      departments: departmentsResult.rows.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        managerName: d.manager_name,
        employeeCount: parseInt(d.employee_count) || 0
      })),
      stats: {
        departments: departmentsResult.rows.length,
        employees: parseInt(employeeCount.rows[0]?.total) || 0
      }
    });
  } catch (error) {
    console.error('Get site error:', error);
    res.status(500).json({ error: 'Failed to retrieve site' });
  }
});

// Create site
router.post('/sites', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      regionId, name, code, description, managerName, email, phone,
      addressLine1, addressLine2, city, stateProvince, postalCode, timezone
    } = req.body;

    const result = await query(
      `INSERT INTO sites (
        region_id, name, code, description, manager_name, email, phone,
        address_line1, address_line2, city, state_province, postal_code, timezone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [regionId, name, code, description, managerName, email, phone,
       addressLine1, addressLine2, city, stateProvince, postalCode, timezone]
    );

    res.status(201).json({ success: true, site: result.rows[0] });
  } catch (error) {
    console.error('Create site error:', error);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// Get regions
router.get('/regions', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT r.*, c.name as company_name, c.code as company_code
       FROM regions r
       LEFT JOIN companies c ON r.company_id = c.id
       WHERE r.is_active = true
       ORDER BY r.name`
    );

    res.json({
      regions: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        companyName: row.company_name,
        companyCode: row.company_code
      }))
    });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: 'Failed to retrieve regions' });
  }
});

// Get single region with sites and stats
router.get('/regions/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const regionResult = await query(
      `SELECT r.*, c.name as company_name, c.code as company_code, c.id as company_id
       FROM regions r
       LEFT JOIN companies c ON r.company_id = c.id
       WHERE r.id = $1`,
      [id]
    );

    if (regionResult.rows.length === 0) {
      res.status(404).json({ error: 'Region not found' });
      return;
    }

    const region = regionResult.rows[0];
    
    const sitesResult = await query(
      `SELECT s.id, s.name, s.code, s.manager_name,
              COUNT(DISTINCT d.id) as department_count
       FROM sites s
       LEFT JOIN departments d ON d.site_id = s.id AND d.is_active = true
       WHERE s.region_id = $1 AND s.is_active = true
       GROUP BY s.id, s.name, s.code, s.manager_name
       ORDER BY s.name`,
      [id]
    );

    const stats = await query(
      `SELECT 
        COUNT(DISTINCT s.id) as site_count,
        COUNT(DISTINCT d.id) as department_count,
        COUNT(DISTINCT u.id) as employee_count
       FROM sites s
       LEFT JOIN departments d ON d.site_id = s.id AND d.is_active = true
       LEFT JOIN users u ON u.department_id = d.id
       WHERE s.region_id = $1 AND s.is_active = true`,
      [id]
    );

    res.json({
      region: {
        id: region.id,
        name: region.name,
        code: region.code,
        description: region.description,
        companyId: region.company_id,
        companyName: region.company_name,
        companyCode: region.company_code,
        managerName: region.manager_name,
        email: region.email,
        phone: region.phone,
        addressLine1: region.address_line1,
        addressLine2: region.address_line2,
        city: region.city,
        stateProvince: region.state_province,
        postalCode: region.postal_code,
        timezone: region.timezone
      },
      sites: sitesResult.rows.map(s => ({
        id: s.id,
        name: s.name,
        code: s.code,
        managerName: s.manager_name,
        departmentCount: parseInt(s.department_count) || 0
      })),
      stats: {
        sites: parseInt(stats.rows[0]?.site_count) || 0,
        departments: parseInt(stats.rows[0]?.department_count) || 0,
        employees: parseInt(stats.rows[0]?.employee_count) || 0
      }
    });
  } catch (error) {
    console.error('Get region error:', error);
    res.status(500).json({ error: 'Failed to retrieve region' });
  }
});

// Create region
router.post('/regions', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      companyId, name, code, description, managerName, email, phone,
      addressLine1, addressLine2, city, stateProvince, postalCode, timezone
    } = req.body;

    const result = await query(
      `INSERT INTO regions (
        company_id, name, code, description, manager_name, email, phone,
        address_line1, address_line2, city, state_province, postal_code, timezone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [companyId, name, code, description, managerName, email, phone,
       addressLine1, addressLine2, city, stateProvince, postalCode, timezone]
    );

    res.status(201).json({ success: true, region: result.rows[0] });
  } catch (error) {
    console.error('Create region error:', error);
    res.status(500).json({ error: 'Failed to create region' });
  }
});

// Update region
router.put('/regions/:id', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name, code, description, managerName, email, phone,
      addressLine1, addressLine2, city, stateProvince, postalCode, timezone, isActive
    } = req.body;

    const result = await query(
      `UPDATE regions SET
        name = $1, code = $2, description = $3, manager_name = $4,
        email = $5, phone = $6, address_line1 = $7, address_line2 = $8, city = $9,
        state_province = $10, postal_code = $11, timezone = $12, is_active = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *`,
      [name, code, description, managerName, email, phone,
       addressLine1, addressLine2, city, stateProvince, postalCode, timezone,
       isActive !== false, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Region not found' });
      return;
    }

    res.json({ success: true, region: result.rows[0] });
  } catch (error) {
    console.error('Update region error:', error);
    res.status(500).json({ error: 'Failed to update region' });
  }
});

// Delete region
router.delete('/regions/:id', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sitesCheck = await query(
      `SELECT COUNT(*) as count FROM sites WHERE region_id = $1 AND is_active = true`,
      [id]
    );

    if (parseInt(sitesCheck.rows[0].count) > 0) {
      res.status(400).json({ 
        error: `Cannot delete region with ${sitesCheck.rows[0].count} active sites. Please deactivate or move all sites first.` 
      });
      return;
    }

    const result = await query(
      `UPDATE regions SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Region not found' });
      return;
    }

    res.json({ success: true, message: 'Region deactivated successfully' });
  } catch (error) {
    console.error('Delete region error:', error);
    res.status(500).json({ error: 'Failed to delete region' });
  }
});

// Assign employee to department
router.post('/departments/:id/assign-employee', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const result = await query(
      `UPDATE users SET department_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [id, employeeId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    res.json({ success: true, message: 'Employee assigned successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Assign employee error:', error);
    res.status(500).json({ error: 'Failed to assign employee' });
  }
});

// Get companies
router.get('/companies', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(DISTINCT r.id) as region_count
       FROM companies c
       LEFT JOIN regions r ON r.company_id = c.id AND r.is_active = true
       WHERE c.tenant_id = $1 AND c.is_active = true
       GROUP BY c.id
       ORDER BY c.name`,
      [req.user!.tenantId]
    );

    res.json({
      companies: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        legalName: row.legal_name,
        city: row.city,
        country: row.country,
        regionCount: parseInt(row.region_count) || 0
      }))
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to retrieve companies' });
  }
});

// Get single company with hierarchy
router.get('/companies/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const companyResult = await query(
      `SELECT * FROM companies WHERE id = $1 AND tenant_id = $2`,
      [id, req.user!.tenantId]
    );

    if (companyResult.rows.length === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const company = companyResult.rows[0];
    
    // Get regions for this company
    const regionsResult = await query(
      `SELECT r.id, r.name, r.code, r.description, r.city, r.manager_name,
              COUNT(DISTINCT s.id) as site_count
       FROM regions r
       LEFT JOIN sites s ON s.region_id = r.id AND s.is_active = true
       WHERE r.company_id = $1 AND r.is_active = true
       GROUP BY r.id
       ORDER BY r.name`,
      [id]
    );

    // Get stats
    const statsResult = await query(
      `SELECT 
        COUNT(DISTINCT r.id) as regions,
        COUNT(DISTINCT s.id) as sites,
        COUNT(DISTINCT d.id) as departments,
        COUNT(DISTINCT u.id) as employees
       FROM companies c
       LEFT JOIN regions r ON r.company_id = c.id AND r.is_active = true
       LEFT JOIN sites s ON s.region_id = r.id AND s.is_active = true
       LEFT JOIN departments d ON d.site_id = s.id AND d.is_active = true
       LEFT JOIN users u ON u.department_id = d.id
       WHERE c.id = $1`,
      [id]
    );

    res.json({
      company: {
        id: company.id,
        name: company.name,
        code: company.code,
        legalName: company.legal_name,
        registrationNumber: company.registration_number,
        taxNumber: company.tax_number,
        email: company.email,
        phone: company.phone,
        website: company.website,
        addressLine1: company.address_line1,
        addressLine2: company.address_line2,
        city: company.city,
        stateProvince: company.state_province,
        postalCode: company.postal_code,
        country: company.country,
        timezone: company.timezone,
        currency: company.currency,
        fiscalYearStart: company.fiscal_year_start
      },
      regions: regionsResult.rows.map(r => ({
        id: r.id,
        name: r.name,
        code: r.code,
        description: r.description,
        city: r.city,
        manager_name: r.manager_name,
        siteCount: parseInt(r.site_count) || 0
      })),
      stats: {
        regions: parseInt(statsResult.rows[0]?.regions) || 0,
        sites: parseInt(statsResult.rows[0]?.sites) || 0,
        departments: parseInt(statsResult.rows[0]?.departments) || 0,
        employees: parseInt(statsResult.rows[0]?.employees) || 0
      }
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to retrieve company' });
  }
});

// Create company
router.post('/companies', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name, code, legalName, registrationNumber, taxNumber, email, phone, website,
      addressLine1, addressLine2, city, stateProvince, postalCode, country,
      timezone, currency, fiscalYearStart
    } = req.body;

    const result = await query(
      `INSERT INTO companies (
        tenant_id, name, code, legal_name, registration_number, tax_number,
        email, phone, website, address_line1, address_line2, city, state_province,
        postal_code, country, timezone, currency, fiscal_year_start
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [req.user!.tenantId, name, code, legalName, registrationNumber, taxNumber,
       email, phone, website, addressLine1, addressLine2, city, stateProvince,
       postalCode, country, timezone, currency, fiscalYearStart]
    );

    res.status(201).json({ success: true, company: result.rows[0] });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
router.put('/companies/:id', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name, code, legalName, registrationNumber, taxNumber, email, phone, website,
      addressLine1, addressLine2, city, stateProvince, postalCode, country,
      timezone, currency, fiscalYearStart, isActive
    } = req.body;

    const result = await query(
      `UPDATE companies SET
        name = $1, code = $2, legal_name = $3, registration_number = $4,
        tax_number = $5, email = $6, phone = $7, website = $8,
        address_line1 = $9, address_line2 = $10, city = $11, state_province = $12,
        postal_code = $13, country = $14, timezone = $15, currency = $16,
        fiscal_year_start = $17, is_active = $18, updated_at = CURRENT_TIMESTAMP
      WHERE id = $19 AND tenant_id = $20
      RETURNING *`,
      [name, code, legalName, registrationNumber, taxNumber, email, phone, website,
       addressLine1, addressLine2, city, stateProvince, postalCode, country,
       timezone, currency, fiscalYearStart, isActive !== false, id, req.user!.tenantId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json({ success: true, company: result.rows[0] });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Update site
router.put('/sites/:id', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name, code, description, managerId, managerName, email, phone,
      addressLine1, addressLine2, city, stateProvince, postalCode, timezone, isActive
    } = req.body;

    const result = await query(
      `UPDATE sites SET
        name = $1, code = $2, description = $3, manager_id = $4, manager_name = $5,
        email = $6, phone = $7, address_line1 = $8, address_line2 = $9, city = $10,
        state_province = $11, postal_code = $12, timezone = $13, is_active = $14,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *`,
      [name, code, description, managerId, managerName, email, phone,
       addressLine1, addressLine2, city, stateProvince, postalCode, timezone,
       isActive !== false, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    res.json({ success: true, site: result.rows[0] });
  } catch (error) {
    console.error('Update site error:', error);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

export default router;
