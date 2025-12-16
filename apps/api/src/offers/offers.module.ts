import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LogModule } from '../common/logger';
import offersConfig from './config/offers.config';
import { OffersFetcher } from './fetcher/offers.fetcher';
import { OffersService } from './offers.service';
import { OffersQuery } from './query/offers.query';

@Module({
  imports: [LogModule, ConfigModule.forFeature(offersConfig)],
  providers: [OffersQuery, OffersFetcher, OffersService],
  exports: [OffersFetcher],
})
export class OffersModule {}
