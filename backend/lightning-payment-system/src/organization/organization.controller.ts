import { Controller, Post, Request, Body, UseGuards, Get, Param, Delete, Patch, UseInterceptors } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from 'src/dtos/create-organization.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrganizationDto } from 'src/dtos/organization.dto';
import { MessageDto } from 'src/dtos/message.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/set-roles.decorator';
import { UserRole } from 'src/enums/user-role';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    @Post()
    public createOrganization(@Request() req: any, @Body() createOrganizationDto: CreateOrganizationDto) {
        return this.organizationService.createOrganization(createOrganizationDto.name, createOrganizationDto.description, req.user.id);
    }

    @Get('per-user')
    public getOrganizations(@Request() req: any): Promise<OrganizationDto[]> {
        return this.organizationService.getOrganizations(req.user.id);
    }

    @Get(':orgId')
    public getOrganization(@Request() req: any, @Param('orgId') orgId: string): Promise<OrganizationDto> {
        return this.organizationService.getOrganization(orgId, req.user.id);
    }

    @Post(':orgId/invite')
    public async inviteUser(@Param('orgId') orgId: string, @Body() body: any, @Request() req: any): Promise<MessageDto> {
        const requestorId = req.user.id;
        const { email, role } = body;

        await this.organizationService.inviteUserToOrganization(orgId, email, role, requestorId);

        return { message: 'User invited to organization successfully' };
    }

    @Delete(':orgId/users/:userId')
    public async removeUser(@Param('orgId') orgId: string, @Param('userId') userId: string, @Request() req: any): Promise<MessageDto> {
        const requestorId = req.user.id;
        await this.organizationService.removeUserFromOrganization(orgId, userId, requestorId);
        return { message: 'User removed from organization successfully' };
    }

    @Get(':orgId/users')
    public async getUsers(@Param('orgId') orgId: string, @Request() req: any) {
        const requestorId = req.user.id;
        return this.organizationService.getUsersInOrganization(orgId, requestorId);
    }

    @Get('invitations/pending')
    public async getPendingInvitations(@Request() req: any) {
        const userId = req.user.id;
        return this.organizationService.getPendingInvitations(userId);
    }

    @Patch('invitations/:invitationId')
    public async handleInvitation(
        @Param('invitationId') invitationId: string,
        @Body('action') action: 'accept' | 'deny',
        @Request() req: any,
    ): Promise<MessageDto> {
        const userId = req.user.id;
        await this.organizationService.handleInvitation(userId, invitationId, action);
        return { message: `Invitation ${action === 'accept' ? 'accepted' : 'denied'} successfully` };
    }
}
