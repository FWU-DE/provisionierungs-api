import { Query, Resolver } from '@nestjs/graphql';
import { AllowResourceOwnerType, ResourceOwnerType } from '../../common/auth';
import {
  UserCtx,
  type UserContext,
} from '../../common/auth/param-decorators/user-context.decorator';
import { Clearance } from '../entity/clearance.entity';
import { ClearanceService } from '../clearance.service';

@Resolver()
export class ClearanceAllQuery {
  constructor(private readonly service: ClearanceService) {}

  @Query(() => [Clearance])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allClearances(
    @UserCtx() userContext: UserContext,
  ): Promise<Clearance[]> {
    return await this.service.findByIdmAndSchools(
      userContext.heimatorganisation,
      userContext.schulkennung,
    );
  }
}
