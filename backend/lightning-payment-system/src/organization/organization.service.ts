import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Organization, OrganizationDocument } from './schemas/organization.schema';
import { UserOrganization, UserOrganizationDocument } from './schemas/user-organization.schema';
import { OrganizationRole } from 'src/enums/organization-role';
import { OrganizationDto } from 'src/dtos/organization.dto';
import { User, UserDocument } from 'src/user/user.schema';
import { OrganizationStatus } from 'src/enums/organization-status';
import { UserInOrganizationDto } from 'src/dtos/user-in-organization.dto';
import { OrganizationInvitationDto } from 'src/dtos/organization-invitation.dto';

@Injectable()
export class OrganizationService {
    constructor(
        @InjectModel(Organization.name) private readonly organizationModel: Model<OrganizationDocument>,
        @InjectModel(UserOrganization.name) private userOrganizationModel: Model<UserOrganizationDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    public async createOrganization(name: string, description: string, userId: string): Promise<OrganizationDocument> {
        const organization = new this.organizationModel({ name, description });
        const savedOrganization = await organization.save();

        const userOrganization = new this.userOrganizationModel({
            userId,
            orgId: savedOrganization._id,
            role: OrganizationRole.OWNER,
        });
        await userOrganization.save();

        // TODO: Investigate how the mongoDB transaction works and if it's suitable for this use case.

        return savedOrganization;
    }

    public async getOrganizations(userId: string): Promise<OrganizationDto[]> {
        const userOrganizations = (await this.userOrganizationModel.find({ userId }).lean())
            .filter((uo) => uo.status === OrganizationStatus.ACTIVE);
        
        const organizationIds = userOrganizations.map((uo) => uo.orgId);

        const organizations = await this.organizationModel
            .find({ _id: { $in: organizationIds } })
            .lean();

        const result = organizations.map((org) => {
            const userOrg = userOrganizations.find((uo) => uo.orgId.toString() === org._id.toString());
            return {
                id: org._id.toString(),
                name: org.name,
                description: org.description,
                role: userOrg?.role || 'Unknown',
            };
        });

        return result;
    }

    public async getOrganization(orgId: string, userId: string): Promise<OrganizationDto> {
        const organization = await this.organizationModel.findById(orgId).lean();

        if (!organization) {
            return null;
        }

        const userOrganization = await this.userOrganizationModel.findOne({ orgId, userId }).lean();
        if (!userOrganization) {
            throw new ForbiddenException('User is not part of this organization');
        }

        return {
            id: organization._id.toString(),
            name: organization.name,
            description: organization.description,
            role: userOrganization?.role || 'Unknown',
        };
    }

    public async getUsersInOrganization(orgId: string, requestorId: string): Promise<UserInOrganizationDto[]> {
        const requestorMembership = await this.userOrganizationModel.findOne({ orgId, userId: requestorId }).lean();

        if (!requestorMembership || requestorMembership.status !== OrganizationStatus.ACTIVE) {
            throw new ForbiddenException('You do not have access to view users in this organization');
        }

        const userOrgMappings = await this.userOrganizationModel.find({ orgId }).lean();
        const userIds = userOrgMappings.map((mapping) => mapping.userId);

        const users = await this.userModel.find({ _id: { $in: userIds } }).lean();

        return userOrgMappings.map((mapping) => {
            const user = users.find((u) => u._id.toString() === mapping.userId.toString());
            if (user) {
                return {
                    id: user._id.toString(),
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: mapping.role,
                    isSelf: user._id.toString() === requestorId,
                    status: mapping.status,
                };
            }
        }).filter(Boolean);
    }

    public async removeUserFromOrganization(orgId: string, userId: string, requestorId: string): Promise<void> {
        const requestorMembership = await this.userOrganizationModel.findOne({ orgId, userId: requestorId }).lean();
        if (!requestorMembership || requestorMembership.role !== OrganizationRole.OWNER) {
            throw new ForbiddenException('You do not have permission to remove users from this organization');
        }

        const userMembership = await this.userOrganizationModel.findOne({ orgId, userId }).lean();
        if (!userMembership) {
            throw new BadRequestException('User is not part of this organization');
        }

        if (userMembership.userId === requestorId) {
            throw new BadRequestException('You cannot remove yourself from the organization');
        }

        await this.userOrganizationModel.deleteOne({ _id: userMembership._id });
    }

    public async inviteUserToOrganization(orgId: string, email: string, role: OrganizationRole, requestorId: string): Promise<void> {
        const requestorMembership = await this.userOrganizationModel.findOne({ orgId, userId: requestorId }).lean();
        if (!requestorMembership || requestorMembership.role !== OrganizationRole.OWNER) {
            throw new ForbiddenException('You do not have permission to invite users to this organization');
        }

        const user = await this.userModel.findOne({ email }).lean();
        if (!user) {
            throw new BadRequestException('User with this email does not exist');
        }

        const existingMembership = await this.userOrganizationModel.findOne({ orgId, userId: user._id }).lean();
        if (existingMembership) {
            throw new BadRequestException('User is already part of this organization');
        }

        await this.userOrganizationModel.create({
            orgId,
            userId: user._id,
            role,
            status: OrganizationStatus.PENDING,
        });
    }

    public async handleInvitation(userId: string, invitationId: string, action: 'accept' | 'deny'): Promise<void> {
        const invitation = await this.userOrganizationModel.findOne({ _id: invitationId, userId });

        if (!invitation) {
            throw new BadRequestException('Invitation not found');
        }

        if (invitation.status !== OrganizationStatus.PENDING) {
            throw new ForbiddenException('Invitation is not pending');
        }

        if (action === 'accept') {
            invitation.status = OrganizationStatus.ACTIVE;
            await invitation.save();
        } else if (action === 'deny') {
            await this.userOrganizationModel.deleteOne({ _id: invitationId });
        }
    }

    public async getPendingInvitations(userId: string): Promise<OrganizationInvitationDto[]> {
        const pendingInvitations = await this.userOrganizationModel
            .find({ userId, status: OrganizationStatus.PENDING })
            .lean();

        const organizationIds = pendingInvitations.map((invitation) => invitation.orgId);
        const organizations = await this.organizationModel.find({ _id: { $in: organizationIds } }).lean();

        return pendingInvitations.map((invitation) => {
            const organization = organizations.find((org) => org._id.toString() === invitation.orgId.toString());
            return {
                id: invitation._id.toString(),
                organizationId: organization._id.toString(),
                name: organization.name,
                description: organization.description,
                role: invitation.role,
            };
        });
    }
}
