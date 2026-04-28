import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { GroupClearanceDeleteResponseDto } from '../../clearance/dto/group-clearance-delete-response.dto';
import { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import { GroupClearanceService } from '../../clearance/group-clearance.service';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { Logger } from '../../common/logger';
import { ClearancePolicyService } from '../clearance-policy.service';

@Resolver(() => GroupClearance)
export class GroupClearanceDeleteMutation {
  constructor(
    private readonly groupClearanceService: GroupClearanceService,
    private readonly clearancePolicyService: ClearancePolicyService,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.logger.setContext(GroupClearanceDeleteMutation.name);
  }

  @Mutation(() => GroupClearanceDeleteResponseDto)
  async deleteGroupClearance(
    @UserCtx() userContext: UserContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<GroupClearanceDeleteResponseDto> {
    this.logger.log(`GroupClearanceDeleteMutation: Deleting group clearance entry with ID: ${id}`);
    const clearanceEntry = await this.groupClearanceService.findOne({ where: { id } });
    if (!clearanceEntry) {
      return new GroupClearanceDeleteResponseDto(true);
    }

    this.clearancePolicyService.verifyByUser(
      userContext,
      clearanceEntry.idmId,
      clearanceEntry.schoolId,
    );

    await this.groupClearanceService.delete(id);
    return new GroupClearanceDeleteResponseDto(true);
  }
}
