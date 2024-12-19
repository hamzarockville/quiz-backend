import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from 'src/quiz/schemas/quiz.schema';
import { Result } from 'src/quiz/schemas/quiz.schema';
import { User } from 'src/user/schemas/user.schema';
import { SubscriptionPlan } from 'src/subscription/schemas/subscription-plan.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
    @InjectModel(Result.name) private readonly resultModel: Model<Result>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(SubscriptionPlan.name)
    private readonly subscriptionPlanModel: Model<SubscriptionPlan>,
  ) {}

  async getAdminStats() {
    const totalQuizzes = await this.quizModel.countDocuments();
    const totalUsers = await this.userModel.countDocuments();
    const totalResults = await this.resultModel.countDocuments();

    return { totalQuizzes, totalUsers, totalResults };
  }

  async getAdminRecent() {
    const recentQuizzes = await this.quizModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    const recentResults = await this.resultModel
      .find()
      .populate('userId', 'name')
      .populate('quizId', 'title')
      .sort({ attemptedAt: -1 })
      .limit(5)
      .exec();

    return { recentQuizzes, recentResults };
  }

  async getAdminSubscriptions() {
    const activeSubscriptions = await this.userModel.countDocuments({
      isSubscribed: true,
    });
    const expiredSubscriptions = await this.userModel.countDocuments({
      isSubscribed: false,
    });

    return { activeSubscriptions, expiredSubscriptions };
  }

  async getUserStats(userId: string) {
    const totalQuizzesTaken = await this.resultModel.countDocuments({ userId });
    const averageScore = await this.resultModel
      .aggregate([
        { $match: { userId } },
        { $group: { _id: null, avgScore: { $avg: '$score' } } },
      ])
      .exec();

    const subscriptionStatus = await this.userModel
      .findById(userId)
      .select('isSubscribed subscriptionExpiresAt');

    return {
      totalQuizzesTaken,
      averageScore: averageScore[0]?.avgScore || 0,
      subscriptionStatus,
    };
  }

  async getUserRecent(userId: string) {
    const recentResults = await this.resultModel
      .find({ userId })
      .populate('quizId', 'title')
      .sort({ attemptedAt: -1 })
      .limit(5)
      .exec();
      const recentQuizzes = await this.quizModel
      .find({ createdBy: userId })
      .select('title createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
      return {
        recentResults,
        recentQuizzes,
      };
  }
}
