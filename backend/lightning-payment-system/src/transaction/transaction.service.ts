import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { GeneratedInvoice } from 'src/interfaces/generated-invoice';
import { TransactionState } from 'src/enums/transaction-state';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './transaction.schema';
import { TokenService } from 'src/token/token.service';
import { LnbitsApiService } from '../shared/payment-services/lnbits-api.service';
import { UserOrganization, UserOrganizationDocument } from 'src/organization/schemas/user-organization.schema';

import * as csv from 'csv-stringify/sync';
import { Interval } from '@nestjs/schedule';
import { Organization, OrganizationDocument } from 'src/organization/schemas/organization.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(UserOrganization.name) private readonly userOrganizationModel: Model<UserOrganizationDocument>,
    @InjectModel(Organization.name) private readonly organizationModel: Model<OrganizationDocument>,
    private lnbitsApiService: LnbitsApiService,
    private tokenService: TokenService,
  ) { }

  @Interval(5000)
  async checkPendingTransactions() {
    const pendingTransactions = await this.transactionModel.find({ state: TransactionState.PENDING });

    for (const transaction of pendingTransactions) {
      const state = await this.lnbitsApiService.getTransactionStatus(transaction.paymentHash);

      console.log(`Transaction: ${transaction.id} | State: ${state}`);

      if (state && state !== TransactionState.PENDING) {
        await this.transactionModel.updateOne(
          { _id: transaction._id },
          { state }
        );

        if (state === TransactionState.SUCCESS) {
          await this.organizationModel.updateOne(
            { _id: transaction.orgId },
            { balance: transaction.amount }
          );
        }
      }
    }
  }

  public async generateInboundTransaction(orgId: string, amount: number, description: string, verificationToken: string) {
    let verificationTokenId: string;

    verificationTokenId = await this.tokenService.verifyToken(verificationToken || '', orgId);

    if (!verificationTokenId) {
      throw new BadRequestException('Invalid token');
    }

    const [generatedInvoice, amountPriceInDollars] = await Promise.all([
      this.lnbitsApiService.generateInvoice({ amount, description }, true),
      this.getCurrentAmountPriceInDollars(amount)
    ]);


    return this.saveTransaction(generatedInvoice, amount, description, true, orgId, verificationTokenId, +amountPriceInDollars.toFixed(3));
  }

  public async generateOutboundTransaction(orgId: string, amount: number, description: string, lightningInvoice: string) {
    try {
      const [generatedInvoice, amountPriceInDollars] = await Promise.all([
        this.lnbitsApiService.generateInvoice({ lightningInvoice, description }, false),
        this.getCurrentAmountPriceInDollars(amount)
      ]);

      return this.saveTransaction(generatedInvoice, amount, description, false, orgId, null, +amountPriceInDollars.toFixed(3));

    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new InternalServerErrorException('Error generating invoice');
    }
  }

  public async findTransactionState(transactionId: string): Promise<{ state: string }> {
    const transaction = await this.transactionModel.findById(transactionId).exec();

    if (!transaction) {
      throw new BadRequestException('The transaction does not exist!');
    }

    return { state: transaction.state };
  }

  public findTransaction(transactionId: string): Promise<TransactionDocument> {
    return this.transactionModel.findById(transactionId).exec();
  }

  public async getTransactionsForOrganization(
    orgId: string,
    userId: string,
    filters: { amount?: number; amountPriceInDollars?: number; description?: string; state?: string; date?: { $gte: Date, $lte: Date } },
    sort: { field: 'state' | 'amount' | 'date' | 'amountPriceInDollars'; order: 'asc' | 'desc' },
    pagination: { page: number; limit: number },
  ) {
    const userOrganization = await this.userOrganizationModel.findOne({ orgId, userId }).lean();

    if (!userOrganization) {
      throw new ForbiddenException('User is not part of this organization');
    }

    const filtersQuery = this.parseFiltersQuery(orgId, filters);
    const sortQuery = this.parseSortQuery(sort);

    const page = pagination.page > 0 ? pagination.page : 1;
    const limit = pagination.limit > 0 ? pagination.limit : 10;
    const skip = (page - 1) * limit;

    const transactions = await this.transactionModel
      .find(filtersQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.transactionModel.countDocuments(filtersQuery);

    return {
      transactions: transactions.map((transaction) => ({
        id: transaction._id,
        amount: transaction.amount,
        amountPriceInDollars: transaction.amountPriceInDollars,
        description: transaction.description,
        state: transaction.state,
        date: transaction.date,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async exportTransactionsToCSV(
    orgId: string,
    userId: string,
    filters: { amount?: number; amountPriceInDollars?: number; description?: string; state?: string, startDate?: string; endDate?: string },
    sort: { field: 'state' | 'amount'; order: 'asc' | 'desc' },
  ): Promise<string> {
    const userOrganization = await this.userOrganizationModel.findOne({ orgId, userId }).lean();
    if (!userOrganization) {
      throw new ForbiddenException('User is not part of this organization');
    }

    const filtersQuery = this.parseFiltersQuery(orgId, filters);
    const sortQuery = this.parseSortQuery(sort);

    const transactions = await this.transactionModel.find(filtersQuery).sort(sortQuery).lean();

    const csvData = csv.stringify(
      transactions.map((transaction) => ({
        id: transaction._id.toString(),
        amount: transaction.amount,
        description: transaction.description,
        state: transaction.state,
      })),
      { header: true }
    );

    return csvData;
  }

  private saveTransaction(generatedInvoice: GeneratedInvoice, amount: number, description: string,
    isInbound: boolean, orgId: string, verificationTokenId: string, amountPriceInDollars: number): Promise<TransactionDocument> {
    const transaction = new this.transactionModel({
      paymentHash: generatedInvoice.paymentHash,
      invoicePaymentRequest: generatedInvoice.invoicePaymentRequest,
      amount,
      description,
      isInbound,
      state: generatedInvoice.paymentHash ? TransactionState.PENDING : TransactionState.FAILED,
      orgId,
      date: new Date().toISOString(),
      amountPriceInDollars,
      verificationTokenId,
    });

    return transaction.save();
  }

  private getCurrentAmountPriceInDollars(amount: number): Promise<number> {
    return fetch('https://api.coinbase.com/v2/prices/BTC-USD/sell')
      .then(res => res.json())
      .then(result => {
        const price = +result.data.amount;
        return (amount / 100_000_000) * price;
      })
  }

  private parseFiltersQuery(orgId: string,
    filters: { amount?: number; amountPriceInDollars?: number; description?: string; state?: string; date?: { $gte: Date, $lte: Date } }) {
    const query: any = { orgId };

    if (filters.amount) {
      query.amount = filters.amount;
    }

    if (filters.amountPriceInDollars) {
      query.amountPriceInDollars = filters.amountPriceInDollars;
    }

    if (filters.description) {
      query.description = { $regex: filters.description, $options: 'i' };
    }

    if (filters.state) {
      query.state = filters.state;
    }

    if (filters.date) {
      query.date = {};

      if (filters.date?.$gte) {
        query.date.$gte = filters.date.$gte;
      }

      if (filters.date?.$lte) {
        query.date.$lte = filters.date.$lte;
      }
    }

    return query;
  }

  private parseSortQuery(sort: { field: 'state' | 'amount' | 'date' | 'amountPriceInDollars'; order: 'asc' | 'desc' }) {
    const query: any = {};

    if (sort.field) {
      query[sort.field] = sort.order === 'asc' ? 1 : -1;
    }

    return query;
  }
}
