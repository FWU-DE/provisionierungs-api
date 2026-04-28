import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { GroupClearanceDeleteResponseDto } from '../../clearance/dto/group-clearance-delete-response.dto';
import { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import { GroupClearanceService } from '../../clearance/group-clearance.service';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { ClearancePolicyService } from '../clearance-policy.service';

@Resolver(() => GroupClearance)
export class GroupClearanceDeleteAllMutation {
  constructor(
    private readonly groupClearanceService: GroupClearanceService,
    private readonly clearancePolicyService: ClearancePolicyService,
  ) {}

  @Mutation(() => GroupClearanceDeleteResponseDto)
  async deleteAllGroupClearances(
    @UserCtx() userContext: UserContext,
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('idmId') idmId: string,
    @Args('schoolId') schoolId: string,
  ): Promise<GroupClearanceDeleteResponseDto> {
    await this.clearancePolicyService.verifyByUserAndOffer(userContext, offerId, idmId, schoolId);

    await this.groupClearanceService.deleteAll(offerId, idmId, schoolId);
    return new GroupClearanceDeleteResponseDto(true);
  }
}
