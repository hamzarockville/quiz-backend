import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe('sk_test_PNv6tkY9meaWXCsXj6YSFFfm', {
      apiVersion: '2024-11-20.acacia', 
    });
  }

  async createPaymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
    console.log('Payment amount:', amount); // Debugging to ensure correct value
    return this.stripe.paymentIntents.create({
      amount, // Ensure this is an integer
      currency: 'usd',
    });
  }

  verifyWebhook(payload: any, sig: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        sig,
        'your_stripe_webhook_secret',
      );
    } catch (error) {
      console.error('Webhook verification failed:', error.message);
      return null;
    }
  }

  async handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
    const userId = paymentIntent.metadata.userId;
    const planId = paymentIntent.metadata.planId;

    // Update user subscription logic (replace with your database logic)
    console.log(`Payment successful for user ${userId}, plan ${planId}`);
    // Example: UserService.updateUserSubscription(userId, planId);
  }
}
