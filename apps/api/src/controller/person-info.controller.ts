import { Controller, Get, Inject, NotFoundException, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';

import { ClearanceService } from '../clearance/clearance.service';
import {
  AllowResourceOwnerType,
  ClientId,
  RequireScope,
  ResourceOwnerType,
  Sub,
} from '../common/auth';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';
import { Logger } from '../common/logger';
import { Aggregator } from '../identity-management/aggregator/aggregator';
import { SchulconnexPersonsResponse } from '../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { OffersFetcher } from '../offers/fetcher/offers.fetcher';
import { OfferContext } from '../offers/model/offer-context';
import { SchulconnexPersonsQueryParameters } from './parameters/schulconnex-persons-query-parameters';

@Controller('schulconnex/v1')
export class PersonInfoController {
  constructor(
    private readonly aggregator: Aggregator,
    private readonly clearanceService: ClearanceService,
    @Inject(OffersFetcher) private offersFetcher: OffersFetcher,
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
    type: SchulconnexPersonsResponse,
  })
  @ApiBearerAuth()
  async getPerson(
    @Res({ passthrough: true }) res: Response,
    @ClientId() clientId: string,
    @Sub() userId: string,
  ): Promise<SchulconnexPersonsResponse> {
    const offerForClientId = await this.offersFetcher.fetchOfferForClientId(clientId);
    if (!offerForClientId?.offerId) {
      this.logger.error(
        `No offer found for clientId "${clientId}". Cannot fetch users without a valid offer.`,
      );
      throw new NotFoundException();
    }

    const clearance = await this.clearanceService.findAllForOffer(offerForClientId.offerId);
    if (clearance.length === 0) {
      this.logger.verbose(
        `No clearance found for offer "${String(offerForClientId.offerId)}" and client "${clientId}"`,
      );
      throw new NotFoundException();
    }

    const idmIds = [...new Set(clearance.map((c) => c.idmId))];

    /*
     * Fetch data from IDM
     */
    const identities: SchulconnexPersonsResponse[] = await this.aggregator.getPersons(
      idmIds,
      new OfferContext(offerForClientId.offerId, clientId),
      new SchulconnexPersonsQueryParameters(undefined, userId),
      clearance,
    );

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
