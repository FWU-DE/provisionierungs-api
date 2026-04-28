import { Inject } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';

import { SchoolClearanceResponseDto } from '../../clearance/dto/school-clearance-response.dto';
import { SchoolClearanceService } from '../../clearance/school-clearance.service';
import { AllowResourceOwnerType, ResourceOwnerType } from '../../common/auth';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { Logger } from '../../common/logger';
import { OfferValidationService } from '../../offers/service/offer-validation.service';

@Resolver()
export class SchoolClearanceAllQuery {
  constructor(
    private readonly schoolClearanceService: SchoolClearanceService,
    private readonly offerValidationService: OfferValidationService,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.logger.setContext(SchoolClearanceAllQuery.name);
  }

  @Query(() => [SchoolClearanceResponseDto])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allSchoolClearances(
    @UserCtx() userContext: UserContext,
    @Args('offerId', { type: () => Int, nullable: true }) offerId?: number,
    @Args('schoolId', { type: () => String, nullable: true }) schoolId?: string,
  ): Promise<SchoolClearanceResponseDto[]> {
    this.logger.debug('SchoolClearanceAllQuery: Fetching all school clearances.');
    let schoolIds = userContext.schulkennung;
    if (schoolId && schoolIds.includes(schoolId)) {
      schoolIds = [schoolId];
    }

    if (offerId) {
      schoolIds = await this.offerValidationService.validateSchoolsAreActiveForOffer(
        schoolIds,
        offerId,
      );
    }

    // NOTE: If no offerId was provided, the result of the following method might contain entries where the offer is no longer active for the school.
    //        This is not massively problematic, but something to keep in mind: Users might get confused if they see entries that make no sense.
    const response = await this.schoolClearanceService.findByIdmAndSchools(
      userContext.heimatorganisation,
      schoolIds,
      offerId,
    );

    this.logger.debug('SchoolClearanceAllQuery: Fetched school clearances.', {
      schoolClearanceCount: response.length,
    });

    return response.map((schoolClearance) => new SchoolClearanceResponseDto(schoolClearance));
  }
}
