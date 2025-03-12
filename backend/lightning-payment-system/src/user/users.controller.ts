import { Body, Request, Controller, Get, Post, UseGuards, Put, Query, ForbiddenException, Patch, Param } from "@nestjs/common";
import { Roles } from "src/auth/decorators/set-roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ChangePasswordDto } from "src/dtos/change-password.dto";
import { UserDto } from "src/dtos/user.dto";
import { UserRole } from "src/enums/user-role";
import { UserService } from "src/user/users.service";

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('registration')
  registerUser(@Body() registrationData: UserDto) {
    return this.userService.registerUser(registrationData);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req: any, @Body() body: ChangePasswordDto) {
    const userId = req.user.id;
    const { newPassword } = body;

    return this.userService.changePassword(userId, newPassword);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@Request() req: any) {
    const { _id: id, email, firstName, lastName } = await this.userService.findById(req.user.id);

    return { id, email, firstName, lastName };
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  registerAdmin(@Body() registrationData: UserDto) {
    return this.userService.registerUser(registrationData, UserRole.ADMIN);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsers(
    @Query('email') email?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    return this.userService.getUsers(email, pageNumber, limitNumber);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deactivateUser(@Param('id') userId: string, @Request() req: any) {
    if (req.user.id === userId) {
      throw new ForbiddenException("You cannot deactivate your own account.");
    }

    return this.userService.deactivateUser(userId);
  }
}
