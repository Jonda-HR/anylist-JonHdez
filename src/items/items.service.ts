import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { SearchArgs } from '../common/dto/args/search.args';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemRepository.create({ ...createItemInput, user });
    await this.itemRepository.save(newItem);
    return this.findOne(newItem.id, user);
  }

  async findAll(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<Item[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;
    const queryBuilder = this.itemRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }
    return queryBuilder.getMany();
    // return await this.itemRepository.find({
    //   take: limit,
    //   skip: offset,
    //   where: {
    //     user: {
    //       id: user.id,
    //     },
    //     name: Like(`%${search}%`),
    //   },
    // });
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemRepository.findOneBy({
      id,
      user: {
        id: user.id,
      },
    });
    if (!item) throw new NotFoundException(`Item Whit id ${id} not found`);
    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);
    const item = await this.itemRepository.preload(updateItemInput);
    if (!item) throw new NotFoundException(`Item Whit id ${id} not found`);
    return this.itemRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    const item = await this.findOne(id, user);
    await this.itemRepository.remove(item);
    return { ...item, id };
  }

  async itemCountByUser(user: User): Promise<number> {
    return await this.itemRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }
}
