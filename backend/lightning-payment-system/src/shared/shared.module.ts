import { Module } from '@nestjs/common';
import { LnbitsApiService } from './payment-services/lnbits-api.service';

@Module({
  providers: [LnbitsApiService],
  exports: [LnbitsApiService],
})
export class SharedModule {}
