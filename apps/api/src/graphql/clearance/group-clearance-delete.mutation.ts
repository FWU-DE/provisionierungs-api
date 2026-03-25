import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { GroupClearanceDeleteResponseDto } from '../../clearance/dto/group-clearance-delete-response.dto';
import { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import { GroupClearanceService } from '../../clearance/group-clearance.service';

@Resolver(() => GroupClearance)
export class GroupClearanceDeleteMutation {
  constructor(private readonly groupClearanceService: GroupClearanceService) {}

  @Mutation(() => GroupClearanceDeleteResponseDto)
  async deleteGroupClearance(
    @Args('id', { type: () => String }) id: string,
  ): Promise<GroupClearanceDeleteResponseDto> {
    // @todo: Validate that the clearance entry is actually available to the current user!!!

    await this.groupClearanceService.delete(id);
    return new GroupClearanceDeleteResponseDto(true);
  }
}
