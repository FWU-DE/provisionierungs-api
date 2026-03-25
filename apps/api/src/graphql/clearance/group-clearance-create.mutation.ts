import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { GroupClearanceResponseDto } from '../../clearance/dto/group-clearance-response.dto';
import { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import { GroupClearanceService } from '../../clearance/group-clearance.service';

@Resolver(() => GroupClearanceResponseDto)
export class GroupClearanceCreateMutation {
  constructor(private readonly groupClearanceService: GroupClearanceService) {}

  @Mutation(() => GroupClearanceResponseDto)
  async createGroupClearance(
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('groupId') groupId: string,
    @Args('schoolId') schoolId: string,
    @Args('idmId') idmId: string,
  ): Promise<GroupClearanceResponseDto> {
    // @todo: Validate that the idmId, schoolId, groupId and offerId are actually available to the current user!!!

    const clearanceEntry = new GroupClearance();
    clearanceEntry.offerId = offerId;
    clearanceEntry.groupId = groupId;
    clearanceEntry.schoolId = schoolId;
    clearanceEntry.idmId = idmId;

    return new GroupClearanceResponseDto(await this.groupClearanceService.save(clearanceEntry));
  }
}
