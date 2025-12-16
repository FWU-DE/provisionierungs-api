import { Query, Resolver } from '@nestjs/graphql';
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
  async allGroups(@UserCtx() userContext: UserContext): Promise<Group[]> {
    // @todo: Test again after proper test data is available.

    return (
      await this.aggregator.getGroups(
        [userContext.heimatorganisation],
        userContext.schulkennung,
      )
    )
      .flatMap((groups) => groups.groups)
      .map((group) => new Group(group.id, group.bezeichnung));
  }
}
