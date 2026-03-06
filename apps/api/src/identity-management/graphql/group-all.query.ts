import { Args, Query, Resolver } from '@nestjs/graphql';

import { AllowResourceOwnerType, ResourceOwnerType } from '../../common/auth';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { Aggregator } from '../aggregator/aggregator';
import { Group } from '../dto/graphql/group.dto';

@Resolver()
export class GroupAllQuery {
  constructor(private readonly aggregator: Aggregator) {}

  @Query(() => [Group])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allGroups(
    @UserCtx() userContext: UserContext,
    @Args('schoolId', { type: () => String, nullable: true }) schoolId?: string,
  ): Promise<Group[]> {
    // @todo: Test again after proper test data is available.

    let schoolIds = userContext.schulkennung;
    if (schoolId && userContext.schulkennung.includes(schoolId)) {
      schoolIds = [schoolId];
    }

    return (await this.aggregator.getGroups([userContext.heimatorganisation], schoolIds))
      .flatMap((groups) => groups.groups)
      .map((group) => new Group(group.id, group.bezeichnung));
  }
}
