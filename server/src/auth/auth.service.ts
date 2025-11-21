import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { username },
      relations: [
        'job',
        'department',
        'department.site',
        'department.site.region',
        'department.site.region.company',
        'userRoles',
        'userRoles.role',
      ],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async getUserById(id: number): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: [
        'job',
        'department',
        'department.site',
        'department.site.region',
        'department.site.region.company',
        'userRoles',
        'userRoles.role',
      ],
    });

    if (!user || !user.isActive) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, data: any): Promise<any> {
    await this.userRepo.update(userId, {
      email: data.email,
      phone: data.phone_number || data.phone,
      firstName: data.first_name,
      lastName: data.last_name,
    });

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(userId, {
      passwordHash: hashedPassword,
    });
  }

  getUserRoles(user: any): string[] {
    return user.userRoles?.map((ur: any) => ur.role.name) || [];
  }

  hasRole(user: any, requiredRole: string): boolean {
    const roles = this.getUserRoles(user);
    return roles.includes(requiredRole) || roles.includes('system_super_admin');
  }
}
