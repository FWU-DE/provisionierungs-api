import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { GroupClearanceResponse } from '../dto/group-clearance-response.dto';
import { GroupClearance } from '../entity/group-clearance.entity';
import { GroupClearanceService } from '../group-clearance.service';

@Resolver(() => GroupClearanceResponse)
export class GroupClearanceCreateMutation {
  constructor(private readonly groupClearanceService: GroupClearanceService) {}

  @Mutation(() => GroupClearanceResponse)
  async createGroupClearance(
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('groupId') groupId: string,
    @Args('schoolId') schoolId: string,
    @Args('idmId') idmId: string,
  ): Promise<GroupClearanceResponse> {
    // @todo: Validate that the idmId, schoolId, groupId and offerId are actually available to the current user!!!

    const clearanceEntry = new GroupClearance();
    clearanceEntry.offerId = offerId;
    clearanceEntry.groupId = groupId;
    clearanceEntry.schoolId = schoolId;
    clearanceEntry.idmId = idmId;

    return new GroupClearanceResponse(await this.groupClearanceService.save(clearanceEntry));
  }
}
