import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from 'src/token/token.schema';
import { Transaction, TransactionSchema } from 'src/transaction/transaction.schema';
import { User, UserSchema } from 'src/user/user.schema';
import { Organization, OrganizationSchema } from './schemas/organization.schema';
import { UserOrganization, UserOrganizationSchema } from './schemas/user-organization.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Organization.name, schema: OrganizationSchema },
            { name: User.name, schema: UserSchema },
            { name: Token.name, schema: TokenSchema },
            { name: Transaction.name, schema: TransactionSchema },
            { name: UserOrganization.name, schema: UserOrganizationSchema },
        ]),
        AuthModule
    ],
    providers: [OrganizationService],
    controllers: [OrganizationController],
})
export class OrganizationModule { }
