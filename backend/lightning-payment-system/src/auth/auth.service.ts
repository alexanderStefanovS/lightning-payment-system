import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccessTokenDto } from 'src/dtos/access-token.dto';
import { UserDocument } from 'src/user/user.schema';
import { UserService } from 'src/user/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  public async validateUserByJwt(userId: string) {
    const user = await this.userService.findById(userId);
    return user ? user : null;
  }

  public async login(email: string, password: string): Promise<AccessTokenDto> {
    const user = await this.validateUser(email, password);

    const payload = { sub: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
