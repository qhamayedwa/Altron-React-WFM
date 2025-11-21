import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class SpaFallbackMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, url } = req;
    
    if (method === 'GET' && !url.startsWith('/auth') && !url.startsWith('/time') && 
        !url.startsWith('/leave') && !url.startsWith('/scheduling') && 
        !url.startsWith('/payroll') && !url.startsWith('/ai') && 
        !url.startsWith('/organization') && !url.startsWith('/notifications') && 
        !url.startsWith('/sage-vip') && !url.startsWith('/reports') && 
        !url.startsWith('/dashboard') && !url.startsWith('/assets')) {
      
      const indexPath = join(__dirname, '..', '..', 'client', 'dist', 'index.html');
      
      if (existsSync(indexPath)) {
        res.sendFile(indexPath);
        return;
      }
    }
    
    next();
  }
}
