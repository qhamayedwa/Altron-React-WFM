import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    // Get user roles from userRoles relation
    const userRoles = user.userRoles?.map((ur: any) => ur.role?.name || ur.roles?.name) || [];
    
    // Check if user has any of the required roles or is a system_super_admin
    const hasRole = requiredRoles.some((role) => 
      userRoles.includes(role) || userRoles.includes('system_super_admin')
    );
    
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
