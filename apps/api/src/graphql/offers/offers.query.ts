import { Args, Int, Query, Resolver } from '@nestjs/graphql';

import { AllowResourceOwnerType, ResourceOwnerType } from '../../common/auth';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { ensureDataUrl } from '../../common/helper/base64-guesser';
import { OffersDto } from '../../offers/dto/offers.dto';
import { OffersService } from '../../offers/offers.service';

@Resolver()
export class OffersQuery {
  constructor(private readonly offerService: OffersService) {}

  @Query(() => [OffersDto])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allOffers(
    @UserCtx() userContext: UserContext,
    @Args('schoolId', { type: () => String, nullable: true }) schoolId?: string,
  ): Promise<OffersDto[]> {
    let schoolIds = userContext.schulkennung;
    if (schoolId && userContext.schulkennung.includes(schoolId)) {
      schoolIds = [schoolId];
    }

    const offers = await this.offerService.getOffers(schoolIds);

    return offers.map((offer) => {
      offer.offerLogo = ensureDataUrl(offer.offerLogo);
      return offer;
    });
  }

  @Query(() => OffersDto, { nullable: true })
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async offer(
    @UserCtx() userContext: UserContext,
    @Args('id', { type: () => Int }) id: number,
    @Args('schoolId', { type: () => String, nullable: true }) schoolId?: string,
  ): Promise<OffersDto | null> {
    let schoolIds = userContext.schulkennung;
    if (schoolId && userContext.schulkennung.includes(schoolId)) {
      schoolIds = [schoolId];
    }

    const offer = await this.offerService.getOfferById(schoolIds, id);

    if (offer) {
      offer.offerLogo = ensureDataUrl(offer.offerLogo);
    }

    return offer;
  }
}
