import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { decode, DecodedInvoice } from "light-bolt11-decoder";
import { Model } from "mongoose";
import { Organization, OrganizationDocument } from "src/organization/schemas/organization.schema";
import { LnbitsApiService } from "src/shared/payment-services/lnbits-api.service";
import { TransactionService } from "src/transaction/transaction.service";

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Organization.name) private readonly organizationModel: Model<OrganizationDocument>,
    private readonly lnbitsApiService: LnbitsApiService,
    private readonly transactionService: TransactionService,
  ) { }

  public async getOrganizationBalance(orgId: string): Promise<{ balance: number }> {
    const balance = (await this.organizationModel.findById(orgId)).balance;
    return { balance };
  }

  public async updateOrganizationBalance(orgId: string, balance: number) {
    await this.organizationModel.findByIdAndUpdate(orgId, { balance });
  }

  public async createWithdrawTransaction(orgId: string, lightningInvoice: string): Promise<{ transactionId: string }> {
    const organization = await this.organizationModel.findById(orgId);
    if (!organization) {
      throw new BadRequestException('Organization not found');
    }
 
    let decodedInvoice: DecodedInvoice;

    try {
      decodedInvoice = decode(lightningInvoice);
    } catch {
      throw new BadRequestException('Invalid invoice');
    }

    const amount = +decodedInvoice.sections.find(section => section.name === 'amount').value / 1000;
    const description = decodedInvoice.sections.find(section => section.name === 'description').value;
    
    if (!amount || !description) {
      throw new BadRequestException('Invalid invoice');
    }

    if (amount > organization.balance) {
      throw new ForbiddenException('Insufficient balance');
    }

    const transaction = await this.transactionService.generateOutboundTransaction(organization.id, amount, description, lightningInvoice);

    this.updateOrganizationBalance(orgId, organization.balance - amount);
    
    return { transactionId: transaction.id };
  }
}
