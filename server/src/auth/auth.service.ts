import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.users.findUnique({
      where: { username },
      include: {
        jobs: true,
        departments_users_department_idTodepartments: {
          include: {
            sites: {
              include: {
                regions: {
                  include: {
                    companies: true,
                  },
                },
              },
            },
          },
        },
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password_hash, ...result } = user;
    return result;
  }

  async getUserById(id: number): Promise<any> {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        jobs: true,
        departments_users_department_idTodepartments: {
          include: {
            sites: {
              include: {
                regions: {
                  include: {
                    companies: true,
                  },
                },
              },
            },
          },
        },
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user || !user.is_active) {
      return null;
    }

    const { password_hash, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, data: any): Promise<any> {
    const user = await this.prisma.users.update({
      where: { id: userId },
      data: {
        email: data.email,
        phone_number: data.phone_number || data.phone,
        mobile_number: data.mobile_number,
        first_name: data.first_name,
        last_name: data.last_name,
      },
    });

    const { password_hash, ...result } = user;
    return result;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword,
      },
    });
  }

  getUserRoles(user: any): string[] {
    return user.user_roles?.map((ur: any) => ur.roles.name) || [];
  }

  hasRole(user: any, requiredRole: string): boolean {
    const roles = this.getUserRoles(user);
    return roles.includes(requiredRole) || roles.includes('system_super_admin');
  }
}
