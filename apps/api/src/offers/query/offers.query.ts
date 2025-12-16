import { Query, Resolver } from '@nestjs/graphql';

import { AllowResourceOwnerType, ResourceOwnerType } from '../../common/auth';
import {
  type UserContext,
  UserCtx,
} from '../../common/auth/param-decorators/user-context.decorator';
import { OffersDto } from '../dto/offers.dto';
import { OffersService } from '../offers.service';

@Resolver()
export class OffersQuery {
  constructor(private readonly offerService: OffersService) {}

  @Query(() => [OffersDto])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allOffers(@UserCtx() userContext: UserContext): Promise<OffersDto[]> {
    return this.offerService.getOffers(userContext.schulkennung);
  }
}
