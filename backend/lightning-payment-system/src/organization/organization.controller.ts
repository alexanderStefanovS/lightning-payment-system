import { Controller, Post, Request, Body, UseGuards, Get, Param, Delete, Patch } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from 'src/dtos/create-organization.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrganizationDto } from 'src/dtos/organization.dto';
import { MessageDto } from 'src/dtos/message.dto';

@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    public createOrganization(@Request() req: any, @Body() createOrganizationDto: CreateOrganizationDto) {
        return this.organizationService.createOrganization(createOrganizationDto.name, createOrganizationDto.description, req.user.id);
    }

    @Get('per-user')
    @UseGuards(JwtAuthGuard)
    public getOrganizations(@Request() req: any): Promise<OrganizationDto[]> {
        return this.organizationService.getOrganizations(req.user.id);
    }

    @Get(':orgId')
    @UseGuards(JwtAuthGuard)
    public getOrganization(@Request() req: any, @Param('orgId') orgId: string): Promise<OrganizationDto> {
        return this.organizationService.getOrganization(orgId, req.user.id);
    }

    @Post(':orgId/invite')
    @UseGuards(JwtAuthGuard)
    public async inviteUser(@Param('orgId') orgId: string, @Body() body: any, @Request() req: any): Promise<MessageDto> {
        const requestorId = req.user.id;
        const { email, role } = body;

        await this.organizationService.inviteUserToOrganization(orgId, email, role, requestorId);

        return { message: 'User invited to organization successfully' };
    }

    @Delete(':orgId/users/:userId')
    @UseGuards(JwtAuthGuard)
    public async removeUser(@Param('orgId') orgId: string, @Param('userId') userId: string, @Request() req: any): Promise<MessageDto> {
        const requestorId = req.user.id;
        await this.organizationService.removeUserFromOrganization(orgId, userId, requestorId);
        return { message: 'User removed from organization successfully' };
    }

    @Get(':orgId/users')
    @UseGuards(JwtAuthGuard)
    public async getUsers(@Param('orgId') orgId: string, @Request() req: any) {
        const requestorId = req.user.id;
        return this.organizationService.getUsersInOrganization(orgId, requestorId);
    }

    @Get('invitations/pending')
    @UseGuards(JwtAuthGuard)
    public async getPendingInvitations(@Request() req: any) {
        const userId = req.user.id;
        return this.organizationService.getPendingInvitations(userId);
    }

    @Patch('invitations/:invitationId')
    @UseGuards(JwtAuthGuard)
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
