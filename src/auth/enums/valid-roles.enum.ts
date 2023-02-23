import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles {
  admin = 'admin',
  user = 'user',
  superUser = 'superUser',
}

registerEnumType(ValidRoles, {
  name: 'validRoles',
  description: 'Esto seria una descripcion',
});
