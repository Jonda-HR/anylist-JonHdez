import { IsOptional, IsUUID, IsArray, IsBoolean } from 'class-validator';
import { CreateUserInput } from './create-user.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { ValidRoles } from '../../auth/enums/valid-roles.enum';
import { ValidRolesArgs } from './args/roles.args';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => [ValidRoles], { nullable: true })
  @IsOptional()
  @IsArray()
  roles?: ValidRoles[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
