import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { GroupClearanceDeleteResponse } from '../dto/group-clearance-delete-response.dto';
import { GroupClearance } from '../entity/group-clearance.entity';
import { GroupClearanceService } from '../group-clearance.service';

@Resolver(() => GroupClearance)
export class GroupClearanceDeleteAllMutation {
  constructor(private readonly groupClearanceService: GroupClearanceService) {}

  @Mutation(() => GroupClearanceDeleteResponse)
  async deleteAllGroupClearances(
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('idmId') idmId: string,
    @Args('schoolId') schoolId: string,
  ): Promise<GroupClearanceDeleteResponse> {
    // @todo: Validate that the clearance entry is actually available to the current user!!!

    await this.groupClearanceService.deleteAll(offerId, idmId, schoolId);
    return new GroupClearanceDeleteResponse(true);
  }
}
