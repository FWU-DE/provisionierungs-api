import { Injectable } from '@nestjs/common';

import { OffersService } from '../offers.service';

@Injectable()
export class OfferValidationService {
  constructor(private readonly offersService: OffersService) {}

  async validateSchoolsAreActiveForOffer(schoolIds: string[], offerId: number): Promise<string[]> {
    const activeSchoolIds: string[] = [];

    // Verify that the offer is still active for the schools.
    // Only keep schoolIds that have the offer activated for them.
    // This prevents passing school information to offers that are no longer active for a school but still have clearance entries.
    if (schoolIds.length > 0) {
      const activeOfferBySchoolId = await this.offersService.getOfferByIdGroupedBySchool(
        schoolIds,
        offerId,
      );

      for (const schoolId of schoolIds) {
        if (activeOfferBySchoolId.has(schoolId) && activeOfferBySchoolId.get(schoolId)) {
          activeSchoolIds.push(schoolId);
        } else {
          // @todo: Log when a clearance entry got removed!
        }
      }
    }

    return activeSchoolIds;
  }
}
