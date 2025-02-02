import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({ timestamps: true })
export class Organization {
    @Prop({ required: true, unique: true })
    public name: string;

    @Prop({ required: true })
    public description: string;

    @Prop({ required: true, default: 0 })
    public balance: number;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
