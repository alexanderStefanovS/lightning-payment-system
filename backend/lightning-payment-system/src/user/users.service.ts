import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { genSalt, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { UserDto } from 'src/dtos/user.dto';
import { UserRole } from 'src/enums/user-role';
import { User, UserDocument } from 'src/user/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

  public async registerUser({ firstName, lastName, email, password }: UserDto, role = UserRole.USER): Promise<UserDocument> {
    try {
      const user = new this.userModel({ firstName, lastName, email, password, role, isActive: true });
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

  async deactivateUser(userId: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.isActive = false;
    await user.save();

    return { message: "User has been deactivated successfully." };
  }

  async getUsers(email?: string, page = 1, limit = 10) {
    const query: any = {};

    if (email) {
      query.email = { $regex: new RegExp(email, 'i') };
    }

    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .select('-password')
      .lean();

    const total = await this.userModel.countDocuments(query);

    return {
      users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
