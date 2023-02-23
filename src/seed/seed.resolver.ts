import { Mutation, Resolver } from '@nestjs/graphql';
import { SeedService } from './seed.service';

@Resolver()
export class SeedResolver {
  constructor(private readonly seedService: SeedService) {}

  @Mutation(() => Boolean, {
    description: 'Ejecucion de construccion de DB',
    name: 'executeSeed',
  })
  async executeSeed(): Promise<boolean> {
    return await this.seedService.execuiteSeed();
  }
}
