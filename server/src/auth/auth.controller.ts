import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request) {
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: req.user,
      },
    };
  }

  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    req.logout((err) => {
      if (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Logout failed',
        });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Session destruction failed',
          });
        }
        res.clearCookie('connect.sid');
        return res.json({
          success: true,
          message: 'Logout successful',
        });
      });
    });
  }

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  async getProfile(@Req() req: Request) {
    return {
      success: true,
      data: req.user,
    };
  }

  @Put('profile')
  @UseGuards(AuthenticatedGuard)
  async updateProfile(@Req() req: Request, @Body() body: any) {
    const user = await this.authService.updateProfile((req.user as any).id, body);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: user,
    };
  }

  @Post('change-password')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    await this.authService.changePassword(
      (req.user as any).id,
      body.currentPassword,
      body.newPassword,
    );
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  @Get('session')
  async checkSession(@Req() req: Request) {
    return {
      success: true,
      authenticated: req.isAuthenticated(),
      user: req.isAuthenticated() ? req.user : null,
    };
  }
}
