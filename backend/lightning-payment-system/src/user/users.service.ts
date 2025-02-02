import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { genSalt, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { UserDto } from 'src/dtos/user.dto';
import { User, UserDocument } from 'src/user/user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

    public async registerUser({ firstName, lastName, email, password }: UserDto): Promise<UserDocument> {
        try {
            const user = new this.userModel({ firstName, lastName, email, password });
            return await user.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('A user with this email already exists');
            }

            throw new InternalServerErrorException('An error occurred while creating the user');
        }
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async changePassword(userId: string, password: string): Promise<void> {
        const salt = await genSalt();
        password = await hash(password, salt);

        await this.userModel.findByIdAndUpdate(userId, { password }).exec();
    }
}
