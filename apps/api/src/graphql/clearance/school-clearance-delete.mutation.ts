import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { SchoolClearanceDeleteResponseDto } from '../../clearance/dto/school-clearance-delete-response.dto';
import { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { SchoolClearanceService } from '../../clearance/school-clearance.service';

@Resolver(() => SchoolClearance)
export class SchoolClearanceDeleteMutation {
  constructor(private readonly schoolClearanceService: SchoolClearanceService) {}

  @Mutation(() => SchoolClearanceDeleteResponseDto)
  async deleteSchoolClearance(
    @Args('id', { type: () => String }) id: string,
  ): Promise<SchoolClearanceDeleteResponseDto> {
    // @todo: Validate that the clearance entry is actually available to the current user!!!

    await this.schoolClearanceService.delete(id);
    return new SchoolClearanceDeleteResponseDto(true);
  }
}
