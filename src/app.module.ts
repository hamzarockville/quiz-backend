import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { QuizModule } from './quiz/quiz.module';
import { UserModule } from './user/user.module';
import { PaymentModule } from './payment/payment.module';
import { AdminModule } from './admin/admin.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { EmailModule } from './email/email.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BillingModule } from './billing/billing.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TimeoutInterceptor } from './timeoutInterceptor';
import { VerticalModule } from './vertical/vertical.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    QuizModule,
    UserModule,
    PaymentModule,
    AdminModule,
    SubscriptionModule,
    EmailModule,
    DashboardModule,
    BillingModule,
    VerticalModule,
  ],
  providers: [ {
    provide: APP_INTERCEPTOR,
    useClass: TimeoutInterceptor,
  },],  
})
export class AppModule {}

