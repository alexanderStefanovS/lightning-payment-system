import { IsDateString, IsString } from "class-validator";

export class TokenDto {
    @IsString()
    description: string;
    @IsString()
    orgId: string;
    @IsDateString()
    expiryDate: Date;
}
