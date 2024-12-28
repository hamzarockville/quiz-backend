import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isSubscribed: boolean;

  @Prop({ enum: ['individual', 'team'], default: null })
  planType: 'individual' | 'team';

  @Prop({ default: null })
  subscriptionPlanId?: string; // Add this field for referencing the subscription plan

  @Prop({ default: null })
  teamId?: string; // For team-based users to link to their team

  @Prop({ default: null })
  teamAdmin?: string; // Reference to the team admin for team users

  @Prop({ default: 1 })
  teamSize?: number; // Default to 1 for individual plans

  @Prop({ default: null })
  subscriptionPrice?: number; // Store the total subscription price

  @Prop({ default: null })
  subscriptionExpiresAt?: Date; // Expiration date of the subscription

  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role: string;

  @Prop({ default: null })
paymentMethodId?: string; // Stripe Payment Method ID

@Prop({ type: [Object], default: [] })
billingHistory?: Array<{ invoiceId: string; amount: number; date: Date }>; // Invoice History


  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
