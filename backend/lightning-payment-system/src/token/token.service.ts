import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from './token.schema';
import { randomBytes } from 'crypto';
import { TokenDto } from 'src/dtos/token.dto';
import { UserOrganization, UserOrganizationDocument } from 'src/organization/schemas/user-organization.schema';
import { OrganizationRole } from 'src/enums/organization-role';

@Injectable()
export class TokenService {
    constructor(
        @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
        @InjectModel(UserOrganization.name) private readonly userOrganizationModel: Model<UserOrganizationDocument>
    ) {}

    public async createToken(tokenDto: TokenDto, userId: string): Promise<TokenDocument> {
        const userOrganization = await this.userOrganizationModel.findOne({ orgId: tokenDto.orgId, userId }).lean();
        if (!userOrganization || (userOrganization.role !== OrganizationRole.ADMIN
            && userOrganization.role !== OrganizationRole.OWNER)) {
            throw new ForbiddenException('User is not allowed to create tokens for this organization');
        }

        const createdToken = new this.tokenModel({ ...tokenDto, value: this.generateToken() });
        return createdToken.save();
    }

    public async findTokensByOrgId(orgId: string): Promise<TokenDocument[]> {
        return this.tokenModel.find({ orgId }).exec();
    }

    public async verifyToken(tokenValue: string, orgId: string): Promise<string | null> {
        const token = await this.tokenModel.findOne({ value: tokenValue }).exec();

        if (token && token.isActive && token.expiryDate > new Date()
            && token.orgId.toString() === orgId) {
            return token.id;
        }

        return null;
    }

    public async deleteTokenById(tokenId: string, orgId: string, userId: string): Promise<any> {
        const userOrganization = await this.userOrganizationModel.findOne({ orgId, userId }).lean();

        if (!userOrganization || (userOrganization.role !== OrganizationRole.ADMIN
            && userOrganization.role !== OrganizationRole.OWNER)) {
            throw new ForbiddenException('User is not allowed to delete tokens for this organization');
        }

        return this.tokenModel.updateOne(
            { _id: tokenId },
            { isActive: false }
        );
    }

    private generateToken(): string {
        return randomBytes(32).toString('hex');
    }
}
