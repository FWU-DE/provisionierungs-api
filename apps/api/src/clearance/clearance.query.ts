import { Query, Resolver } from '@nestjs/graphql';
import { AllowResourceOwnerType, ResourceOwnerType } from '../auth';
import {
  UserCtx,
  type UserContext,
} from '../auth/param-decorators/user-context.decorator';
import { Clearance } from './clearance.entity';
import { ClearanceService } from './clearance.service';

@Resolver()
export class ClearanceQuery {
  constructor(private readonly service: ClearanceService) {}

  @Query(() => [Clearance])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allClearances(
    @UserCtx() userContext: UserContext,
  ): Promise<Clearance[]> {
    return await this.service.findByOrganisationId(
      userContext.heimatorganisation,
    );
  }
}
