import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";
import { Organization, OrganizationSchema } from "src/organization/schemas/organization.schema";
import { UserOrganization, UserOrganizationSchema } from "src/organization/schemas/user-organization.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: UserOrganization.name, schema: UserOrganizationSchema }
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})

export class UserModule { }
