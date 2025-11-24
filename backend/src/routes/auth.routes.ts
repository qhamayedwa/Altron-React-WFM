import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { username, password } = req.body;

      const userResult = await query(
        `SELECT u.*, t.name as tenant_name, d.id as dept_id, d.name as dept_name,
                array_agg(r.name) FILTER (WHERE r.name IS NOT NULL) as roles
         FROM users u
         LEFT JOIN tenants t ON u.tenant_id = t.id
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN user_roles ur ON u.id = ur.user_id
         LEFT JOIN roles r ON ur.role_id = r.id
         WHERE u.username = $1 AND u.is_active = true
         GROUP BY u.id, t.name, d.id, d.name`,
        [username]
      );

      if (userResult.rows.length === 0) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      const user = userResult.rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      await query(
        'UPDATE users SET last_login = $1 WHERE id = $2',
        [new Date(), user.id]
      );

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        res.status(500).json({ error: 'Server configuration error' });
        return;
      }

      const token = jwt.sign(
        {
          userId: user.id,
          tenantId: user.tenant_id,
          username: user.username
        },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          tenantId: user.tenant_id,
          tenantName: user.tenant_name,
          roles: user.roles || [],
          department: user.dept_id ? {
            id: user.dept_id,
            name: user.dept_name
          } : null
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userResult = await query(
      `SELECT u.*, t.name as tenant_name, d.id as dept_id, d.name as dept_name,
              array_agg(r.name) FILTER (WHERE r.name IS NOT NULL) as roles
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1
       GROUP BY u.id, t.name, d.id, d.name`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userResult.rows[0];

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      employeeNumber: user.employee_number,
      tenantId: user.tenant_id,
      tenantName: user.tenant_name,
      roles: user.roles || [],
      department: user.dept_id ? {
        id: user.dept_id,
        name: user.dept_name
      } : null,
      phone: user.phone,
      profilePictureUrl: user.profile_picture_url
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const usersResult = await query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
              u.employee_number, u.department_id, u.is_active, u.created_at,
              array_agg(r.name) FILTER (WHERE r.name IS NOT NULL) as roles,
              d.name as department_name
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       GROUP BY u.id, d.name
       ORDER BY u.created_at DESC`
    );

    const users = usersResult.rows.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      employee_number: user.employee_number,
      department_id: user.department_id,
      department_name: user.department_name,
      is_active: user.is_active,
      created_at: user.created_at,
      roles: user.roles || []
    }));

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userId = parseInt(req.params.id);

    const userResult = await query(
      `SELECT u.*, 
              array_agg(r.name) FILTER (WHERE r.name IS NOT NULL) as roles,
              d.name as department_name
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1
       GROUP BY u.id, d.name`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userResult.rows[0];

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      employee_number: user.employee_number,
      department_id: user.department_id,
      department_name: user.department_name,
      job_id: user.job_id,
      position: user.employment_type,
      employment_type: user.employment_type,
      hire_date: user.hire_date,
      manager_id: user.manager_id,
      hourly_rate: user.hourly_rate,
      address_line1: user.address_line1,
      address_line2: user.address_line2,
      city: user.city,
      postal_code: user.postal_code,
      emergency_contact_name: user.emergency_contact_name,
      emergency_contact_phone: user.emergency_contact_phone,
      emergency_contact_relationship: user.emergency_contact_relationship,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login,
      roles: user.roles || []
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userId = parseInt(req.params.id);
    const {
      email,
      first_name,
      last_name,
      phone,
      employee_number,
      department_id,
      job_id,
      position,
      employment_type,
      hire_date,
      manager_id,
      hourly_rate,
      address_line1,
      address_line2,
      city,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      is_active,
      roles,
      password
    } = req.body;

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateParams: any[] = [];
    let paramIndex = 1;

    // Add fields to update
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateParams.push(email);
    }
    if (first_name !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      updateParams.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      updateParams.push(last_name);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateParams.push(phone);
    }
    if (employee_number !== undefined) {
      updateFields.push(`employee_number = $${paramIndex++}`);
      updateParams.push(employee_number || null);
    }
    if (department_id !== undefined) {
      updateFields.push(`department_id = $${paramIndex++}`);
      updateParams.push(department_id || null);
    }
    if (job_id !== undefined) {
      updateFields.push(`job_id = $${paramIndex++}`);
      updateParams.push(job_id || null);
    }
    if (employment_type !== undefined) {
      updateFields.push(`employment_type = $${paramIndex++}`);
      updateParams.push(employment_type || null);
    }
    if (hire_date !== undefined) {
      updateFields.push(`hire_date = $${paramIndex++}`);
      updateParams.push(hire_date || null);
    }
    if (manager_id !== undefined) {
      updateFields.push(`manager_id = $${paramIndex++}`);
      updateParams.push(manager_id || null);
    }
    if (hourly_rate !== undefined) {
      updateFields.push(`hourly_rate = $${paramIndex++}`);
      updateParams.push(hourly_rate || null);
    }
    if (address_line1 !== undefined) {
      updateFields.push(`address_line1 = $${paramIndex++}`);
      updateParams.push(address_line1 || null);
    }
    if (address_line2 !== undefined) {
      updateFields.push(`address_line2 = $${paramIndex++}`);
      updateParams.push(address_line2 || null);
    }
    if (city !== undefined) {
      updateFields.push(`city = $${paramIndex++}`);
      updateParams.push(city || null);
    }
    if (postal_code !== undefined) {
      updateFields.push(`postal_code = $${paramIndex++}`);
      updateParams.push(postal_code || null);
    }
    if (emergency_contact_name !== undefined) {
      updateFields.push(`emergency_contact_name = $${paramIndex++}`);
      updateParams.push(emergency_contact_name || null);
    }
    if (emergency_contact_phone !== undefined) {
      updateFields.push(`emergency_contact_phone = $${paramIndex++}`);
      updateParams.push(emergency_contact_phone || null);
    }
    if (emergency_contact_relationship !== undefined) {
      updateFields.push(`emergency_contact_relationship = $${paramIndex++}`);
      updateParams.push(emergency_contact_relationship || null);
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      updateParams.push(is_active !== false);
    }

    // If password is provided, update it too
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`password_hash = $${paramIndex++}`);
      updateParams.push(hashedPassword);
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);

    // Execute update
    if (updateFields.length > 0) {
      updateParams.push(userId);
      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
      
      const updateResult = await query(updateQuery, updateParams);

      if (updateResult.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
    }

    // Update roles if provided
    if (roles && Array.isArray(roles)) {
      // Delete existing roles
      await query('DELETE FROM user_roles WHERE user_id = $1', [userId]);

      // Add new roles
      for (const roleName of roles) {
        const roleResult = await query(
          'SELECT id FROM roles WHERE name = $1',
          [roleName]
        );

        if (roleResult.rows.length > 0) {
          const roleId = roleResult.rows[0].id;
          await query(
            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, roleId]
          );
        }
      }
    }

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/users/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userId = parseInt(req.params.id);

    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [userId]);
    
    if (userCheck.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deleting yourself
    if (userId === req.user.id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    // Delete user roles first (foreign key constraint)
    await query('DELETE FROM user_roles WHERE user_id = $1', [userId]);

    // Delete user
    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const {
        username,
        email,
        password,
        firstName,
        lastName,
        employeeId,
        departmentId,
        jobId,
        position,
        roles,
        isActive
      } = req.body;

      // Check if username already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (existingUser.rows.length > 0) {
        res.status(400).json({ error: 'Username already exists' });
        return;
      }

      // Check if email already exists
      const existingEmail = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingEmail.rows.length > 0) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const userResult = await query(
        `INSERT INTO users (
          username, email, password_hash, first_name, last_name,
          employee_number, department_id, job_id, is_active, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id, username, email, first_name, last_name`,
        [
          username,
          email,
          hashedPassword,
          firstName,
          lastName,
          employeeId || null,
          departmentId || null,
          jobId || null,
          isActive !== false
        ]
      );

      const newUser = userResult.rows[0];

      // Assign roles
      if (roles && Array.isArray(roles) && roles.length > 0) {
        for (const roleName of roles) {
          // Get role ID
          const roleResult = await query(
            'SELECT id FROM roles WHERE name = $1',
            [roleName]
          );

          if (roleResult.rows.length > 0) {
            const roleId = roleResult.rows[0].id;
            await query(
              'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [newUser.id, roleId]
            );
          }
        }
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
