import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { AllowResourceOwnerType, RequireScope, ResourceOwnerType } from '../common/auth';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';
import { Aggregator } from '../identity-management/aggregator/aggregator';

@Controller('verfuegbare-heimatorganisationen')
export class VerfuegbareHeimatorganisationenController {
  constructor(private readonly aggregator: Aggregator) {}

  @Get()
  @AllowResourceOwnerType([ResourceOwnerType.CLIENT])
  @RequireScope(ScopeIdentifier.SCHULCONNEX_ACCESS)
  @ApiResponse({
    status: 200,
    description: 'List the identifiers of all currently available home organizations',
    type: [String],
  })
  @ApiBearerAuth()
  getAvailableHomeOrganizations(): string[] {
    return this.aggregator.getAvailableAdapterIdentifiers();
  }
}
