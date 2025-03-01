import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/set-roles.decorator';
import { UserRole } from 'src/enums/user-role';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('activity-logs')
  async getActivityLogs(
    @Query('email') email?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortField') sortField = 'createdAt',
    @Query('sortOrder') sortOrder = 'desc',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.adminService.getActivityLogs(
      { email, startDate, endDate },
      { field: sortField, order: sortOrder },
      { page: parseInt(page, 10), limit: parseInt(limit, 10) },
    );
  }
}
