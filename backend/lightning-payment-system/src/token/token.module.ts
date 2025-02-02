import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './token.schema';
import { UserOrganization, UserOrganizationSchema } from 'src/organization/schemas/user-organization.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Token.name, schema: TokenSchema },
            { name: UserOrganization.name, schema: UserOrganizationSchema },
        ]),
    ],
    providers: [TokenService],
    controllers: [TokenController],
    exports: [TokenService],
})
export class TokenModule {}
