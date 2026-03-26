import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { SchoolClearanceResponseDto } from '../../clearance/dto/school-clearance-response.dto';
import { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { SchoolClearanceService } from '../../clearance/school-clearance.service';
import { ClientId } from '../../common/auth';
import { SchulconnexOrganizationQueryParameters } from '../../controller/parameters/schulconnex-organisations-query-parameters';
import { Aggregator } from '../../identity-management/aggregator/aggregator';

@Resolver(() => SchoolClearanceResponseDto)
export class SchoolClearanceCreateMutation {
  constructor(
    private readonly schoolClearanceService: SchoolClearanceService,
    private readonly aggregator: Aggregator,
  ) {}

  @Mutation(() => SchoolClearanceResponseDto)
  async createSchoolClearance(
    @ClientId() clientId: string,
    @Args('offerId', { type: () => Int }) offerId: number,
    @Args('idmId') idmId: string,
    @Args('schoolId') schoolId: string,
  ): Promise<SchoolClearanceResponseDto> {
    // @todo: Validate that the idmId, schoolId and offerId are actually available to the current user!!!

    const filterParameters = new SchulconnexOrganizationQueryParameters(
      undefined,
      schoolId,
      undefined,
      undefined,
    );

    const schoolOrgIds = await this.aggregator.getOrganizations(
      [idmId],
      clientId,
      filterParameters,
    );

    if (!schoolOrgIds.length) {
      throw new Error(
        'No schools found for the given idmId and schoolId: ' + schoolId + ', IDM: ' + idmId,
      );
    }
    if (schoolOrgIds.length > 1) {
      throw new Error('Multiple schools found for the given idmId and schoolId');
    }

    const schoolOrgId = schoolOrgIds[0].id;

    const clearanceEntry = new SchoolClearance();
    clearanceEntry.offerId = offerId;
    clearanceEntry.idmId = idmId;
    clearanceEntry.schoolId = schoolId;
    clearanceEntry.schoolOrgId = schoolOrgId;

    return new SchoolClearanceResponseDto(await this.schoolClearanceService.save(clearanceEntry));
  }
}
