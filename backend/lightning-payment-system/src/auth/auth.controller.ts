import { Controller, Post, Body, Get, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenDto } from 'src/dtos/access-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ActivityLogInterceptor } from 'src/core/activity-log/activity-log.interceptor';

@UseInterceptors(ActivityLogInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string): Promise<AccessTokenDto> {
    return this.authService.login(email, password);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async check(@Request() req) {

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return { user: req.user };
  }
}
