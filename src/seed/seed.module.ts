import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';

import { UsersModule } from '../users/users.module';
import { ItemsModule } from '../items/items.module';
import { ListItemModule } from '../list-item/list-item.module';
import { ListsModule } from '../lists/lists.module';

@Module({
  providers: [SeedResolver, SeedService],
  imports: [
    UsersModule,
    ItemsModule,
    TypeOrmModule,
    ConfigModule,
    ListItemModule,
    ListsModule,
  ],
})
export class SeedModule {}
