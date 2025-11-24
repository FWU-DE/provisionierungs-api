import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { Clearance } from '../entity/clearance.entity';
import { ClearanceService } from '../clearance.service';

@Resolver(() => Clearance)
export class ClearanceCreateMutation {
  constructor(private readonly clearanceService: ClearanceService) {}

  @Mutation(() => Clearance)
  createClearance(
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('groupId') groupId: string,
    @Args('schoolId') schoolId: string,
    @Args('idmId') idmId: string,
  ): Promise<Clearance> {
    // @todo: Catch duplicated entry!
    // @todo: Validate that the idmId, schoolId, groupId and offerId are actually available to the current user!!!

    const clearanceEntry = new Clearance();
    clearanceEntry.offerId = offerId;
    clearanceEntry.groupId = groupId;
    clearanceEntry.schoolId = schoolId;
    clearanceEntry.idmId = idmId;

    // @todo: Use a response DTO.

    return this.clearanceService.save(clearanceEntry);
  }
}
