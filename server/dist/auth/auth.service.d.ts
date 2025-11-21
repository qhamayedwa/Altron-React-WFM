import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class AuthService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    validateUser(username: string, password: string): Promise<any>;
    getUserById(id: number): Promise<any>;
    updateProfile(userId: number, data: any): Promise<any>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
    getUserRoles(user: any): string[];
    hasRole(user: any, requiredRole: string): boolean;
}
