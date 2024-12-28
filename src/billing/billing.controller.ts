import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdatePaymentDto , CancelSubscriptionDto } from './dto/update-payment.dto';
@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('details')
  async getBillingDetails(@Req() req: any) {
    return this.billingService.getBillingDetails(req.user.userId);
  }

  @Post('update-payment-method')
  async updatePaymentMethod(@Req() req: any,@Body() updatePaymentDto: UpdatePaymentDto) {
    return this.billingService.updatePaymentMethod(req.user.id, updatePaymentDto);
  }

  @Post('cancel-subscription')
  async cancelSubscription(@Req() req: any, @Body() cancelSubscriptionDto: CancelSubscriptionDto) {
    return this.billingService.cancelSubscription(req.user.userId, cancelSubscriptionDto);
  }
}
