import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LIST, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListItem } from '../list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from 'src/lists/lists.service';
import { ListItemService } from 'src/list-item/list-item.service';

@Injectable()
export class SeedService {
  private isProd: boolean;
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    private readonly listsItemsService: ListItemService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>,
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }
  async execuiteSeed(): Promise<boolean> {
    if (this.isProd) {
      throw new UnauthorizedException(
        'No se puede ejecuar el seed en produccion',
      );
    }
    await this.deleteDataBase();
    const user = await this.loadUsers();
    const item = await this.loadItems(user);
    const list = await this.loadList(user);
    const items = await this.itemsService.findAll(
      user,
      { limit: 15, offset: 0 },
      {},
    );
    await this.loadlistItems(list, items);
    return true;
  }

  async deleteDataBase() {
    await this.listItemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    await this.listsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadUsers(): Promise<User> {
    const users = [];
    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }
    return users[0];
  }

  async loadItems(user: User): Promise<boolean> {
    const itemsPromises = [];
    for (const item of SEED_ITEMS) {
      itemsPromises.push(this.itemsService.create(item, user));
    }
    await Promise.all(itemsPromises);
    return true;
  }

  async loadList(user: User): Promise<List> {
    const lists = [];
    for (const list of SEED_LIST) {
      lists.push(await this.listsService.create(list, user));
    }
    return lists[0];
  }

  async loadlistItems(list: List, items: Item[]) {
    for (const item of items) {
      this.listsItemsService.create({
        quantity: Math.round(Math.random() * 10),
        completed: false,
        listId: list.id,
        itemId: item.id,
      });
    }
  }
}
