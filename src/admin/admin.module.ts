import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SubscriptionPlan, SubscriptionPlanSchema } from '../subscription/schemas/subscription-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SubscriptionPlan.name, schema: SubscriptionPlanSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
