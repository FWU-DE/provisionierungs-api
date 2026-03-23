import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { SchoolClearanceResponseDto } from '../dto/school-clearance-response.dto';
import { SchoolClearance } from '../entity/school-clearance.entity';
import { SchoolClearanceService } from '../school-clearance.service';

@Resolver(() => SchoolClearanceResponseDto)
export class SchoolClearanceCreateMutation {
  constructor(private readonly schoolClearanceService: SchoolClearanceService) {}

  @Mutation(() => SchoolClearanceResponseDto)
  async createSchoolClearance(
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('schoolId') schoolId: string,
    @Args('idmId') idmId: string,
  ): Promise<SchoolClearanceResponseDto> {
    // @todo: Validate that the idmId, schoolId, groupId and offerId are actually available to the current user!!!

    const clearanceEntry = new SchoolClearance();
    clearanceEntry.offerId = offerId;
    clearanceEntry.schoolId = schoolId;
    clearanceEntry.idmId = idmId;

    return new SchoolClearanceResponseDto(await this.schoolClearanceService.save(clearanceEntry));
  }
}
