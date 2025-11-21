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

export default router;
