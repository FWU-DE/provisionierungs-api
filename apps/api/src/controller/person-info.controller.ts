import { Controller, Get, Inject, NotFoundException, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';

import { GroupClearanceService } from '../clearance/group-clearance.service';
import { SchoolClearanceService } from '../clearance/school-clearance.service';
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
import { SchulconnexPersonsResponseDto } from '../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { OffersFetcher } from '../offers/fetcher/offers.fetcher';
import { OfferContext } from '../offers/model/offer-context';
import { SchulconnexPersonsQueryParameters } from './parameters/schulconnex-persons-query-parameters';

@Controller('schulconnex/v1')
export class PersonInfoController {
  constructor(
    private readonly aggregator: Aggregator,
    private readonly groupClearanceService: GroupClearanceService,
    private readonly schoolClearanceService: SchoolClearanceService,
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
    type: SchulconnexPersonsResponseDto,
  })
  @ApiBearerAuth()
  async getPerson(
    @Res({ passthrough: true }) res: Response,
    @ClientId() clientId: string,
    @Sub() userId: string,
  ): Promise<SchulconnexPersonsResponseDto> {
    const offerForClientId = await this.offersFetcher.fetchOfferForClientId(clientId);
    if (!offerForClientId?.offerId) {
      this.logger.error(
        `No offer found for clientId "${clientId}". Cannot fetch users without a valid offer.`,
      );
      throw new NotFoundException();
    }

    const groupClearance = await this.groupClearanceService.findAllForOffer(
      offerForClientId.offerId,
    );
    const schoolClearance = await this.schoolClearanceService.findAllForOffer(
      offerForClientId.offerId,
    );

    if (groupClearance.length === 0 && schoolClearance.length === 0) {
      this.logger.verbose(
        `No clearance found for offer "${String(offerForClientId.offerId)}" and client "${clientId}"`,
      );
      throw new NotFoundException();
    }

    const idmIds = [
      ...new Set([...groupClearance.map((c) => c.idmId), ...schoolClearance.map((c) => c.idmId)]),
    ];

    /*
     * Fetch data from IDM
     */
    const identities: SchulconnexPersonsResponseDto[] = await this.aggregator.getPersons(
      idmIds,
      new OfferContext(offerForClientId.offerId, clientId),
      new SchulconnexPersonsQueryParameters(undefined, userId),
      groupClearance,
      schoolClearance,
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
