import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';

import { ClientId, NoAccessTokenAuthRequired } from '../auth';
import { Aggregator } from '../identity-provider/aggregator/aggregator';
import { SchulconnexPersonsResponse } from '../dto/schulconnex-persons-response.dto';
import { SchulconnexQueryParameters } from './parameters/schulconnex-query-parameters';
import { ClearanceService } from '../clearance/clearance.service';

@Controller('schulconnex/v1')
export class PersonenInfoController {
  constructor(
    private readonly aggregator: Aggregator,
    private readonly clearanceService: ClearanceService,
  ) {}

  @Get('personen-info')
  // @todo: enable auth again when introspection is fixed
  // @AllowResourceOwnerType(ResourceOwnerType.CLIENT)
  // @RequireScope(ScopeIdentifier.SCHULCONNEX_ACCESS)
  @NoAccessTokenAuthRequired()
  @ApiResponse({
    status: 200,
    description: 'Read all users',
    type: [SchulconnexPersonsResponse],
  })
  @ApiQuery({
    name: 'vollstaendig',
    description: 'Comma separated list of fields to show',
    type: 'string',
    required: false,
    style: 'form',
    isArray: true,
    enum: [
      'personen',
      'personenkontexte',
      'gruppen',
      'organisationen',
      'beziehungen',
    ],
    explode: false,
  })
  @ApiQuery({
    name: 'pid',
    description: 'Only show the user with this pid',
    type: 'string',
    required: false,
    example: '400f5163-336c-4882-8897-c66da1fba5cf',
  })
  @ApiQuery({
    name: 'personenkontext.id',
    description: 'Only show users from this context',
    type: 'string',
    required: false,
    example: '3ab7d69a-379b-4d20-b6ea-60820ab503c3',
  })
  @ApiQuery({
    name: 'gruppe.id',
    description: 'Only show users that are members of this group',
    type: 'string',
    required: false,
    example: '519f7c2c-3743-4e9a-977b-f864ad6e1234',
  })
  @ApiQuery({
    name: 'organisation.id',
    description: 'Only show users from this organization',
    type: 'string',
    required: false,
    example: '3ab7d69a-379b-4d20-b6ea-60820ab503c3',
  })
  @ApiBearerAuth()
  async getUsers(
    @Res({ passthrough: true }) res: Response,
    @ClientId() clientId: string,
    @Query('vollstaendig') // comma separated string
    completeRaw?: string,
    @Query('pid')
    pidFilter?: string,
    @Query('personenkontext.id')
    userContextIdFilter?: string,
    @Query('gruppe.id')
    groupIdFilter?: string,
    @Query('organisation.id')
    organizationIdFilter?: string,
  ): Promise<SchulconnexPersonsResponse[]> {
    const filterParameters = new SchulconnexQueryParameters(
      completeRaw,
      pidFilter,
      userContextIdFilter,
      groupIdFilter,
      organizationIdFilter,
    );

    const clearance = await this.clearanceService.findAllForApp(clientId);
    const idpIds = [...new Set(clearance.map((c) => c.idpId))];

    /*
     * Fetch data from IdP
     */
    const identities: SchulconnexPersonsResponse[] =
      await this.aggregator.getUsers(
        idpIds,
        clientId,
        filterParameters,
        clearance,
      );

    // Spec says we need to send an ETag header
    // However, we do not support caching yet, therefore, we just send a fake value
    res.header('ETag', `W/"${(Math.random() + 1).toString(36)}"`);

    return identities;
  }
}
