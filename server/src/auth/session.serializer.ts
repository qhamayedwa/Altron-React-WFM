import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, user: any) => void): void {
    done(null, { id: user.id });
  }

  async deserializeUser(payload: any, done: (err: Error | null, user: any) => void): Promise<void> {
    const user = await this.authService.getUserById(payload.id);
    done(null, user);
  }
}
