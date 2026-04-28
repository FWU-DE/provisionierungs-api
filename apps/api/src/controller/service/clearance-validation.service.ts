import { Injectable } from '@nestjs/common';

import { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { OfferValidationService } from '../../offers/service/offer-validation.service';

/**
 * Service to validate clearance entries
 *
 * This is required to ensure that the clearance entries are still reflecting the current school data.
 */
@Injectable()
export class ClearanceValidationService {
  constructor(private readonly offerValidationService: OfferValidationService) {}

  async validateClearance(
    offerId: number,
    groupClearances: GroupClearance[],
    schoolClearances: SchoolClearance[],
  ) {
    const schoolIds = [
      ...new Set([
        ...groupClearances.map((c) => c.schoolId),
        ...schoolClearances.map((c) => c.schoolId),
      ]),
    ];

    const activeSchoolIds = await this.offerValidationService.validateSchoolsAreActiveForOffer(
      schoolIds,
      offerId,
    );

    groupClearances = groupClearances.filter((c) => activeSchoolIds.includes(c.schoolId));
    schoolClearances = schoolClearances.filter((c) => activeSchoolIds.includes(c.schoolId));

    return {
      groupClearances,
      schoolClearances,
    };
  }
}
