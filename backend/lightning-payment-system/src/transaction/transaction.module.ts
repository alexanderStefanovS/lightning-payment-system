import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TokenModule } from 'src/token/token.module';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './transaction.schema';
import { UserOrganization, UserOrganizationSchema } from 'src/organization/schemas/user-organization.schema';
import { SharedModule } from 'src/shared/shared.module';
import { Organization, OrganizationSchema } from 'src/organization/schemas/organization.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: UserOrganization.name, schema: UserOrganizationSchema },
      { name: Organization.name, schema: OrganizationSchema }
    ]),
    TokenModule,
    AuthModule,
    SharedModule
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService]
})
export class TransactionModule {}
