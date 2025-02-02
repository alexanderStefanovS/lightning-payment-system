import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Organization, OrganizationSchema } from '../organization/schemas/organization.schema';
import { SharedModule } from 'src/shared/shared.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema }]),
    SharedModule,
    TransactionModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
