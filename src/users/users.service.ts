import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/update-user.input';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { SearchArgs } from '../common/dto/args/search.args';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger('UserService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.userRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findAll(
    roles: ValidRoles[],
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<User[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.userRepository
      .createQueryBuilder()
      .limit(limit)
      .take(offset);

    if (roles.length !== 0) {
      queryBuilder
        .andWhere('ARRAY[roles] && ARRAY[:...roles]')
        .setParameter('roles', roles);
    }

    if (search) {
      queryBuilder.andWhere('LOWER("fullName") like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ email });
    } catch (error) {
      this.handleErrors({
        code: 'Error-01',
        detail: `${email} not found`,
      });
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ id });
    } catch (error) {
      this.handleErrors({
        code: 'Error-02',
        detail: `${id} not found`,
      });
    }
  }

  async block(id: string, user: User): Promise<User> {
    const userToBlok = await this.findOneById(id);
    userToBlok.isActive = false;
    userToBlok.lastUpdateBy = user;
    return await this.userRepository.save(userToBlok);
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    user: User,
  ): Promise<User> {
    try {
      const userUpdate = await this.userRepository.preload({
        ...updateUserInput,
        id,
      });
      userUpdate.lastUpdateBy = user;
      await this.userRepository.save(userUpdate);
      return userUpdate;
    } catch (error) {
      this.handleErrors({
        code: 'Error-03',
        detail: `dont update user`,
      });
    }
  }

  private handleErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    if (error.code === 'Error-01') {
      throw new BadRequestException(error.detail);
    }
    if (error.code === 'Error-02') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
