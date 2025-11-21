import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

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

      const user = await prisma.user.findFirst({
        where: {
          username: username,
          isActive: true
        },
        include: {
          roles: {
            include: {
              role: true
            }
          },
          tenant: true,
          department: true
        }
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      const token = jwt.sign(
        {
          userId: user.id,
          tenantId: user.tenantId,
          username: user.username
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tenantId: user.tenantId,
          tenantName: user.tenant.name,
          roles: user.roles.map(ur => ur.role.name),
          department: user.department ? {
            id: user.department.id,
            name: user.department.name
          } : null
        },
        token
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

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        tenant: true,
        department: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      employeeNumber: user.employeeNumber,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      roles: user.roles.map(ur => ur.role.name),
      department: user.department ? {
        id: user.department.id,
        name: user.department.name
      } : null,
      phone: user.phone,
      profilePictureUrl: user.profilePictureUrl
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
