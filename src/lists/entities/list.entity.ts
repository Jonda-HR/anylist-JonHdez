import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsString } from 'class-validator';
import { ListItem } from '../../list-item/entities/list-item.entity';

@Entity({ name: 'lists' })
@ObjectType()
export class List {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  @IsString()
  name: string;

  @ManyToOne(() => User, (user) => user.lists, { nullable: true, lazy: true })
  @Field(() => User)
  @Index('userId-list-index')
  user: User;

  @OneToMany(() => ListItem, (listItem) => listItem.list, { lazy: true })
  // @Field(() => [ListItem])
  listItem: ListItem[];
}
