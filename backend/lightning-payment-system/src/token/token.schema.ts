import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: true })
  value: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  orgId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  expiryDate: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

TokenSchema.pre('save', async function (next) {
  if (!this.isModified('createdAt')) {
    return next();
  }

  this.createdAt = new Date();
  this.isActive = true;

  next();
});
