import { Query, Resolver } from '@nestjs/graphql';
import { Clearance } from './clearance.entity';
import { ClearanceService } from './clearance.service';
import { In } from 'typeorm';

@Resolver()
export class ClearanceQuery {
  constructor(private readonly service: ClearanceService) {}

  @Query(() => [Clearance])
  // @NoAccessTokenAuthRequired()
  async allClearances(): Promise<Clearance[]> {
    // TODO: We should always restrict responses by the currently logged in school.
    return await this.service.findAll({
      where: {
        // @todo: Replace with actual school ids
        schoolId: In(['school-1']),
      },
    });
  }
}
