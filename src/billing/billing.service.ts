import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { SubscriptionPlan } from 'src/subscription/schemas/subscription-plan.schema';
import {
  UpdatePaymentDto,
  CancelSubscriptionDto,
} from './dto/update-payment.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('SubscriptionPlan')
    private readonly subscriptionPlanModel: Model<SubscriptionPlan>,
  ) {}

  async getBillingDetails(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('subscriptionPlanId')
      .exec();
      const subscriptionPlan = await this.subscriptionPlanModel.findById(user.subscriptionPlanId);
      console.log('subscription plan ', subscriptionPlan)
    if (!user) throw new Error('User not found');
    // console.log('user biling found ', user);
    return {
      subscriptionDetail: {
        currentPlan: user.planType,
        price: user.subscriptionPrice,
        expiresAt: user.subscriptionExpiresAt,
      },
      currentPlan: user.planType,
      paymentMethod: user.paymentMethodId,
      invoices: user.billingHistory,
      isSubscribed: user.isSubscribed,
      subscriptionPlanId: user.subscriptionPlanId,
      pricePerMember : user.planType === 'team' ? subscriptionPlan.pricePerMember : null
    };
  }

  async updatePaymentMethod(
    userId: string,
    updatePaymentDto: UpdatePaymentDto,
  ) {
    // Integrate with Stripe to update payment method
    await this.userModel.findByIdAndUpdate(userId, {
      paymentMethodId: updatePaymentDto.paymentMethodId,
    });
    return { success: true, message: 'Payment method updated' };
  }

  async cancelSubscription(
    userId: string,
    cancelSubscriptionDto: CancelSubscriptionDto,
  ) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new Error('User not found');
 console.log('user ', user)
    // Mark subscription as canceled
    user.subscriptionExpiresAt = new Date(); // Or current subscription end date
    user.isSubscribed = false;
    user.planType = null;
    user.subscriptionPlanId = null;
    user.teamId = null;
    user.teamAdmin = null;
    user.teamSize = 1;
    user.subscriptionPrice = null;
    await user.save();
    return { success: true, message: 'Subscription canceled' };
  }
}
