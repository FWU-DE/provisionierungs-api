import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { SchoolClearanceDeleteResponseDto } from '../../clearance/dto/school-clearance-delete-response.dto';
import { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { SchoolClearanceService } from '../../clearance/school-clearance.service';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { Logger } from '../../common/logger';
import { ClearancePolicyService } from '../clearance-policy.service';

@Resolver(() => SchoolClearance)
export class SchoolClearanceDeleteMutation {
  constructor(
    private readonly schoolClearanceService: SchoolClearanceService,
    private readonly clearancePolicyService: ClearancePolicyService,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.logger.setContext(SchoolClearanceDeleteMutation.name);
  }

  @Mutation(() => SchoolClearanceDeleteResponseDto)
  async deleteSchoolClearance(
    @UserCtx() userContext: UserContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<SchoolClearanceDeleteResponseDto> {
    this.logger.log(
      `SchoolClearanceDeleteMutation: Deleting school clearance entry with ID: ${id}`,
    );
    const clearanceEntry = await this.schoolClearanceService.findOne({ where: { id } });
    if (!clearanceEntry) {
      return new SchoolClearanceDeleteResponseDto(true);
    }

    this.clearancePolicyService.verifyByUser(
      userContext,
      clearanceEntry.idmId,
      clearanceEntry.schoolId,
    );

    await this.schoolClearanceService.delete(id);
    return new SchoolClearanceDeleteResponseDto(true);
  }
}
