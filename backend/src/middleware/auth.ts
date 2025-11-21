import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      username: user.username,
      email: user.email,
      roles: user.roles.map(ur => ur.role.name)
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
