import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { GroupClearanceDeleteResponse } from '../dto/group-clearance-delete-response.dto';
import { GroupClearance } from '../entity/group-clearance.entity';
import { GroupClearanceService } from '../group-clearance.service';

@Resolver(() => GroupClearance)
export class GroupClearanceDeleteMutation {
  constructor(private readonly groupClearanceService: GroupClearanceService) {}

  @Mutation(() => GroupClearanceDeleteResponse)
  async deleteGroupClearance(
    @Args('id', { type: () => String }) id: string,
  ): Promise<GroupClearanceDeleteResponse> {
    // @todo: Validate that the clearance entry is actually available to the current user!!!

    await this.groupClearanceService.delete(id);
    return new GroupClearanceDeleteResponse(true);
  }
}
