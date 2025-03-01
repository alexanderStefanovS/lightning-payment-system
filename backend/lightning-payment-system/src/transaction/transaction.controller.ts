import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, Request, UsePipes, Query, Sse, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TransactionGenerationDto } from 'src/dtos/transaction-generation.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionsQueryTransformPipe } from './pipes/transactions-query-transform.pipe';
import { Observable, from, interval, map, switchMap } from 'rxjs';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/set-roles.decorator';
import { UserRole } from 'src/enums/user-role';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
  ) { }

  @Post('generate-transaction')
  @HttpCode(HttpStatus.OK)
  public async generateTransaction(@Body() transactionInfo: TransactionGenerationDto): Promise<{ transactionId: string }> {
    const transaction = await this.transactionService.generateInboundTransaction(transactionInfo.orgId, transactionInfo.amount,
      transactionInfo.description, transactionInfo.verificationToken);

    return { transactionId: transaction.id };
  }

  @Get(':id')
  public getTransaction(@Param() params: { id: string }) {
    return this.transactionService.findTransaction(params.id);
  }

  @Get(':id/state')
  public getTransactionState(@Param() params: { id: string }): Promise<{ state: string }> {
    return this.transactionService.findTransactionState(params.id);
  }

  @Get('per-org/:orgId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @UsePipes(TransactionsQueryTransformPipe)
  public getTransactionsForOrganization(
    @Param('orgId') orgId: string,
    @Query() query: { filters: any; sort: any; pagination: any },
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const { filters, sort, pagination } = query;

    return this.transactionService.getTransactionsForOrganization(orgId, userId, filters, sort, pagination);
  }

  @Get('export/:orgId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)  
  @UsePipes(TransactionsQueryTransformPipe)
  public exportTransactions(
    @Param('orgId') orgId: string,
    @Request() req: any,
    @Query() query: any,
  ) {
    const userId = req.user.id;
    const { filters, sort } = query;

    return this.transactionService.exportTransactionsToCSV(orgId, userId, filters, sort);
  }

  @Sse(':id/state/stream')
  public streamTransactionState(@Param('id') transactionId: string): Observable<{ data: string }> {
    return interval(5000).pipe(
      switchMap(() => from(this.transactionService.findTransactionState(transactionId))),
      map(transaction => ({
        data: JSON.stringify({ state: transaction.state })
      })),
    );
  }

}
