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
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
              u.employee_number, u.department_id, u.job_id, u.is_active, u.created_at,
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
      employee_number: user.employee_number,
      department_id: user.department_id,
      department_name: user.department_name,
      job_id: user.job_id,
      is_active: user.is_active,
      created_at: user.created_at,
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
      employee_number,
      department_id,
      job_id,
      is_active,
      roles,
      password
    } = req.body;

    // Update user basic info
    let updateQuery = `UPDATE users SET 
      email = $1, 
      first_name = $2, 
      last_name = $3, 
      employee_number = $4, 
      department_id = $5, 
      job_id = $6, 
      is_active = $7`;
    
    let updateParams: any[] = [
      email,
      first_name,
      last_name,
      employee_number || null,
      department_id || null,
      job_id || null,
      is_active !== false
    ];

    // If password is provided, update it too
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password_hash = $${updateParams.length + 1}`;
      updateParams.push(hashedPassword);
    }

    updateQuery += ` WHERE id = $${updateParams.length + 1} RETURNING id`;
    updateParams.push(userId);

    const updateResult = await query(updateQuery, updateParams);

    if (updateResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
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
