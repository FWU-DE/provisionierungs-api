import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { GroupClearanceDeleteResponseDto } from '../../clearance/dto/group-clearance-delete-response.dto';
import { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import { GroupClearanceService } from '../../clearance/group-clearance.service';

@Resolver(() => GroupClearance)
export class GroupClearanceDeleteAllMutation {
  constructor(private readonly groupClearanceService: GroupClearanceService) {}

  @Mutation(() => GroupClearanceDeleteResponseDto)
  async deleteAllGroupClearances(
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('idmId') idmId: string,
    @Args('schoolId') schoolId: string,
  ): Promise<GroupClearanceDeleteResponseDto> {
    // @todo: Validate that the clearance entry is actually available to the current user!!!

    await this.groupClearanceService.deleteAll(offerId, idmId, schoolId);
    return new GroupClearanceDeleteResponseDto(true);
  }
}
