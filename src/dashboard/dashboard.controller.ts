import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard, new RoleGuard(['admin']))
  @Get('admin/stats')
  async getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @UseGuards(JwtAuthGuard, new RoleGuard(['admin']))
  @Get('admin/recent')
  async getAdminRecent() {
    return this.dashboardService.getAdminRecent();
  }

  @UseGuards(JwtAuthGuard, new RoleGuard(['admin']))
  @Get('admin/subscriptions')
  async getAdminSubscriptions() {
    return this.dashboardService.getAdminSubscriptions();
  }

  @UseGuards(JwtAuthGuard, new RoleGuard(['user']))
  @Get('user/stats')
  async getUserStats(@Req() req) {
    const userId = req.user.userId; // Extracted from the JWT payload
    return this.dashboardService.getUserStats(userId);
  }

  @UseGuards(JwtAuthGuard, new RoleGuard(['user']))
  @Get('user/recent')
  async getUserRecent(@Req() req) {
    const userId = req.user.userId; // Extracted from the JWT payload
    return this.dashboardService.getUserRecent(userId);
  }
}
