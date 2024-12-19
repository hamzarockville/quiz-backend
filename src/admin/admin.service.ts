import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionPlan } from '../subscription/schemas/subscription-plan.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(SubscriptionPlan.name) private readonly subscriptionPlanModel: Model<SubscriptionPlan>,
  ) {}

  async createSubscriptionPlan(plan: Partial<SubscriptionPlan>) {
    const newPlan = new this.subscriptionPlanModel(plan);
    return newPlan.save();
  }

  async getSubscriptionPlans() {
    return this.subscriptionPlanModel.find().exec();
  }

  async updateSubscriptionPlan(id: string, updates: Partial<SubscriptionPlan>) {
    return this.subscriptionPlanModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async deleteSubscriptionPlan(id: string) {
    return this.subscriptionPlanModel.findByIdAndDelete(id).exec();
  }
}
