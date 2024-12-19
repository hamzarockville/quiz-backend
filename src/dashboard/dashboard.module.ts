import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Quiz, QuizSchema, Result, ResultSchema } from 'src/quiz/schemas/quiz.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { SubscriptionPlan, SubscriptionPlanSchema } from 'src/subscription/schemas/subscription-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: Result.name, schema: ResultSchema },
      { name: User.name, schema: UserSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
