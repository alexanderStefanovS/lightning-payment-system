import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/enums/user-role';
import { Roles } from 'src/auth/decorators/set-roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Get('org-balance/:orgId')
    async getOrganizationBalance(@Param('orgId') orgId: string) {
        return this.walletService.getOrganizationBalance(orgId);
    }

    @Post(':orgId/withdraw')
    async createWithdrawTransaction(@Param('orgId') orgId: string, @Body() body: { lightningInvoice: string }): Promise<{ transactionId: string }> {
        return this.walletService.createWithdrawTransaction(orgId, body.lightningInvoice);
    }
}
