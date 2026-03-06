import { type SchulconnexPersonsResponse } from '../../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { type SchoolClearance } from '../entity/school-clearance.entity';

export function applyClearancePersonsSchoolFilter(
  identities: SchulconnexPersonsResponse[],
  schoolClearanceEntries?: SchoolClearance[],
): SchulconnexPersonsResponse[] {
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

function getClearedSchoolIds(schoolClearanceEntries: SchoolClearance[]): Set<string> {
  const schoolIds = new Set<string>();

  for (const entry of schoolClearanceEntries) {
    schoolIds.add(entry.schoolId);
  }

  return schoolIds;
}
