import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionPlan, SubscriptionPlanSchema } from './schemas/subscription-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SubscriptionPlan.name, schema: SubscriptionPlanSchema }]),
  ],
  exports: [MongooseModule], // Export MongooseModule to make SubscriptionPlan available in other modules
})
export class SubscriptionModule {}
