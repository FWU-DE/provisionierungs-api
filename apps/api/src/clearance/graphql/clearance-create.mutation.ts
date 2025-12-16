import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { ClearanceService } from '../clearance.service';
import { ClearanceResponse } from '../dto/clearance-response.dto';
import { Clearance } from '../entity/clearance.entity';

@Resolver(() => ClearanceResponse)
export class ClearanceCreateMutation {
  constructor(private readonly clearanceService: ClearanceService) {}

  @Mutation(() => ClearanceResponse)
  async createClearance(
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('groupId') groupId: string,
    @Args('schoolId') schoolId: string,
    @Args('idmId') idmId: string,
  ): Promise<ClearanceResponse> {
    // @todo: Validate that the idmId, schoolId, groupId and offerId are actually available to the current user!!!

    const clearanceEntry = new Clearance();
    clearanceEntry.offerId = offerId;
    clearanceEntry.groupId = groupId;
    clearanceEntry.schoolId = schoolId;
    clearanceEntry.idmId = idmId;

    return new ClearanceResponse(await this.clearanceService.save(clearanceEntry));
  }
}
