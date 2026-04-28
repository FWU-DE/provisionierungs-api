import { Injectable } from '@nestjs/common';

import { Logger } from '../../common/logger';
import { Aggregator } from '../aggregator/aggregator';

@Injectable()
export class ValidationService {
  constructor(
    private readonly aggregator: Aggregator,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ValidationService.name);
  }

  // Verify that the group is still part of the school.
  // This prevents passing group information to offers that are no longer part of a school but still have clearance entries.
  // For the unlikely but theoretically possible case of a group being moved from one school to another, for example.
  async validateGroupsForSchools(
    schoolIds: string[],
    groupIds: string[],
    idmIds: string[],
  ): Promise<string[]> {
    if (groupIds.length > 0 && schoolIds.length > 0) {
      const groupsForSchools = (
        await this.aggregator.getGroups(idmIds, undefined, schoolIds)
      ).flatMap((groups) => groups.groups);

      const activeGroupIds = groupsForSchools.map((group) => group.id);
      const removedGroupIds = groupIds.filter((id) => !activeGroupIds.includes(id));

      if (removedGroupIds.length > 0) {
        this.logger.debug(
          `ValidationService: Group ID discarded as it is no longer part of the schools.`,
          {
            removedGroupIds: removedGroupIds,
            schoolIds: schoolIds,
          },
        );
      }

      return Array.from(new Set(activeGroupIds));
    }

    return [];
  }
}
