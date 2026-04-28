import { Controller, Get, NotFoundException, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';

import {
  AllowResourceOwnerType,
  ClientId,
  RequireScope,
  ResourceOwnerType,
  Sub,
} from '../common/auth';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';
import { Logger } from '../common/logger';
import { SchulconnexPersonsResponseDto } from '../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { SchulconnexPersonsQueryParameters } from './parameters/schulconnex-persons-query-parameters';
import { PersonInfoService } from './service/person-info.service';

@Controller('schulconnex/v1')
export class PersonInfoController {
  constructor(
    private readonly personInfoService: PersonInfoService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PersonInfoController.name);
  }

  @Get('person-info')
  @AllowResourceOwnerType(ResourceOwnerType.USER)
  @RequireScope(ScopeIdentifier.SCHULCONNEX_ACCESS)
  @ApiResponse({
    status: 200,
    description: 'Read currently authenticated user',
    type: SchulconnexPersonsResponseDto,
  })
  @ApiBearerAuth()
  async getPerson(
    @Res({ passthrough: true }) res: Response,
    @ClientId() clientId: string,
    @Sub() userId: string,
  ): Promise<SchulconnexPersonsResponseDto> {
    const filterParameters = new SchulconnexPersonsQueryParameters(undefined, userId);

    const identities = await this.personInfoService.fetchPersons(clientId, filterParameters);

    if (identities.length === 0) {
      this.logger.warn(
        `No identity found for userId "${userId}" in IDM for clientId "${clientId}".`,
      );
      throw new NotFoundException();
    }

    // Spec says we need to send an ETag header
    // However, we do not support caching yet, therefore, we just send a fake value
    res.header('ETag', `W/"${(Math.random() + 1).toString(36)}"`);

    return identities[0];
  }
}
