import { Body, Request, Controller, Get, Post, UseGuards, Put, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ActivityLogInterceptor } from "src/core/activity-log/activity-log.interceptor";
import { ChangePasswordDto } from "src/dtos/change-password.dto";
import { UserDto } from "src/dtos/user.dto";
import { UserService } from "src/user/users.service";

@UseInterceptors(ActivityLogInterceptor)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('registration')
    registerUser(@Body() registrationData: UserDto) {
        return this.userService.registerUser(registrationData);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUser(@Request() req: any) {
        const { _id: id, email, firstName, lastName } = await this.userService.findById(req.user.id);

        return { id, email, firstName, lastName };
    }

    @Put('change-password')
    @UseGuards(JwtAuthGuard)
    async changePassword(@Request() req: any, @Body() body: ChangePasswordDto) {
      const userId = req.user.id;
      const { newPassword } = body;
  
      return this.userService.changePassword(userId, newPassword);
    }
  
} 
 