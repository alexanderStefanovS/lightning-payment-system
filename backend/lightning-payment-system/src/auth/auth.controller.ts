import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenDto } from 'src/dtos/access-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
    return { user: req.user };
  }
}
