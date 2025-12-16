import { Query, Resolver } from '@nestjs/graphql';

import { AllowResourceOwnerType, ResourceOwnerType } from '../../common/auth';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { ClearanceService } from '../clearance.service';
import { ClearanceResponse } from '../dto/clearance-response.dto';

@Resolver()
export class ClearanceAllQuery {
  constructor(private readonly service: ClearanceService) {}

  @Query(() => [ClearanceResponse])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allClearances(@UserCtx() userContext: UserContext): Promise<ClearanceResponse[]> {
    const response = await this.service.findByIdmAndSchools(
      userContext.heimatorganisation,
      userContext.schulkennung,
    );

    return response.map((clearance) => new ClearanceResponse(clearance));
  }
}
