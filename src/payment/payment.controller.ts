import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // @UseGuards(JwtAuthGuard)
  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number }) {
    const paymentIntent = await this.paymentService.createPaymentIntent(body.amount);
    return { clientSecret: paymentIntent.client_secret };
  }

  @Post('webhook')
  async stripeWebhook(@Req() req, @Res() res) {
    const sig = req.headers['stripe-signature'];
    const event = this.paymentService.verifyWebhook(req.rawBody, sig);

    if (event?.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await this.paymentService.handleSuccessfulPayment(paymentIntent);
    }

    res.status(200).send({ received: true });
  }
}
