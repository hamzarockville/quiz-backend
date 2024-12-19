import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SubscriptionPlan } from '../subscription/schemas/subscription-plan.schema';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('subscription-plans')
  async createSubscriptionPlan(
    @Body()
    plan: {
      name: string;
      description: string;
      type: 'individual' | 'team';
      price: number;
      pricePerMember?: number;
    },
  ) {
    return this.adminService.createSubscriptionPlan(plan);
  }

  @Get('subscription-plans')
  async getSubscriptionPlans() {
    return this.adminService.getSubscriptionPlans();
  }

  @Put('subscription-plans/:id')
  async updateSubscriptionPlan(
    @Param('id') id: string,
    @Body()
    updates: Partial<{
      name: string;
      description: string;
      price: number;
      pricePerMember?: number;
    }>,
  ) {
    return this.adminService.updateSubscriptionPlan(id, updates);
  }

  @Delete('subscription-plans/:id')
  async deleteSubscriptionPlan(@Param('id') id: string) {
    return this.adminService.deleteSubscriptionPlan(id);
  }
}
