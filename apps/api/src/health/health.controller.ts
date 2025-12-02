import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';

import { DatabaseReadonlyHealthIndicator } from './database-readonly.health';
import { NoAccessTokenAuthRequired } from '../common/auth';

@Controller('health')
@ApiExcludeController()
@NoAccessTokenAuthRequired()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseReadonlyHealthIndicator: DatabaseReadonlyHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.databaseReadonlyHealthIndicator.isHealthy(),
    ]);
  }
}
