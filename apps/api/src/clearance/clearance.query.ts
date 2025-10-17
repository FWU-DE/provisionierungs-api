import { Query, Resolver } from '@nestjs/graphql';
import { Clearance } from './clearance.entity';
import { ClearanceService } from './clearance.service';

@Resolver()
export class ClearanceQuery {
  constructor(private readonly service: ClearanceService) {}

  @Query(() => [Clearance])
  // @NoAccessTokenAuthRequired()
  async allClearances(): Promise<Clearance[]> {
    // TODO: We should always restrict responses by the currently logged in school.
    return await this.service.findAll();
  }
}
