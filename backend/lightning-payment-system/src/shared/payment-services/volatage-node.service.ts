import { Injectable } from '@nestjs/common';
import { TransactionGenerationDto } from 'src/dtos/transaction-generation.dto';
import { GeneratedInvoice } from 'src/interfaces/generated-invoice';

@Injectable()
export class VoltageNodeService {
  private readonly REST_HOST = 'balkan-node.u.voltageapp.io:8080';
  private readonly MACAROON = '';

  public getInfo() {
    return fetch(`https://${this.REST_HOST}/v1/getinfo`, {
      method: 'GET',
      headers: {
        'Grpc-Metadata-macaroon': this.MACAROON,
      },
    }).then((res) => res.json());
  }

  public generateInvoice(transactionInfo: TransactionGenerationDto): Promise<GeneratedInvoice> {
    return fetch(`https://${this.REST_HOST}/v1/invoices`, {
      method: 'POST',
      headers: {
        'Grpc-Metadata-macaroon': this.MACAROON,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: transactionInfo.amount,
        memo: transactionInfo.description,
      }),
    })
      .then((res) => res.json())
      .then((invoiceData) => {
        return {
          paymentHash: invoiceData.r_hash,
          invoicePaymentRequest: invoiceData.payment_request,
        };
      });
  }

  public payInvoice() {
    return fetch(`https://${this.REST_HOST}/v1/channels/transactions`, {
      method: 'POST',
      headers: {
        'Grpc-Metadata-macaroon': this.MACAROON,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_request: 'lntbs205u1pnnp6jvpp5m5ruw359e848dreqy6f29slc7z4n6wdl3wk2tvdl9rwk77t0hw0qdqqcqzznxqr8qlsp58c4g5ktyc6q7w263nw02aguc6wqvze6n30pmqug5dtjrmesu99rq9p4gqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqysgqu2qvc65qjy4yggp88tj585qut04gdyz5qmwdfcj4pd7s7mf6nxgh7p70nqkvn9z8n04h7ndc39dp5cp9j3e3gd9vtgs8cdq95ne207cpn7qjrx',
      }),
    }).then((res) => res.json());
  }
}
