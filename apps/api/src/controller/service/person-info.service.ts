import { Inject, Injectable } from '@nestjs/common';

import { GroupClearanceService } from '../../clearance/group-clearance.service';
import { SchoolClearanceService } from '../../clearance/school-clearance.service';
import { Logger } from '../../common/logger';
import { Aggregator } from '../../identity-management/aggregator/aggregator';
import { SchulconnexPersonsResponseDto } from '../../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { OffersFetcher } from '../../offers/fetcher/offers.fetcher';
import { OfferContext } from '../../offers/model/offer-context';
import { SchulconnexPersonsQueryParameters } from '../parameters/schulconnex-persons-query-parameters';
import { ClearanceValidationService } from './clearance-validation.service';

@Injectable()
export class PersonInfoService {
  constructor(
    private readonly aggregator: Aggregator,
    private readonly groupClearanceService: GroupClearanceService,
    private readonly schoolClearanceService: SchoolClearanceService,
    @Inject(OffersFetcher) private offersFetcher: OffersFetcher,
    private readonly clearanceValidationService: ClearanceValidationService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PersonInfoService.name);
  }

  async fetchPersons(
    clientId: string,
    filterParameters: SchulconnexPersonsQueryParameters,
  ): Promise<SchulconnexPersonsResponseDto[]> {
    this.logger.debug(`PersonInfoService: Starting person info fetch for client ID: ${clientId}`);
    const offerForClientId = await this.offersFetcher.fetchOfferForClientId(clientId);
    if (!offerForClientId?.offerId) {
      this.logger.error(
        `No offer found for clientId "${clientId}". Cannot fetch users without a valid offer.`,
      );
      return [];
    }

    let groupClearances = await this.groupClearanceService.findAllForOffer(
      offerForClientId.offerId,
    );
    let schoolClearances = await this.schoolClearanceService.findAllForOffer(
      offerForClientId.offerId,
    );

    // Validate clearance entries
    const validatedClearance = await this.clearanceValidationService.validateClearance(
      offerForClientId.offerId,
      groupClearances,
      schoolClearances,
    );
    groupClearances = validatedClearance.groupClearances;
    schoolClearances = validatedClearance.schoolClearances;

    if (groupClearances.length === 0 && schoolClearances.length === 0) {
      this.logger.verbose(
        `No clearance found for offer "${String(offerForClientId.offerId)}" and client "${clientId}"`,
      );
      return [];
    }

    const idmIds = [
      ...new Set([...groupClearances.map((c) => c.idmId), ...schoolClearances.map((c) => c.idmId)]),
    ];

    /*
     * Fetch data from IDM
     */
    this.logger.log(
      `PersonInfoService: Triggering aggregator to fetch persons for IDMs: ${idmIds.join(', ')}`,
    );
    return this.aggregator.getPersons(
      idmIds,
      new OfferContext(offerForClientId.offerId, clientId),
      filterParameters,
      groupClearances,
      schoolClearances,
    );
  }
}
