import { ForbiddenException } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { GroupClearanceResponseDto } from '../../clearance/dto/group-clearance-response.dto';
import { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import { GroupClearanceService } from '../../clearance/group-clearance.service';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { ValidationService } from '../../identity-management/service/validation.service';
import { OfferValidationService } from '../../offers/service/offer-validation.service';
import { ClearancePolicyService } from '../clearance-policy.service';

@Resolver(() => GroupClearanceResponseDto)
export class GroupClearanceCreateMutation {
  constructor(
    private readonly groupClearanceService: GroupClearanceService,
    private readonly offerValidationService: OfferValidationService,
    private readonly idmValidationService: ValidationService,
    private readonly clearancePolicyService: ClearancePolicyService,
  ) {}

  @Mutation(() => GroupClearanceResponseDto)
  async createGroupClearance(
    @UserCtx() userContext: UserContext,
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('groupId') groupId: string,
    @Args('schoolId') schoolId: string,
    @Args('idmId') idmId: string,
  ): Promise<GroupClearanceResponseDto> {
    await this.clearancePolicyService.verifyByUserAndOffer(userContext, offerId, idmId, schoolId);

    const activeSchoolIds = await this.offerValidationService.validateSchoolsAreActiveForOffer(
      [schoolId],
      offerId,
    );
    if (!activeSchoolIds.includes(schoolId)) {
      throw new ForbiddenException();
    }

    const validGroupIds = await this.idmValidationService.validateGroupsForSchools(
      [schoolId],
      [groupId],
      [idmId],
    );
    if (!validGroupIds.includes(groupId)) {
      throw new ForbiddenException();
    }

    const clearanceEntry = new GroupClearance();
    clearanceEntry.offerId = offerId;
    clearanceEntry.groupId = groupId;
    clearanceEntry.schoolId = schoolId;
    clearanceEntry.idmId = idmId;

    return new GroupClearanceResponseDto(await this.groupClearanceService.save(clearanceEntry));
  }
}
