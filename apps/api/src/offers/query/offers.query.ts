import { Query, Resolver } from '@nestjs/graphql';
import { AllowResourceOwnerType, ResourceOwnerType } from '../../common/auth';
import {
  UserCtx,
  type UserContext,
} from '../../common/auth/param-decorators/user-context.decorator';
import { OffersService } from '../offers.service';
import { OffersDto } from '../dto/offers.dto';

@Resolver()
export class OffersQuery {
  constructor(private readonly offerService: OffersService) {}

  @Query(() => [OffersDto])
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  async allOffers(@UserCtx() userContext: UserContext): Promise<OffersDto[]> {
    return this.offerService.getOffers(userContext.schulkennung);
  }
}
