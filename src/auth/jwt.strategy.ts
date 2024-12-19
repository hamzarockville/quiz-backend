import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) { // Inject UserService
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // Ensure this is properly set in your environment
    });
  }

  async validate(payload: any) {
    // Fetch user from the database using payload information
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Example of restricting access based on role
    if (user.role !== 'admin' && payload.restrictedCondition) {
      throw new UnauthorizedException('Only admins can access this route');
    }

    // Include user details for further processing in request
    return { userId: payload.sub, email: payload.email, role: user.role, teamId: user.teamId };
  }
}
