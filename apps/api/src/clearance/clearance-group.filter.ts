import { type SchulconnexPersonsResponse } from '../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { type Clearance } from './entity/clearance.entity';

export function applyClearancePersonsGroupFilter(
  identities: SchulconnexPersonsResponse[],
  clearanceEntries?: Clearance[],
): SchulconnexPersonsResponse[] {
  if (typeof clearanceEntries === 'undefined') {
    return [];
  }

  const clearedGroupIds = getClearedGroupIds(clearanceEntries);

  return identities.filter((identity) => {
    return (identity.personenkontexte ?? []).some((context) => {
      return (context.gruppen ?? []).some((groupSet) => {
        const groupId = groupSet.gruppe?.id;
        return groupId ? clearedGroupIds.has(groupId) : false;
      });
    });
  });
}

function getClearedGroupIds(clearanceEntries: Clearance[]): Set<string> {
  const groupIds = new Set<string>();

  for (const entry of clearanceEntries) {
    if (typeof entry.groupId !== 'undefined') {
      groupIds.add(entry.groupId);
    }
  }

  return groupIds;
}
