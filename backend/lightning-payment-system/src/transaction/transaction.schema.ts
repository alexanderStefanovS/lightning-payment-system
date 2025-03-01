import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TransactionState } from 'src/enums/transaction-state';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    amountPriceInDollars: number;

    @Prop({ required: true })
    description: string;

    @Prop()
    invoicePaymentRequest: string;

    @Prop()
    paymentHash: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true, default: true })
    isInbound: boolean;

    @Prop({ required: true, enum: TransactionState })
    state: TransactionState;

    @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
    orgId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Token' })
    verificationTokenId: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
