import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { TokenModule } from './token/token.module';
import { TransactionModule } from './transaction/transaction.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/lightning-payment-system-db'),
    ScheduleModule.forRoot(),
    AuthModule,
    OrganizationModule,
    TokenModule,
    TransactionModule,
    WalletModule
  ]
})

export class AppModule {}
