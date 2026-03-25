import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LogModule } from '../common/logger';
import offersConfig from './config/offers.config';
import { OffersFetcher } from './fetcher/offers.fetcher';
import { OffersService } from './offers.service';

@Module({
  imports: [LogModule, ConfigModule.forFeature(offersConfig)],
  providers: [OffersFetcher, OffersService],
  exports: [OffersFetcher, OffersService],
})
export class OffersModule {}
