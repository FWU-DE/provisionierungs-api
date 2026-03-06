import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { SchoolClearanceDeleteResponse } from '../dto/school-clearance-delete-response.dto';
import { SchoolClearance } from '../entity/school-clearance.entity';
import { SchoolClearanceService } from '../school-clearance.service';

@Resolver(() => SchoolClearance)
export class SchoolClearanceDeleteMutation {
  constructor(private readonly schoolClearanceService: SchoolClearanceService) {}

  @Mutation(() => SchoolClearanceDeleteResponse)
  async deleteSchoolClearance(
    @Args('id', { type: () => String }) id: string,
  ): Promise<SchoolClearanceDeleteResponse> {
    // @todo: Validate that the clearance entry is actually available to the current user!!!

    await this.schoolClearanceService.delete(id);
    return new SchoolClearanceDeleteResponse(true);
  }
}
