import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SubscriptionPlan extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  type: 'individual' | 'team';

  @Prop({ required: true }) // Base price for the plan
  price: number;

  @Prop({ default: 0 }) // Only applicable for team plans
  pricePerMember?: number;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);

