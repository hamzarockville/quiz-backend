import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { SubscriptionPlan, SubscriptionPlanSchema } from 'src/subscription/schemas/subscription-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'SubscriptionPlan', schema: SubscriptionPlanSchema },
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
