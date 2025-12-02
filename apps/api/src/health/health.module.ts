import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseReadonlyHealthIndicator } from './database-readonly.health';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  providers: [DatabaseReadonlyHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
