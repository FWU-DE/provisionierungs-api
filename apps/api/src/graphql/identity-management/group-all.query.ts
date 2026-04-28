import { Inject } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { AllowResourceOwnerType, ClientId, ResourceOwnerType } from '../../common/auth';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { Logger } from '../../common/logger';
import { Aggregator } from '../../identity-management/aggregator/aggregator';
import { GroupDto } from '../../identity-management/dto/graphql/group.dto';

@Resolver()
export class GroupAllQuery {
  constructor(
    private readonly aggregator: Aggregator,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.logger.setContext(GroupAllQuery.name);
  }

  @Query(() => [GroupDto])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allGroups(
    @ClientId() clientId: string,
    @UserCtx() userContext: UserContext,
    @Args('schoolId', { type: () => String, nullable: true }) schoolId?: string,
  ): Promise<GroupDto[]> {
    let schoolIds = userContext.schulkennung;

    // Verify that the user has permission to access the requested school.
    if (schoolId && userContext.schulkennung.includes(schoolId)) {
      schoolIds = [schoolId];
    }

    this.logger.debug(`GroupAllQuery: Fetching all groups for IDM and schools.`, {
      idmId: userContext.heimatorganisation,
      schoolIds: userContext.schulkennung,
    });

    return (await this.aggregator.getGroups([userContext.heimatorganisation], clientId, schoolIds))
      .flatMap((groups) => groups.groups)
      .map((group) => new GroupDto(group.id, group.bezeichnung));
  }
}
