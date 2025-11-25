import { Router, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { authenticate, AuthRequest, requireRole, requireSuperUser } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

router.use(authenticate);

// Get all users (Super User only)
router.get('/', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId, status, search } = req.query;
    
    let sql = `
      SELECT u.*, d.name as department_name, array_agg(r.name) FILTER (WHERE r.name IS NOT NULL) as roles
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.tenant_id = $1
    `;
    const params: any[] = [req.user!.tenantId];
    
    if (departmentId) {
      params.push(departmentId);
      sql += ` AND u.department_id = $${params.length}`;
    }
    
    if (status) {
      params.push(status === 'active');
      sql += ` AND u.is_active = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR u.username ILIKE $${params.length} OR u.employee_number ILIKE $${params.length})`;
    }
    
    sql += ' GROUP BY u.id, d.name ORDER BY u.last_name, u.first_name LIMIT 500';
    
    const result = await query(sql, params);

    res.json({
      users: result.rows.map(row => ({
        id: row.id,
        username: row.username,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        employeeNumber: row.employee_number,
        department: row.department_name,
        isActive: row.is_active,
        roles: row.roles || [],
        hireDate: row.hire_date,
        phone: row.phone
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Get team users (for managers and super users)
router.get('/team', requireRole('Manager', 'Super User'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.first_name, u.last_name, u.employee_number, 
              d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.tenant_id = $1 AND u.is_active = true
       ORDER BY u.last_name, u.first_name`,
      [req.user!.tenantId]
    );

    res.json({
      users: result.rows.map(row => ({
        id: row.id,
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        employee_number: row.employee_number,
        department: row.department_name
      }))
    });
  } catch (error) {
    console.error('Get team users error:', error);
    res.status(500).json({ error: 'Failed to retrieve team users' });
  }
});

// Get managers (users with Manager role)
router.get('/managers', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT DISTINCT u.id, u.username, u.first_name, u.last_name, u.email
       FROM users u
       INNER JOIN user_roles ur ON u.id = ur.user_id
       INNER JOIN roles r ON ur.role_id = r.id
       WHERE r.name IN ('Manager', 'Super User') AND u.is_active = true
       ORDER BY u.last_name, u.first_name`
    );

    res.json({
      managers: result.rows.map(row => ({
        id: row.id,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        fullName: `${row.first_name} ${row.last_name}`
      }))
    });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ error: 'Failed to retrieve managers' });
  }
});

// Get single user
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT u.*, d.name as department_name, j.title as job_title, t.name as tenant_name,
              array_agg(r.name) FILTER (WHERE r.name IS NOT NULL) as roles
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN jobs j ON u.job_id = j.id
       LEFT JOIN tenants t ON u.tenant_id = t.id
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1
       GROUP BY u.id, d.name, j.title, t.name`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      employeeNumber: user.employee_number,
      tenantId: user.tenant_id,
      tenantName: user.tenant_name,
      department: user.department_name,
      jobTitle: user.job_title,
      roles: user.roles || [],
      hireDate: user.hire_date,
      terminationDate: user.termination_date,
      employmentType: user.employment_type,
      employmentStatus: user.employment_status,
      phone: user.phone,
      addressLine1: user.address_line1,
      addressLine2: user.address_line2,
      city: user.city,
      postalCode: user.postal_code,
      hourlyRate: user.hourly_rate,
      annualSalary: user.annual_salary,
      isActive: user.is_active,
      profilePictureUrl: user.profile_picture_url,
      createdAt: user.created_at,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// Create user (Super User only)
router.post(
  '/',
  [
    body('username').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
  ],
  requireSuperUser,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { username, email, password, firstName, lastName, employeeNumber, departmentId, phone } = req.body;
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await query(
        `INSERT INTO users (tenant_id, username, email, password_hash, first_name, last_name, employee_number, department_id, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, username, email, first_name, last_name, employee_number`,
        [req.user!.tenantId, username, email, hashedPassword, firstName, lastName, employeeNumber, departmentId, phone]
      );

      res.json({
        success: true,
        user: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          email: result.rows[0].email,
          firstName: result.rows[0].first_name,
          lastName: result.rows[0].last_name,
          employeeNumber: result.rows[0].employee_number
        }
      });
    } catch (error: any) {
      console.error('Create user error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'Username or email already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  }
);

// Update user
router.put('/:id', requireRole('Super User', 'HR'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, departmentId, employmentType, employmentStatus, hourlyRate, annualSalary } = req.body;
    
    const result = await query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           department_id = COALESCE($5, department_id),
           employment_type = COALESCE($6, employment_type),
           employment_status = COALESCE($7, employment_status),
           hourly_rate = COALESCE($8, hourly_rate),
           annual_salary = COALESCE($9, annual_salary),
           updated_at = NOW()
       WHERE id = $10
       RETURNING id`,
      [firstName, lastName, email, phone, departmentId, employmentType, employmentStatus, hourlyRate, annualSalary, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Deactivate user
router.post('/:id/deactivate', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await query(
      'UPDATE users SET is_active = false, employment_status = $1, termination_date = NOW() WHERE id = $2',
      ['terminated', id]
    );

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Assign role to user
router.post('/:id/roles/:roleId', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, roleId } = req.params;
    
    await query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [id, roleId]
    );

    res.json({
      success: true,
      message: 'Role assigned successfully'
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
});

// Remove role from user
router.delete('/:id/roles/:roleId', requireSuperUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, roleId } = req.params;
    
    await query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [id, roleId]
    );

    res.json({
      success: true,
      message: 'Role removed successfully'
    });
  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({ error: 'Failed to remove role' });
  }
});

// Get all roles
router.get('/roles/all', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM roles ORDER BY name');

    res.json({
      roles: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description
      }))
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to retrieve roles' });
  }
});

export default router;
