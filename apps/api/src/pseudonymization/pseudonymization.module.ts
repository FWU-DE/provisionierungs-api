import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LogModule } from '../common/logger';
import pseudonymizationConfig from '../pseudonymization/config/pseudonymization.config';
import { Hasher } from './hasher';
import { Pseudonymization } from './pseudonymization';

@Module({
  imports: [LogModule, ConfigModule.forFeature(pseudonymizationConfig)],
  providers: [Pseudonymization, Hasher],
  exports: [Pseudonymization],
})
export class PseudonymizationModule {}
