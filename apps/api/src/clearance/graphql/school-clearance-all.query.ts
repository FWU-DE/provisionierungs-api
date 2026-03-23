import { Args, Int, Query, Resolver } from '@nestjs/graphql';

import { AllowResourceOwnerType, ResourceOwnerType } from '../../common/auth';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { SchoolClearanceResponseDto } from '../dto/school-clearance-response.dto';
import { SchoolClearanceService } from '../school-clearance.service';

@Resolver()
export class SchoolClearanceAllQuery {
  constructor(private readonly schoolClearanceService: SchoolClearanceService) {}

  @Query(() => [SchoolClearanceResponseDto])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allSchoolClearances(
    @UserCtx() userContext: UserContext,
    @Args('offerId', { type: () => Int, nullable: true }) offerId?: number,
    @Args('schoolId', { type: () => String, nullable: true }) schoolId?: string,
  ): Promise<SchoolClearanceResponseDto[]> {
    let schoolIds = userContext.schulkennung;
    if (schoolId && userContext.schulkennung.includes(schoolId)) {
      schoolIds = [schoolId];
    }

    const response = await this.schoolClearanceService.findByIdmAndSchools(
      userContext.heimatorganisation,
      schoolIds,
      offerId,
    );

    return response.map((schoolClearance) => new SchoolClearanceResponseDto(schoolClearance));
  }
}
