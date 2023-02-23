import { Resolver, Query, Mutation, Args, Int, Parent } from '@nestjs/graphql';
import { ListItemService } from './list-item.service';
import { ListItem } from './entities/list-item.entity';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { SearchArgs } from 'src/common/dto/args/search.args';
import { PaginationArgs } from 'src/common/dto/args/pagination.args';
import { List } from 'src/lists/entities/list.entity';

@Resolver(() => ListItem)
@UseGuards(JwtAuthGuard)
export class ListItemResolver {
  constructor(private readonly listItemService: ListItemService) {}

  @Mutation(() => ListItem)
  async createListItem(
    @Args('createListItemInput') createListItemInput: CreateListItemInput,
    //TODO Verificar si el usuario que crea El ListItem es el dueño de ella
  ): Promise<ListItem> {
    return await this.listItemService.create(createListItemInput);
  }

  @Query(() => ListItem, { name: 'listItem' })
  async findOne(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
  ): Promise<ListItem> {
    return await this.listItemService.findOne(id);
  }

  @Mutation(() => ListItem)
  async updateListItem(
    @Args('updateListItemInput') updateListItemInput: UpdateListItemInput,
  ): Promise<ListItem> {
    return await this.listItemService.update(
      updateListItemInput.id,
      updateListItemInput,
    );
  }

  //   @Mutation(() => ListItem)
  //   removeListItem(@Args('id', { type: () => Int }) id: number) {
  //     return this.listItemService.remove(id);
  //   }
}
