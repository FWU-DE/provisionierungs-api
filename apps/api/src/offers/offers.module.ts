import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LogModule } from '../common/logger';
import offersConfig from './config/offers.config';
import { OffersFetcher } from './fetcher/offers.fetcher';
import { OffersService } from './offers.service';
import { OfferValidationService } from './service/offer-validation.service';

@Module({
  imports: [LogModule, ConfigModule.forFeature(offersConfig)],
  providers: [OffersFetcher, OffersService, OfferValidationService],
  exports: [OffersFetcher, OffersService, OfferValidationService],
})
export class OffersModule {}
