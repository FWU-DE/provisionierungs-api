import { Injectable } from '@nestjs/common';

import { Aggregator } from '../aggregator/aggregator';

@Injectable()
export class ValidationService {
  constructor(private readonly aggregator: Aggregator) {}

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

      // @todo: Log when a group entry got removed!

      return Array.from(new Set(groupsForSchools.map((group) => group.id)));
    }

    return [];
  }
}
