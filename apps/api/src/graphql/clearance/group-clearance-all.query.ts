import { Inject } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';

import { GroupClearanceResponseDto } from '../../clearance/dto/group-clearance-response.dto';
import { GroupClearanceService } from '../../clearance/group-clearance.service';
import { AllowResourceOwnerType, ResourceOwnerType } from '../../common/auth';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { Logger } from '../../common/logger';
import { ValidationService } from '../../identity-management/service/validation.service';
import { OfferValidationService } from '../../offers/service/offer-validation.service';

@Resolver()
export class GroupClearanceAllQuery {
  constructor(
    private readonly groupClearanceService: GroupClearanceService,
    private readonly offerValidationService: OfferValidationService,
    private readonly idmValidationService: ValidationService,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.logger.setContext(GroupClearanceAllQuery.name);
  }

  @Query(() => [GroupClearanceResponseDto])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allGroupClearances(
    @UserCtx() userContext: UserContext,
    @Args('offerId', { type: () => Int, nullable: true }) offerId?: number,
    @Args('schoolId', { type: () => String, nullable: true }) schoolId?: string,
  ): Promise<GroupClearanceResponseDto[]> {
    this.logger.debug('GroupClearanceAllQuery: Fetching all group clearances.');
    let schoolIds = userContext.schulkennung;
    if (schoolId && userContext.schulkennung.includes(schoolId)) {
      schoolIds = [schoolId];
    }

    if (offerId) {
      schoolIds = await this.offerValidationService.validateSchoolsAreActiveForOffer(
        schoolIds,
        offerId,
      );
    }
    const response = await this.groupClearanceService.findByIdmAndSchools(
      [userContext.heimatorganisation],
      schoolIds,
      offerId,
    );

    this.logger.debug('GroupClearanceAllQuery: Fetched group clearances.', {
      groupClearanceCount: response.length,
    });

    const validGroupIds = await this.idmValidationService.validateGroupsForSchools(
      schoolIds,
      response.map((groupClearance) => groupClearance.groupId),
      [userContext.heimatorganisation],
    );

    return response
      .filter((groupClearance) => validGroupIds.includes(groupClearance.groupId))
      .map((groupClearance) => new GroupClearanceResponseDto(groupClearance));
  }
}
