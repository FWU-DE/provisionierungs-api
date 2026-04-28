import { ForbiddenException, Inject, Injectable } from '@nestjs/common';

import { type UserContext } from '../common/auth/param-decorators/user-context.decorator';
import { Logger } from '../common/logger';
import { OffersService } from '../offers/offers.service';

@Injectable()
export class ClearancePolicyService {
  constructor(
    private readonly offerService: OffersService,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.logger.setContext(ClearancePolicyService.name);
  }

  // Verify that the user has access to the IDM and the school,
  // and that the offer exists for the given school.
  async verifyByUserAndOffer(
    userContext: UserContext,
    offerId: number,
    idmId: string,
    schoolId: string,
  ): Promise<void> {
    const offers = await this.offerService.getOffers(userContext.schulkennung);

    if (
      userContext.heimatorganisation !== idmId ||
      !userContext.schulkennung.includes(schoolId) ||
      !offers.some((offer) => offer.offerId === offerId)
    ) {
      this.logger.warn(`ClearancePolicyService: Access denied for user.`, {
        idmId: idmId,
        schoolId: schoolId,
        offerId: offerId,
      });
      throw new ForbiddenException();
    }
  }

  // Verify that the user has access to the IDM and the school.
  verifyByUser(userContext: UserContext, idmId: string, schoolId: string): void {
    if (userContext.heimatorganisation !== idmId || !userContext.schulkennung.includes(schoolId)) {
      throw new ForbiddenException();
    }
  }
}
