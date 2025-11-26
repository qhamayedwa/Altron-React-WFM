import { Router, Response } from 'express';
import { body } from 'express-validator';
import { authenticate, AuthRequest, requireSuperUser } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

router.use(authenticate);

// Get organization dashboard stats
router.get('/dashboard-stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [companiesCount, regionsCount, sitesCount, departmentsCount, employeesCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM companies WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM regions WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM sites WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM departments WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM users WHERE tenant_id = $1 AND is_active = true', [req.user!.tenantId])
    ]);

    // Get companies with their details
    const companiesResult = await query(`
      SELECT c.*,
             (SELECT COUNT(*) FROM regions r WHERE r.company_id = c.id AND r.is_active = true) as regions,
             (SELECT COUNT(*) FROM sites s 
              INNER JOIN regions r ON s.region_id = r.id 
              WHERE r.company_id = c.id AND s.is_active = true) as sites,
             (SELECT COUNT(*) FROM departments d 
              INNER JOIN sites s ON d.site_id = s.id 
              INNER JOIN regions r ON s.region_id = r.id 
              WHERE r.company_id = c.id AND d.is_active = true) as departments,
             (SELECT COUNT(*) FROM users u
              INNER JOIN departments d ON u.department_id = d.id
              INNER JOIN sites s ON d.site_id = s.id
              INNER JOIN regions r ON s.region_id = r.id
              WHERE r.company_id = c.id AND u.is_active = true) as employees
      FROM companies c
      WHERE c.is_active = true
      ORDER BY c.name
    `);

    res.json({
      stats: {
        totalCompanies: parseInt(companiesCount.rows[0]?.count) || 0,
        totalRegions: parseInt(regionsCount.rows[0]?.count) || 0,
        totalSites: parseInt(sitesCount.rows[0]?.count) || 0,
        totalDepartments: parseInt(departmentsCount.rows[0]?.count) || 0,
        totalEmployees: parseInt(employeesCount.rows[0]?.count) || 0
      },
      companyDetails: companiesResult.rows.map(company => ({
        company: {
          id: company.id,
          name: company.name,
          code: company.code,
          legalName: company.legal_name,
          city: company.city,
          country: company.country,
          timezone: company.timezone,
          currency: company.currency
        },
        regions: parseInt(company.regions) || 0,
        sites: parseInt(company.sites) || 0,
        departments: parseInt(company.departments) || 0,
        employees: parseInt(company.employees) || 0
      }))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
  }
});

// Get organization hierarchy
router.get('/hierarchy', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [companies, regions, sites, departments] = await Promise.all([
      query('SELECT * FROM companies WHERE is_active = true ORDER BY name'),
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
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.name`
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
      `SELECT * FROM companies WHERE id = $1`,
      [id]
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
        name, code, legal_name, registration_number, tax_number,
        email, phone, website, address_line1, address_line2, city, state_province,
        postal_code, country, timezone, currency, fiscal_year_start
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [name, code, legalName, registrationNumber, taxNumber,
       email, phone, website, addressLine1, addressLine2, city, stateProvince,
       postalCode, country, timezone, currency, fiscalYearStart]
    );

    res.status(201).json({ success: true, company: result.rows[0] });
  } catch (error: any) {
    console.error('Create company error:', error);
    if (error.code === '23505') {
      if (error.detail?.includes('code')) {
        res.status(400).json({ error: 'A company with this code already exists. Please use a different company code.' });
      } else if (error.detail?.includes('name')) {
        res.status(400).json({ error: 'A company with this name already exists. Please use a different company name.' });
      } else {
        res.status(400).json({ error: 'A company with these details already exists.' });
      }
      return;
    }
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
      WHERE id = $19
      RETURNING *`,
      [name, code, legalName, registrationNumber, taxNumber, email, phone, website,
       addressLine1, addressLine2, city, stateProvince, postalCode, country,
       timezone, currency, fiscalYearStart, isActive !== false, id]
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

// ============================================
// HOLIDAYS
// ============================================

router.get('/holidays', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year } = req.query;
    const yearNum = year ? parseInt(year as string) : new Date().getFullYear();

    const result = await query(
      `SELECT * FROM holidays 
       WHERE tenant_id = $1 AND EXTRACT(YEAR FROM date) = $2
       ORDER BY date ASC`,
      [req.user!.tenantId, yearNum]
    );

    res.json({
      holidays: result.rows.map(h => ({
        id: h.id,
        name: h.name,
        date: h.date,
        holidayType: h.holiday_type,
        isRecurring: h.is_recurring,
        recurringDay: h.recurring_day,
        recurringMonth: h.recurring_month,
        appliesToAll: h.applies_to_all,
        departmentIds: h.department_ids,
        isPaid: h.is_paid,
        description: h.description,
        isActive: h.is_active
      }))
    });
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ error: 'Failed to load holidays' });
  }
});

router.post('/holidays', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, date, holidayType, isRecurring, recurringDay, recurringMonth, appliesToAll, departmentIds, isPaid, description } = req.body;

    const result = await query(
      `INSERT INTO holidays (tenant_id, name, date, holiday_type, is_recurring, recurring_day, recurring_month, applies_to_all, department_ids, is_paid, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.user!.tenantId, name, date, holidayType, isRecurring, recurringDay, recurringMonth, appliesToAll, departmentIds, isPaid, description]
    );

    res.status(201).json({ holiday: result.rows[0] });
  } catch (error) {
    console.error('Create holiday error:', error);
    res.status(500).json({ error: 'Failed to create holiday' });
  }
});

router.put('/holidays/:id', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, date, holidayType, isRecurring, recurringDay, recurringMonth, appliesToAll, departmentIds, isPaid, description } = req.body;

    const result = await query(
      `UPDATE holidays SET 
        name = $1, date = $2, holiday_type = $3, is_recurring = $4, 
        recurring_day = $5, recurring_month = $6, applies_to_all = $7, 
        department_ids = $8, is_paid = $9, description = $10, updated_at = NOW()
       WHERE id = $11 AND tenant_id = $12
       RETURNING *`,
      [name, date, holidayType, isRecurring, recurringDay, recurringMonth, appliesToAll, departmentIds, isPaid, description, id, req.user!.tenantId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Holiday not found' });
      return;
    }

    res.json({ holiday: result.rows[0] });
  } catch (error) {
    console.error('Update holiday error:', error);
    res.status(500).json({ error: 'Failed to update holiday' });
  }
});

router.delete('/holidays/:id', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM holidays WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, req.user!.tenantId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Holiday not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
});

router.post('/holidays/copy-year', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fromYear, toYear } = req.body;

    const holidays = await query(
      `SELECT * FROM holidays 
       WHERE tenant_id = $1 AND EXTRACT(YEAR FROM date) = $2`,
      [req.user!.tenantId, fromYear]
    );

    for (const h of holidays.rows) {
      const newDate = new Date(h.date);
      newDate.setFullYear(toYear);

      await query(
        `INSERT INTO holidays (tenant_id, name, date, holiday_type, is_recurring, recurring_day, recurring_month, applies_to_all, department_ids, is_paid, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT DO NOTHING`,
        [req.user!.tenantId, h.name, newDate, h.holiday_type, h.is_recurring, h.recurring_day, h.recurring_month, h.applies_to_all, h.department_ids, h.is_paid, h.description]
      );
    }

    res.json({ success: true, copied: holidays.rows.length });
  } catch (error) {
    console.error('Copy holidays error:', error);
    res.status(500).json({ error: 'Failed to copy holidays' });
  }
});

// ============================================
// AUDIT LOGS
// ============================================

router.get('/audit-logs', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', per_page = '50', action, entity_type, user_id, start_date, end_date, search } = req.query;
    const pageNum = parseInt(page as string);
    const perPageNum = parseInt(per_page as string);
    const offset = (pageNum - 1) * perPageNum;

    let whereConditions = ['al.tenant_id = $1'];
    const params: any[] = [req.user!.tenantId];
    let paramIndex = 1;

    if (action) {
      paramIndex++;
      whereConditions.push(`al.action = $${paramIndex}`);
      params.push(action);
    }

    if (entity_type) {
      paramIndex++;
      whereConditions.push(`al.entity_type = $${paramIndex}`);
      params.push(entity_type);
    }

    if (user_id) {
      paramIndex++;
      whereConditions.push(`al.user_id = $${paramIndex}`);
      params.push(user_id);
    }

    if (start_date) {
      paramIndex++;
      whereConditions.push(`al.created_at >= $${paramIndex}`);
      params.push(start_date);
    }

    if (end_date) {
      paramIndex++;
      whereConditions.push(`al.created_at <= $${paramIndex}`);
      params.push(end_date);
    }

    if (search) {
      paramIndex++;
      whereConditions.push(`(u.username ILIKE $${paramIndex} OR al.ip_address ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    const countResult = await query(
      `SELECT COUNT(*) FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE ${whereClause}`,
      params
    );

    const logsResult = await query(
      `SELECT al.*, u.username, u.first_name, u.last_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`,
      [...params, perPageNum, offset]
    );

    res.json({
      logs: logsResult.rows.map(l => ({
        id: l.id,
        tenantId: l.tenant_id,
        userId: l.user_id,
        username: l.username,
        userFullName: l.first_name && l.last_name ? `${l.first_name} ${l.last_name}` : null,
        sessionId: l.session_id,
        action: l.action,
        entityType: l.entity_type,
        entityId: l.entity_id,
        oldValue: l.old_value,
        newValue: l.new_value,
        changedFields: l.changed_fields,
        ipAddress: l.ip_address,
        userAgent: l.user_agent,
        metadata: l.metadata,
        createdAt: l.created_at
      })),
      total: parseInt(countResult.rows[0].count),
      page: pageNum,
      perPage: perPageNum
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to load audit logs' });
  }
});

router.get('/audit-logs/export', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, entity_type, start_date, end_date } = req.query;

    let whereConditions = ['al.tenant_id = $1'];
    const params: any[] = [req.user!.tenantId];
    let paramIndex = 1;

    if (action) {
      paramIndex++;
      whereConditions.push(`al.action = $${paramIndex}`);
      params.push(action);
    }

    if (entity_type) {
      paramIndex++;
      whereConditions.push(`al.entity_type = $${paramIndex}`);
      params.push(entity_type);
    }

    if (start_date) {
      paramIndex++;
      whereConditions.push(`al.created_at >= $${paramIndex}`);
      params.push(start_date);
    }

    if (end_date) {
      paramIndex++;
      whereConditions.push(`al.created_at <= $${paramIndex}`);
      params.push(end_date);
    }

    const whereClause = whereConditions.join(' AND ');

    const logsResult = await query(
      `SELECT al.*, u.username, u.first_name, u.last_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT 10000`,
      params
    );

    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Changed Fields'];
    const csvRows = [headers.join(',')];

    logsResult.rows.forEach(log => {
      const values = [
        log.created_at ? new Date(log.created_at).toISOString() : '',
        `"${log.username || 'System'}"`,
        log.action,
        log.entity_type,
        log.entity_id || '',
        log.ip_address || '',
        `"${(log.changed_fields || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(values.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-log-export.csv');
    res.send(csvRows.join('\n'));
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

// ============================================
// COMPLIANCE
// ============================================

router.get('/compliance/metrics', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Generate compliance metrics based on time entries and rules
    const overtimeResult = await query(
      `SELECT COUNT(*) as count FROM time_entries te
       JOIN users u ON te.user_id = u.id
       WHERE u.tenant_id = $1 
       AND te.clock_in_time >= date_trunc('month', CURRENT_DATE)
       AND EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 > 10`,
      [req.user!.tenantId]
    );

    const lateArrivalsResult = await query(
      `SELECT COUNT(*) as count FROM time_entries te
       JOIN users u ON te.user_id = u.id
       LEFT JOIN schedules s ON s.user_id = u.id AND DATE(te.clock_in_time) = s.shift_date
       WHERE u.tenant_id = $1 
       AND te.clock_in_time >= date_trunc('month', CURRENT_DATE)
       AND s.id IS NOT NULL
       AND te.clock_in_time > (s.shift_date + s.start_time + interval '15 minutes')`,
      [req.user!.tenantId]
    );

    const metrics = [
      { 
        id: '1', 
        name: 'Overtime Limit', 
        category: 'Time', 
        score: Math.max(0, 100 - parseInt(overtimeResult.rows[0].count) * 5),
        threshold: 90, 
        status: parseInt(overtimeResult.rows[0].count) < 3 ? 'compliant' : 'warning',
        trend: 'stable', 
        violations: parseInt(overtimeResult.rows[0].count),
        description: 'Employees exceeding daily hour limits' 
      },
      { 
        id: '2', 
        name: 'Late Arrivals', 
        category: 'Attendance', 
        score: Math.max(0, 100 - parseInt(lateArrivalsResult.rows[0].count) * 2),
        threshold: 85, 
        status: parseInt(lateArrivalsResult.rows[0].count) < 10 ? 'compliant' : 'warning',
        trend: 'stable', 
        violations: parseInt(lateArrivalsResult.rows[0].count),
        description: 'Employees clocking in after shift start' 
      }
    ];

    res.json({ metrics });
  } catch (error) {
    console.error('Get compliance metrics error:', error);
    res.status(500).json({ error: 'Failed to load compliance metrics' });
  }
});

router.get('/compliance/violations', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get violations based on time entries with issues
    const result = await query(
      `SELECT te.id, te.user_id, te.clock_in_time, te.clock_out_time, te.status,
              u.first_name, u.last_name, u.username,
              EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 as hours
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
       WHERE u.tenant_id = $1
       AND te.clock_in_time >= date_trunc('month', CURRENT_DATE)
       AND (
         EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 > 10
         OR te.status = 'exception'
       )
       ORDER BY te.clock_in_time DESC
       LIMIT 100`,
      [req.user!.tenantId]
    );

    res.json({
      violations: result.rows.map(v => ({
        id: v.id,
        userId: v.user_id,
        userName: v.first_name && v.last_name ? `${v.first_name} ${v.last_name}` : v.username,
        ruleId: 1,
        ruleName: parseFloat(v.hours) > 10 ? 'Excessive Hours' : 'Exception',
        severity: parseFloat(v.hours) > 12 ? 'critical' : 'warning',
        date: v.clock_in_time,
        status: 'open',
        description: `Worked ${parseFloat(v.hours).toFixed(1)} hours`,
        costImpact: null
      }))
    });
  } catch (error) {
    console.error('Get violations error:', error);
    res.status(500).json({ error: 'Failed to load violations' });
  }
});

router.get('/compliance/costs', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Calculate overtime costs
    const overtimeResult = await query(
      `SELECT COALESCE(SUM(
        CASE WHEN EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 > 8 
          THEN (EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - 8) * COALESCE(u.hourly_rate, 100) * 1.5
          ELSE 0 
        END
      ), 0) as total
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
       WHERE u.tenant_id = $1 
       AND te.clock_in_time >= date_trunc('month', CURRENT_DATE)
       AND te.clock_out_time IS NOT NULL`,
      [req.user!.tenantId]
    );

    const previousResult = await query(
      `SELECT COALESCE(SUM(
        CASE WHEN EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 > 8 
          THEN (EXTRACT(EPOCH FROM (te.clock_out_time - te.clock_in_time)) / 3600.0 - 8) * COALESCE(u.hourly_rate, 100) * 1.5
          ELSE 0 
        END
      ), 0) as total
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
       WHERE u.tenant_id = $1 
       AND te.clock_in_time >= date_trunc('month', CURRENT_DATE) - interval '1 month'
       AND te.clock_in_time < date_trunc('month', CURRENT_DATE)
       AND te.clock_out_time IS NOT NULL`,
      [req.user!.tenantId]
    );

    res.json({
      summary: {
        totalOvertimeCost: parseFloat(overtimeResult.rows[0].total) || 0,
        projectedOvertimeCost: (parseFloat(overtimeResult.rows[0].total) || 0) * 1.15,
        compliancePenaltyCost: 0,
        labourCostVariance: Math.abs((parseFloat(overtimeResult.rows[0].total) || 0) - (parseFloat(previousResult.rows[0].total) || 0)),
        previousPeriodCost: parseFloat(previousResult.rows[0].total) || 0
      }
    });
  } catch (error) {
    console.error('Get compliance costs error:', error);
    res.status(500).json({ error: 'Failed to load costs' });
  }
});

export default router;
