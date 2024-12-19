import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.userService.findById(request.user.userId);

    if (!user || !user.isSubscribed || new Date() > user.subscriptionExpiresAt) {
      throw new ForbiddenException('Subscription is required to access this feature');
    }

    return true;
  }
}
