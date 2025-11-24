import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Clearance } from '../entity/clearance.entity';
import { ClearanceService } from '../clearance.service';
import { ClearanceDeleteResponse } from '../dto/clearance-delete-response.dto';

@Resolver(() => Clearance)
export class ClearanceDeleteMutation {
  constructor(private readonly clearanceService: ClearanceService) {}

  @Mutation(() => ClearanceDeleteResponse)
  async deleteClearance(
    @Args('id', { type: () => String }) id: string,
  ): Promise<ClearanceDeleteResponse> {
    // @todo: Validate that the clearance entry is actually available to the current user!!!

    await this.clearanceService.delete(id);
    return new ClearanceDeleteResponse(true);
  }
}
