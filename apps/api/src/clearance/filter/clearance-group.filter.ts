import { type SchulconnexPersonsResponseDto } from '../../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { type GroupClearance } from '../entity/group-clearance.entity';

/**
 * Filters identities based on group clearance entries.
 * Returns only identities that have at least one person context with a group matching the cleared group IDs.
 *
 * @param identities - Array of Schulconnex person responses to filter
 * @param groupClearances - Optional array of group clearance entries containing allowed group IDs
 * @returns Filtered array of identities matching the cleared groups, or empty array if no clearance entries provided
 */
export function applyClearancePersonsGroupFilter(
  identities: SchulconnexPersonsResponseDto[],
  groupClearances?: GroupClearance[],
): SchulconnexPersonsResponseDto[] {
  if (!Array.isArray(groupClearances) || groupClearances.length === 0) {
    return [];
  }

  const clearedGroupKeys = getClearedGroupKeys(groupClearances);

  return identities
    .map((identity) => {
      const filteredContexts = (identity.personenkontexte ?? [])
        .map((context) => {
          const schoolId = context.organisation?.kennung;
          if (!schoolId) {
            context.gruppen = [];
            return context;
          }

          context.gruppen = (context.gruppen ?? []).filter((groupSet) => {
            const groupId = groupSet.gruppe?.id;

            return groupId ? clearedGroupKeys.has(`${schoolId}:${groupId}`) : false;
          });
          return context;
        })
        .filter((context) => (context.gruppen ?? []).length > 0);

      identity.personenkontexte = filteredContexts.length > 0 ? filteredContexts : undefined;
      return identity;
    })
    .filter((identity) => (identity.personenkontexte ?? []).length > 0);
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
