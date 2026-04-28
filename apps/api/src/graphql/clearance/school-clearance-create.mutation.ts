import { ForbiddenException, Inject } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { SchoolClearanceResponseDto } from '../../clearance/dto/school-clearance-response.dto';
import { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { SchoolClearanceService } from '../../clearance/school-clearance.service';
import { ClientId } from '../../common/auth';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { Logger } from '../../common/logger';
import { SchulconnexOrganizationQueryParameters } from '../../controller/parameters/schulconnex-organisations-query-parameters';
import { Aggregator } from '../../identity-management/aggregator/aggregator';
import { OfferValidationService } from '../../offers/service/offer-validation.service';
import { ClearancePolicyService } from '../clearance-policy.service';

@Resolver(() => SchoolClearanceResponseDto)
export class SchoolClearanceCreateMutation {
  constructor(
    private readonly schoolClearanceService: SchoolClearanceService,
    private readonly aggregator: Aggregator,
    private readonly offerValidationService: OfferValidationService,
    private readonly clearancePolicyService: ClearancePolicyService,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.logger.setContext(SchoolClearanceCreateMutation.name);
  }

  @Mutation(() => SchoolClearanceResponseDto)
  async createSchoolClearance(
    @UserCtx() userContext: UserContext,
    @ClientId() clientId: string,
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('idmId') idmId: string,
    @Args('schoolId') schoolId: string,
  ): Promise<SchoolClearanceResponseDto> {
    this.logger.log(`SchoolClearanceCreateMutation: Creating school clearance.`, {
      offerId: offerId,
      idmId: idmId,
      schoolId: schoolId,
    });
    await this.clearancePolicyService.verifyByUserAndOffer(userContext, offerId, idmId, schoolId);

    // Validate that the school exists for the given IDMs or if there are ambiguities.
    const filterParameters = new SchulconnexOrganizationQueryParameters(
      undefined,
      schoolId,
      undefined,
      undefined,
    );
    const schoolOrganizations = await this.aggregator.getOrganizations(
      [idmId],
      clientId,
      filterParameters,
    );
    if (!schoolOrganizations.length) {
      this.logger.warn(
        `SchoolClearanceCreateMutation: No schools found for the given IDM and school ID`,
        {
          idmId: idmId,
          schoolId: schoolId,
        },
      );
      throw new Error(
        'No schools found for the given idmId and schoolId: ' + schoolId + ', IDM: ' + idmId,
      );
    }
    if (schoolOrganizations.length > 1) {
      throw new Error('Multiple schools found for the given idmId and schoolId');
    }

    const schoolOrgId = schoolOrganizations[0].id;

    const activeSchoolIds = await this.offerValidationService.validateSchoolsAreActiveForOffer(
      [schoolId],
      offerId,
    );
    if (!activeSchoolIds.includes(schoolId)) {
      throw new ForbiddenException();
    }

    const clearanceEntry = new SchoolClearance();
    clearanceEntry.offerId = offerId;
    clearanceEntry.idmId = idmId;
    clearanceEntry.schoolId = schoolId;
    clearanceEntry.schoolOrgId = schoolOrgId;

    return new SchoolClearanceResponseDto(await this.schoolClearanceService.save(clearanceEntry));
  }
}
