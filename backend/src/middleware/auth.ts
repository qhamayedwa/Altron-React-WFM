import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/database';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    tenantId: number;
    username: string;
    email: string;
    roles: string[];
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      userId: number;
      tenantId: number;
    };

    const userResult = await query(
      `SELECT u.*, array_agg(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1 AND u.is_active = true
       GROUP BY u.id`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const user = userResult.rows[0];

    req.user = {
      id: user.id,
      tenantId: user.tenant_id,
      username: user.username,
      email: user.email,
      roles: user.roles || []
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role));

    if (!hasRole) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireSuperUser = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const isSuperUser = req.user.roles.includes('Super User') || 
                       req.user.roles.includes('system_super_admin');

  if (!isSuperUser) {
    res.status(403).json({ error: 'Super User access required' });
    return;
  }

  next();
};
