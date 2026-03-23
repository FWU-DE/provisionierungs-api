import { Args, Int, Query, Resolver } from '@nestjs/graphql';

import { AllowResourceOwnerType, ResourceOwnerType } from '../../common/auth';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { GroupClearanceResponseDto } from '../dto/group-clearance-response.dto';
import { GroupClearanceService } from '../group-clearance.service';

@Resolver()
export class GroupClearanceAllQuery {
  constructor(private readonly groupClearanceService: GroupClearanceService) {}

  @Query(() => [GroupClearanceResponseDto])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allGroupClearances(
    @UserCtx() userContext: UserContext,
    @Args('offerId', { type: () => Int, nullable: true }) offerId?: number,
    @Args('schoolId', { type: () => String, nullable: true }) schoolId?: string,
  ): Promise<GroupClearanceResponseDto[]> {
    let schoolIds = userContext.schulkennung;
    if (schoolId && userContext.schulkennung.includes(schoolId)) {
      schoolIds = [schoolId];
    }

    const response = await this.groupClearanceService.findByIdmAndSchools(
      userContext.heimatorganisation,
      schoolIds,
      offerId,
    );

    return response.map((groupClearance) => new GroupClearanceResponseDto(groupClearance));
  }
}
