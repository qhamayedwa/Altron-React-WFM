import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service';
export declare class SessionSerializer extends PassportSerializer {
    private readonly authService;
    constructor(authService: AuthService);
    serializeUser(user: any, done: (err: Error | null, user: any) => void): void;
    deserializeUser(payload: any, done: (err: Error | null, user: any) => void): Promise<void>;
}
