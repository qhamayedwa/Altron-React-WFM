import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Controller('dashboard')
@UseGuards(AuthenticatedGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats(@Request() req: any) {
    const userId = req.user.id;
    const role = req.user.role;
    return this.dashboardService.getDashboardStats(userId, role);
  }

  @Get('pending-approvals')
  async getPendingApprovals(@Request() req: any) {
    const role = req.user.role;
    return this.dashboardService.getPendingApprovals(role);
  }

  @Get('recent-activities')
  async getRecentActivities(@Request() req: any) {
    const userId = req.user.id;
    const role = req.user.role;
    return this.dashboardService.getRecentActivities(userId, role);
  }
}
