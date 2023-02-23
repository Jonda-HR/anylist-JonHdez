import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { List } from '../../lists/entities/list.entity';
import { Item } from 'src/items/entities/item.entity';

@Entity('listItems')
@Unique('listItem-item', ['list', 'item'])
@ObjectType()
export class ListItem {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'numeric' })
  @Field(() => Number)
  quantity: number;

  @Column({ type: 'boolean' })
  @Field(() => Boolean)
  completed: boolean;

  // Relaciones
  @ManyToOne(() => List, (list) => list.listItem, { lazy: true })
  @Field(() => List)
  list: List;

  @ManyToOne(() => Item, (item) => item.listItem, { lazy: true })
  @Field(() => Item)
  item: Item;
}
