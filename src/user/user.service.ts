import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateResult } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { SubscriptionPlan } from 'src/subscription/schemas/subscription-plan.schema';
import { EmailService } from 'src/email/email.service';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(SubscriptionPlan.name) private readonly subscriptionPlanModel: Model<SubscriptionPlan>,
    private emailService: EmailService, // Inject EmailService
  ) {}

  async findById(id: string): Promise<User | undefined> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // async subscribeUser(userId: string, subscriptionPlanId: string, teamSize: number = 1) {
  //   console.log('sub id ', subscriptionPlanId)
  //   const user = await this.userModel.findById(userId);
  //   if (!user) throw new NotFoundException('User not found');

  //   const plan = await this.subscriptionPlanModel.findById(subscriptionPlanId);
  //   if (!plan) throw new NotFoundException('Subscription plan not found');

  //   if (plan.type === 'team' && teamSize < 1) {
  //     throw new Error('Team size must be at least 1');
  //   }

  //   const totalPrice = plan.type === 'team' 
  //     ? plan.price + plan.pricePerMember * (teamSize - 1)
  //     : plan.price;

  //   user.isSubscribed = true;
  //   user.planType = plan.type;
  //   user.teamSize = plan.type === 'team' ? teamSize : undefined;
  //   user.subscriptionPrice = totalPrice;
  //   user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  //   return user.save();
  // }
  // async subscribeUser(userId: string, subscriptionPlanId: string, teamSize: number = 1) {
  //   const user = await this.userModel.findById(userId);
  //   if (!user) throw new NotFoundException('User not found');
  
  //   const plan = await this.subscriptionPlanModel.findById(subscriptionPlanId);
  //   if (!plan) throw new NotFoundException('Subscription plan not found');
  
  //   if (plan.type === 'team' && teamSize < 1) {
  //     throw new Error('Team size must be at least 1');
  //   }
  
  //   const totalPrice =
  //     plan.type === 'team'
  //       ? plan.price + plan.pricePerMember * (teamSize - 1)
  //       : plan.price;
  
  //   const teamId = plan.type === 'team' ? userId : null; // Assign the current user's ID as the teamId for the team admin
  
  //   user.isSubscribed = true;
  //   user.planType = plan.type;
  //   user.teamSize = plan.type === 'team' ? teamSize : undefined;
  //   user.subscriptionPrice = totalPrice;
  //   user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  //   user.subscriptionPlanId = subscriptionPlanId;
  
  //   // If it's a team plan, set the teamAdmin and teamId
  //   if (plan.type === 'team') {
  //     user.teamAdmin = userId; // The subscribing user becomes the team admin
  //     user.teamId = teamId; // Use the generated teamId
  //   }
  
  //   return user.save();
  // }
  async unsubscribeUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.isSubscribed = false;
    user.planType = null;
    user.teamSize = null;
    user.subscriptionPrice = null;
    user.subscriptionExpiresAt = null;

    return user.save();
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
  async createAdminUser(userDetails: {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    profilePicture?: string;
    role: string;
  }): Promise<User> {
    const adminUser = new this.userModel(userDetails);
    return adminUser.save();
  }
  async createTeamUser(
    name: string,
    email: string,
    password: string,
    teamAdmin: string,
    teamId: string,
    teamSize: number,
  ): Promise<User> {
    const teamUser = new this.userModel({
      name,
      email,
      password,
      role: 'user',
      teamAdmin,
      teamId,
      teamSize,
    });
    return teamUser.save();
  }
  async create(name: string, email: string, password: string): Promise<User> {
    const user = new this.userModel({ name, email, password });
    return user.save();
  }
  async addTeamMembers(userId: string, additionalMembers: number) {
    const user = await this.userModel.findById(userId);
    if (!user || user.planType !== 'team') {
      throw new Error('User must be subscribed to a team plan to add members');
    }

    const plan = await this.subscriptionPlanModel.findById(user.subscriptionPlanId);
    if (!plan) throw new Error('Subscription plan not found');

    const newTeamSize = (user.teamSize || 1) + additionalMembers;
    const additionalCost = plan.pricePerMember * additionalMembers;

    user.teamSize = newTeamSize;
    user.subscriptionPrice += additionalCost;

    return user.save();
  }

  async getSubscriptionDetails(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return {
      isSubscribed: user.isSubscribed,
      isTeamAdmin: userId === user.teamAdmin ? true : false,
      planType: user.planType,
      teamSize: user.teamSize,
      subscriptionPrice: user.subscriptionPrice,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).exec();
  }

  async deleteUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
  async subscribeUser(userId: string, subscriptionPlanId: string, teamSize: number = 1) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.subscriptionPlanModel.findById(subscriptionPlanId);
    if (!plan) throw new NotFoundException('Subscription plan not found');

    const teamId = plan.type === 'team' ? userId : null;

    const totalPrice = plan.type === 'team'
      ? plan.price + plan.pricePerMember * (teamSize - 1)
      : plan.price;

    user.isSubscribed = true;
    user.subscriptionPlanId = subscriptionPlanId;
    user.planType = plan.type;
    user.teamAdmin = plan.type === 'team' ? userId : null;
    user.teamId = teamId;
    user.teamSize = plan.type === 'team' ? teamSize : null;
    user.subscriptionPrice = totalPrice;
    user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    user.paymentMethodId = Math.random().toString(36).substring(2, 8);
    user.billingHistory.push({
      invoiceId: Math.random().toString(36).substring(2, 8),
      amount: totalPrice,
      date: new Date(),
    });
    return user.save();
  }

  async addTeamMember(
    teamAdminId: string,
    { name, email }: { name: string; email: string },
  ) {
    const teamAdmin = await this.userModel.findById(teamAdminId);
    if (!teamAdmin || teamAdmin.planType !== 'team') {
      throw new ForbiddenException('User must be a team admin to add members');
    }

    if ((teamAdmin.teamSize || 0) <= 0) {
      throw new ForbiddenException('Team size limit reached');
    }

    const password = Math.random().toString(36).slice(-8); // Generate a random password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newMember = new this.userModel({
      name,
      email,
      password: hashedPassword,
      teamAdmin: teamAdminId,
      teamId: teamAdmin.teamId,
      planType: 'team',
      isSubscribed: true,
      role: 'user',
    });

    teamAdmin.teamSize -= 1; // Decrease available slots
    await teamAdmin.save();
    const savedMember = await newMember.save();

    // Send email with login details
    const loginLink = 'https://your-app.com/login'; // Replace with your actual login URL
    const emailText = `
      Hi ${name},

      You have been added to the team by ${teamAdmin.name}.
      Here are your login details:
      
      Email: ${email}
      Password: ${password}
      
      Please login at ${loginLink} and change your password.

      Best regards,
      Your App Team
    `;

    await this.emailService.sendEmail(
      email,
      'Welcome to the Team!',
      emailText,
    );

    return savedMember;
  }
  

  async removeTeamMember(teamAdminId: string, memberId: string) {
    const teamAdmin = await this.userModel.findById(teamAdminId);
    if (!teamAdmin || teamAdmin.planType !== 'team') {
      throw new ForbiddenException('User must be a team admin to remove members');
    }
  
    const member = await this.userModel.findById(memberId);
    if (!member || member.teamAdmin !== teamAdminId) {
      throw new ForbiddenException('Member not part of the team');
    }
  
    // Delete the team member
    await this.userModel.deleteOne({ _id: memberId });
  
    // Increment the team size after removal
    teamAdmin.teamSize += 1;
    await teamAdmin.save();
  }

  async getTeam(teamAdminId: string) {
    const teamMembers = await this.userModel.find({ teamAdmin: teamAdminId }).exec();
    return teamMembers;
  }
}
