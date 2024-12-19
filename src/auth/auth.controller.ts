import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: { name: string; email: string; password: string; teamAdmin?: string; teamId?: string; teamSize?: number },
  ) {
    const { name, email, password, teamAdmin, teamId, teamSize } = registerDto;
    return this.authService.register(name, email, password, teamAdmin, teamId, teamSize);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')

  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('create-admin')
async createAdmin(@Body() adminDto: { name: string; email: string; password: string }) {
  return this.authService.registerAdmin(adminDto.name, adminDto.email, adminDto.password);
}

}

// @UseGuards(LocalAuthGuard)
// @Post('login')
// async login(@Body() loginDto: {  email: string; password: string }) {
//   return this.authService.validateUser(loginDto.email, loginDto.password);
// }
// }

