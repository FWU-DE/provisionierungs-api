import { type SchulconnexPersonsResponse } from '../../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { type GroupClearance } from '../entity/group-clearance.entity';

export function applyClearancePersonsGroupFilter(
  identities: SchulconnexPersonsResponse[],
  groupClearanceEntries?: GroupClearance[],
): SchulconnexPersonsResponse[] {
  if (typeof groupClearanceEntries === 'undefined') {
    return [];
  }

  const clearedGroupIds = getClearedGroupIds(groupClearanceEntries);

  return identities.filter((identity) => {
    return (identity.personenkontexte ?? []).some((context) => {
      return (context.gruppen ?? []).some((groupSet) => {
        const groupId = groupSet.gruppe?.id;
        return groupId ? clearedGroupIds.has(groupId) : false;
      });
    });
  });
}

function getClearedGroupIds(groupClearanceEntries: GroupClearance[]): Set<string> {
  const groupIds = new Set<string>();

  for (const entry of groupClearanceEntries) {
    if (typeof entry.groupId !== 'undefined') {
      groupIds.add(entry.groupId);
    }
  }

  return groupIds;
}
