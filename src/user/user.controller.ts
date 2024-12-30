import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  NotFoundException,
  Put,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Post(':id/subscribe')
  async subscribeUser(
    @Param('id') userId: string,
    @Body() { subscriptionPlanId, teamSize }: { subscriptionPlanId: string; teamSize?: number },
  ) {
    const updatedUser = await this.userService.subscribeUser(userId, subscriptionPlanId, teamSize || 1);
    return { message: 'User subscribed successfully', user: updatedUser };
  }

  @Post(':id/unsubscribe')
  async unsubscribeUser(@Param('id') userId: string) {
    const updatedUser = await this.userService.unsubscribeUser(userId);
    return { message: 'User unsubscribed successfully', user: updatedUser };
  }

  @Post(':id/team-members')
  async addTeamMember(
    @Param('id') teamAdminId: string,
    @Body() { name, email }: { name: string; email: string },
  ) {
    const newMember = await this.userService.addTeamMember(teamAdminId, { name, email });
    return { message: 'Team member added successfully', member: newMember };
  }
  @Delete(':id/team-members/:memberId')
  async removeTeamMember(
    @Param('id') teamAdminId: string,
    @Param('memberId') memberId: string,
  ) {
    await this.userService.removeTeamMember(teamAdminId, memberId);
    return { message: 'Team member removed successfully' };
  }
  @Get(':id/team')
  async getTeam(@Param('id') teamAdminId: string) {
    const team = await this.userService.getTeam(teamAdminId);
    if (!team) throw new NotFoundException('Team not found');
    return { team };
  }
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updates: Partial<{ name: string; email: string; password: string }>,
  ) {
    const updatedUser = await this.userService.updateUser(id, updates);
    if (!updatedUser) throw new NotFoundException('User not found');
    return { message: 'User updated successfully', user: updatedUser };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Body() { role }: { role: string }) {
    // if (role !== 'admin') throw new ForbiddenException('Only admins can delete users');
    const deletedUser = await this.userService.deleteUser(id);
    if (!deletedUser) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  @Get('subscription-details/:id')
  async getSubscriptionDetails(@Param('id') userId: string) {
    const subscriptionDetails = await this.userService.getSubscriptionDetails(userId);
    if (!subscriptionDetails) throw new NotFoundException('Subscription details not found');
    return subscriptionDetails;
  }
  @Post(':id/update-plan')
  async updatePlan(
    @Param('id') userId: string,
    @Body() { newPlanId, teamSize  }: { newPlanId: string , teamSize?: number },
  ) {
    const updatedUser = await this.userService.updatePlan(userId, newPlanId, teamSize);
    if (!updatedUser) throw new NotFoundException('User not found or unable to update plan');
    return { message: 'Plan updated successfully', user: updatedUser };
  }
  @Post(':id/add-team-members')
  async addTeamMembers(
    @Param('id') userId: string,
    @Body() { additionalMembers }: { additionalMembers: number },
  ) {
    const updatedUser = await this.userService.addTeamMembersSize(userId, additionalMembers);
    if (!updatedUser) throw new NotFoundException('User not found or unable to add team members');
    return { message: 'Team size updated successfully', user: updatedUser };
  }
}
