import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }
  
  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET }),
      user: {
        name: user.name,
        email: user.email,
        role:user.role,
        userId :user._id
      },
    };
  }
  async registerAdmin(name: string, email: string, password: string, phoneNumber?: string, profilePicture?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await this.userService.createAdminUser({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      profilePicture,
      role: 'admin',
    });
    return this.login(adminUser);
  }
  
  async register(
    name: string,
    email: string,
    password: string,
    teamAdmin?: string,
    teamId?: string,
    teamSize: number = 1,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
  
    if (teamAdmin && teamId) {
      const user = await this.userService.createTeamUser(name, email, hashedPassword, teamAdmin, teamId, teamSize);
      return this.login(user);
    } else {
      const user = await this.userService.create(name, email, hashedPassword);
      return this.login(user);
    }
  }
  
  async updateUserName(userId: string, name: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.name = name;
    return user.save();
  }

  // Update Email
  async updateUserEmail(userId: string, email: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) throw new BadRequestException('Email is already in use');
    user.email = email;
    return user.save();
  }

  // Update Password
  async updateUserPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) throw new BadRequestException('Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    return user.save();
  }
}

