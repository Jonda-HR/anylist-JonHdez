import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { SignupInput } from './inputs/signup.input';
import { UsersService } from '../users/users.service';
import { LoginInput } from './inputs/login.input';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }

  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    const user = await this.userService.create(signupInput);

    const token = this.getJwtToken(user.id);

    return { token, user };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { password, email } = loginInput;
    const user = await this.userService.findOneByEmail(email);
    const token = this.getJwtToken(user.id);
    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Email / Password do not match');
    }
    return {
      token,
      user,
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userService.findOneById(id);
    if (!user.isActive) {
      throw new UnauthorizedException('User is Inactive');
    }
    delete user.password;
    return user;
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user.id);

    return { token, user };
  }
}
