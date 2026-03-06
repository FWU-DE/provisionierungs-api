import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { SchoolClearanceResponse } from '../dto/school-clearance-response.dto';
import { SchoolClearance } from '../entity/school-clearance.entity';
import { SchoolClearanceService } from '../school-clearance.service';

@Resolver(() => SchoolClearanceResponse)
export class SchoolClearanceCreateMutation {
  constructor(private readonly schoolClearanceService: SchoolClearanceService) {}

  @Mutation(() => SchoolClearanceResponse)
  async createSchoolClearance(
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('schoolId') schoolId: string,
    @Args('idmId') idmId: string,
  ): Promise<SchoolClearanceResponse> {
    // @todo: Validate that the idmId, schoolId, groupId and offerId are actually available to the current user!!!

    const clearanceEntry = new SchoolClearance();
    clearanceEntry.offerId = offerId;
    clearanceEntry.schoolId = schoolId;
    clearanceEntry.idmId = idmId;

    return new SchoolClearanceResponse(await this.schoolClearanceService.save(clearanceEntry));
  }
}
