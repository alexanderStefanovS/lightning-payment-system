import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { OrganizationRole } from 'src/enums/organization-role';
import { OrganizationStatus } from 'src/enums/organization-status';

export type UserOrganizationDocument = HydratedDocument<UserOrganization>;

@Schema({ collection: 'userOrganization', timestamps: true })
export class UserOrganization {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  public userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  public orgId: string;

  @Prop({ required: true, enum: OrganizationRole })
  public role: OrganizationRole;

  @Prop({ required: true, enum: OrganizationStatus })
  public status: OrganizationStatus;
}

export const UserOrganizationSchema = SchemaFactory.createForClass(UserOrganization);
