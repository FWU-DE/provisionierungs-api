import { type SchulconnexPersonsResponseDto } from '../../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { type SchoolClearance } from '../entity/school-clearance.entity';

/**
 * Filters identities based on school clearance entries.
 * Only returns identities that have at least one person context with an organization
 * matching a school ID from the provided clearance entries.
 *
 * @param identities - Array of Schulconnex person responses to filter
 * @param schoolClearanceEntries - Optional array of school clearance entries containing allowed school IDs
 * @returns Filtered array of identities that match the school clearance criteria, or empty array if no clearance entries provided
 */
export function applyClearancePersonsSchoolFilter(
  identities: SchulconnexPersonsResponseDto[],
  schoolClearanceEntries?: SchoolClearance[],
): SchulconnexPersonsResponseDto[] {
  if (typeof schoolClearanceEntries === 'undefined') {
    return [];
  }

  const clearedSchoolOrgIds = getClearedSchoolOrgIds(schoolClearanceEntries);

  return identities
    .map((identity) => {
      // 1. Filter stammorganisation
      if (identity.person?.stammorganisation) {
        if (!clearedSchoolOrgIds.has(identity.person.stammorganisation.id)) {
          identity.person.stammorganisation = undefined;
        }
      }

      // 2. Filter personenkontexte
      if (identity.personenkontexte) {
        identity.personenkontexte = identity.personenkontexte
          .map((context) => {
            const organizationId = context.organisation?.id;
            const hasMatchingOrganization = organizationId
              ? clearedSchoolOrgIds.has(organizationId)
              : false;
            if (!hasMatchingOrganization) {
              return null;
            }

            // Filter gruppen
            if (context.gruppen) {
              context.gruppen = context.gruppen.filter((groupSet) => {
                const groupOrgId = groupSet.gruppe?.orgid;
                return groupOrgId ? clearedSchoolOrgIds.has(groupOrgId) : false;
              });
            }

            // Keep the context if the organization matches
            return context;
          })
          .filter((context): context is NonNullable<typeof context> => context !== null);
      }

      const hasMatchingRootOrg = !!identity.person?.stammorganisation;
      const hasMatchingContexts = (identity.personenkontexte?.length ?? 0) > 0;

      return hasMatchingRootOrg || hasMatchingContexts ? identity : null;
    })
    .filter((identity): identity is SchulconnexPersonsResponseDto => identity !== null);
}

/**
 * Extracts school organization IDs from school clearance entries into a Set for efficient lookup.
 *
 * @param schoolClearanceEntries - Array of school clearance entries
 * @returns Set containing all unique school organization IDs from the clearance entries
 */
function getClearedSchoolOrgIds(schoolClearanceEntries: SchoolClearance[]): Set<string> {
  const schoolOrgIds = new Set<string>();

  for (const entry of schoolClearanceEntries) {
    schoolOrgIds.add(entry.schoolOrgId);
  }

  return schoolOrgIds;
}
