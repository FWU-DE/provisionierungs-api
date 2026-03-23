import { type SchulconnexPersonsResponseDto } from '../../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { type GroupClearance } from '../entity/group-clearance.entity';

/**
 * Filters identities based on group clearance entries.
 * Returns only identities that have at least one person context with a group matching the cleared group IDs.
 *
 * @todo: Do group information have to be filtered out if there is no group clearance given for the particular group?
 *
 * @param identities - Array of Schulconnex person responses to filter
 * @param groupClearanceEntries - Optional array of group clearance entries containing allowed group IDs
 * @returns Filtered array of identities matching the cleared groups, or empty array if no clearance entries provided
 */
export function applyClearancePersonsGroupFilter(
  identities: SchulconnexPersonsResponseDto[],
  groupClearanceEntries?: GroupClearance[],
): SchulconnexPersonsResponseDto[] {
  if (typeof groupClearanceEntries === 'undefined') {
    return [];
  }

  const clearedGroupKeys = getClearedGroupKeys(groupClearanceEntries);

  return identities.filter((identity) => {
    return (identity.personenkontexte ?? []).some((context) => {
      const schoolId = context.organisation?.kennung;
      if (!schoolId) {
        return false;
      }

      return (context.gruppen ?? []).some((groupSet) => {
        const groupId = groupSet.gruppe?.id;
        return groupId ? clearedGroupKeys.has(`${schoolId}:${groupId}`) : false;
      });
    });
  });
}

/**
 * Extracts and returns a set of cleared group keys from group clearance entries.
 * A group key is a combination of schoolId and groupId.
 * Entries without a defined groupId or schoolId are ignored.
 *
 * @param groupClearanceEntries - Array of group clearance entries
 * @returns Set of cleared group keys in the format "schoolId:groupId"
 */
function getClearedGroupKeys(groupClearanceEntries: GroupClearance[]): Set<string> {
  const groupKeys = new Set<string>();

  for (const entry of groupClearanceEntries) {
    groupKeys.add(`${entry.schoolId}:${entry.groupId}`);
  }

  return groupKeys;
}
