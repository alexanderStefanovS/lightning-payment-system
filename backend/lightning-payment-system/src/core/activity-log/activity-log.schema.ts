import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document;

@Schema({ timestamps: true })
export class ActivityLog {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    action: string;

    @Prop({ required: true })
    method: string;

    @Prop({ required: true })
    path: string;

    @Prop({ type: Object })
    body?: any;

    @Prop({ required: true, default: 'success' })
    status: string;

    @Prop()
    errorMessage?: string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
