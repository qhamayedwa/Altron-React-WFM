import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: Request): Promise<{
        success: boolean;
        message: string;
        data: {
            user: Express.User | undefined;
        };
    }>;
    logout(req: Request, res: Response): Promise<void>;
    getProfile(req: Request): Promise<{
        success: boolean;
        data: Express.User | undefined;
    }>;
    updateProfile(req: Request, body: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    changePassword(req: Request, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    checkSession(req: Request): Promise<{
        success: boolean;
        authenticated: boolean;
        user: Express.User | null;
    }>;
}
