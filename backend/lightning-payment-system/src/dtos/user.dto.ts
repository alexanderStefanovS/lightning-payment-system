import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class UserDto {
    @IsString()
    @IsNotEmpty()
    public firstName: string;

    @IsString()
    @IsNotEmpty()
    public lastName: string;

    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @IsString()
    @IsNotEmpty()
    // @MinLength(8, { message: 'Password must be at least 8 characters long' })
    // @Matches(/(?=.*[A-Z])/, { message: 'Password must include at least one uppercase letter' })
    // @Matches(/(?=.*[a-z])/, { message: 'Password must include at least one lowercase letter' })
    // @Matches(/(?=.*[0-9])/, { message: 'Password must include at least one number' })
    // @Matches(/(?=.*[!@#$%^&*])/, { message: 'Password must include at least one special character' })
    public password: string;
}
