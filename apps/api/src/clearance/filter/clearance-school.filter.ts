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

  const clearedSchoolIds = getClearedSchoolIds(schoolClearanceEntries);

  return identities.filter((identity) => {
    return (identity.personenkontexte ?? []).some((context) => {
      const organizationId = context.organisation?.kennung;
      return organizationId ? clearedSchoolIds.has(organizationId) : false;
    });
  });
}

/**
 * Extracts school IDs from school clearance entries into a Set for efficient lookup.
 *
 * @param schoolClearanceEntries - Array of school clearance entries
 * @returns Set containing all unique school IDs from the clearance entries
 */
function getClearedSchoolIds(schoolClearanceEntries: SchoolClearance[]): Set<string> {
  const schoolIds = new Set<string>();

  for (const entry of schoolClearanceEntries) {
    schoolIds.add(entry.schoolId);
  }

  return schoolIds;
}
