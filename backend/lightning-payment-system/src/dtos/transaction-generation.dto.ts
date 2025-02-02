import { IsNumber, IsString } from "class-validator";

export class TransactionGenerationDto {
    @IsNumber()
    public amount: number;
    
    @IsString()
    public description: string;
    
    @IsString()
    public verificationToken: string;
    
    @IsString()
    public orgId: string;
}
