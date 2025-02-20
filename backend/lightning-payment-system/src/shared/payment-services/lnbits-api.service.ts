import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionState } from 'src/enums/transaction-state';
import { GeneratedInvoice } from 'src/interfaces/generated-invoice';

@Injectable()
export class LnbitsApiService {
    private readonly baseUrl = 'https://demo.lnbits.com/api/v1';
    private readonly xApiKey: string;

    constructor(private configService: ConfigService) {
        this.xApiKey = this.configService.get<string>('LNBITS_X_API_KEY')
    }

    public generateInvoice(config: { amount?: number, description?: string, lightningInvoice?: string }, isInbound: boolean): Promise<GeneratedInvoice> {
        const body = {
            out: !isInbound,
            ...(config.amount && { amount: config.amount }),
            ...(config.lightningInvoice && { bolt11: config.lightningInvoice }),
            memo: config.description,
        };

        console.log(body);

        return fetch(`${this.baseUrl}/payments`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.xApiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
            .then((res) => res.json())
            .then((data) => {

                console.log(data);

                return {
                    paymentHash: data.payment_hash,
                    invoicePaymentRequest: data.payment_request,
                };
            });
    }

    public getTransactionStatus(paymentHash: string): Promise<TransactionState | null> {
        return fetch(`${this.baseUrl}/payments/${paymentHash}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.xApiKey,
                'Content-Type': 'application/json',
            },
        })
            .then(res => res.json())
            .then(data => data.details.status);
    }

    async getBalance(): Promise<number> {
        const response = await fetch(`${this.baseUrl}/wallets`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.xApiKey,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();
        return data.balance;
    }

    public async withdraw(amount: number, lightningAddress: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/payments`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.xApiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ out: true, amount, bolt11: lightningAddress }),
        });

        if (!response.ok) {
            throw new Error('Failed to process withdrawal');
        }
    }
}