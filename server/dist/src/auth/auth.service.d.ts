import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validateUser(username: string, password: string): Promise<any>;
    getUserById(id: number): Promise<any>;
    updateProfile(userId: number, data: any): Promise<any>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
    getUserRoles(user: any): string[];
    hasRole(user: any, requiredRole: string): boolean;
}
