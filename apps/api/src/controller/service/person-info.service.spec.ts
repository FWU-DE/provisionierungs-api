import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import type { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { GroupClearanceService } from '../../clearance/group-clearance.service';
import { SchoolClearanceService } from '../../clearance/school-clearance.service';
import { Logger } from '../../common/logger';
import { Aggregator } from '../../identity-management/aggregator/aggregator';
import type { SchulconnexPersonsResponseDto } from '../../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { OffersFetcher } from '../../offers/fetcher/offers.fetcher';
import { OfferContext } from '../../offers/model/offer-context';
import type { OfferItem } from '../../offers/model/response/offer-item.model';
import { SchulconnexPersonsQueryParameters } from '../parameters/schulconnex-persons-query-parameters';
import { ClearanceValidationService } from './clearance-validation.service';
import { PersonInfoService } from './person-info.service';

describe('PersonInfoService', () => {
  let service: PersonInfoService;
  let aggregator: jest.Mocked<Aggregator>;
  let groupClearanceService: jest.Mocked<GroupClearanceService>;
  let schoolClearanceService: jest.Mocked<SchoolClearanceService>;
  let offersFetcher: jest.Mocked<OffersFetcher>;
  let clearanceValidationService: jest.Mocked<ClearanceValidationService>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonInfoService,
        {
          provide: Aggregator,
          useValue: {
            getPersons: jest.fn(),
          },
        },
        {
          provide: GroupClearanceService,
          useValue: {
            findAllForOffer: jest.fn(),
          },
        },
        {
          provide: SchoolClearanceService,
          useValue: {
            findAllForOffer: jest.fn(),
          },
        },
        {
          provide: OffersFetcher,
          useValue: {
            fetchOfferForClientId: jest.fn(),
          },
        },
        {
          provide: ClearanceValidationService,
          useValue: {
            validateClearance: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            setContext: jest.fn(),
            error: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PersonInfoService>(PersonInfoService);
    aggregator = module.get(Aggregator);
    groupClearanceService = module.get(GroupClearanceService);
    schoolClearanceService = module.get(SchoolClearanceService);
    offersFetcher = module.get(OffersFetcher);
    clearanceValidationService = module.get(ClearanceValidationService);
    logger = module.get(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchPersons', () => {
    const clientId = 'test-client';
    const filterParameters = new SchulconnexPersonsQueryParameters();
    const offerId = 1234;

    it('should return empty list if no offer is found for client', async () => {
      offersFetcher.fetchOfferForClientId.mockResolvedValue(null);

      const result = await service.fetchPersons(clientId, filterParameters);

      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(clientId));
    });

    it('should return empty list if offer has no offerId', async () => {
      offersFetcher.fetchOfferForClientId.mockResolvedValue({} as OfferItem);

      const result = await service.fetchPersons(clientId, filterParameters);

      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(clientId));
    });

    it('should return empty list if no clearances are found after validation', async () => {
      offersFetcher.fetchOfferForClientId.mockResolvedValue({ offerId } as OfferItem);
      groupClearanceService.findAllForOffer.mockResolvedValue([]);
      schoolClearanceService.findAllForOffer.mockResolvedValue([]);
      clearanceValidationService.validateClearance.mockResolvedValue({
        groupClearances: [],
        schoolClearances: [],
      });

      const result = await service.fetchPersons(clientId, filterParameters);

      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.verbose).toHaveBeenCalledWith(expect.stringContaining(offerId.toString()));
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(aggregator.getPersons).not.toHaveBeenCalled();
    });

    it('should call aggregator with correct parameters when clearances exist', async () => {
      const groupClearances = [
        { idmId: 'idm-1', schoolId: 's1', groupId: 'g1' },
      ] as GroupClearance[];
      const schoolClearances = [{ idmId: 'idm-2', schoolId: 's1' }] as SchoolClearance[];
      const persons = [{ pid: 'p1' }];

      offersFetcher.fetchOfferForClientId.mockResolvedValue({ offerId } as OfferItem);
      groupClearanceService.findAllForOffer.mockResolvedValue(groupClearances);
      schoolClearanceService.findAllForOffer.mockResolvedValue(schoolClearances);
      clearanceValidationService.validateClearance.mockResolvedValue({
        groupClearances,
        schoolClearances,
      });
      aggregator.getPersons.mockResolvedValue(persons as SchulconnexPersonsResponseDto[]);

      const result = await service.fetchPersons(clientId, filterParameters);

      expect(result).toEqual(persons);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(aggregator.getPersons).toHaveBeenCalledWith(
        expect.arrayContaining(['idm-1', 'idm-2']),
        new OfferContext(offerId, clientId),
        filterParameters,
        groupClearances,
        schoolClearances,
      );
    });

    it('should deduplicate idmIds from group and school clearances', async () => {
      const groupClearances = [{ idmId: 'idm-1' }] as GroupClearance[];
      const schoolClearances = [{ idmId: 'idm-1' }, { idmId: 'idm-2' }] as SchoolClearance[];

      offersFetcher.fetchOfferForClientId.mockResolvedValue({ offerId } as OfferItem);
      groupClearanceService.findAllForOffer.mockResolvedValue(groupClearances);
      schoolClearanceService.findAllForOffer.mockResolvedValue(schoolClearances);
      clearanceValidationService.validateClearance.mockResolvedValue({
        groupClearances,
        schoolClearances,
      });
      aggregator.getPersons.mockResolvedValue([]);

      await service.fetchPersons(clientId, filterParameters);

      const callArgs = aggregator.getPersons.mock.calls[0];
      const idmIds = callArgs[0];
      expect(idmIds).toHaveLength(2);
      expect(idmIds).toContain('idm-1');
      expect(idmIds).toContain('idm-2');
    });

    it('should use validated clearances from clearanceValidationService', async () => {
      const initialGroupClearances = [{ idmId: 'idm-1' }] as GroupClearance[];
      const validatedGroupClearances = [{ idmId: 'idm-2' }] as GroupClearance[];

      offersFetcher.fetchOfferForClientId.mockResolvedValue({ offerId } as OfferItem);
      groupClearanceService.findAllForOffer.mockResolvedValue(initialGroupClearances);
      schoolClearanceService.findAllForOffer.mockResolvedValue([]);
      clearanceValidationService.validateClearance.mockResolvedValue({
        groupClearances: validatedGroupClearances,
        schoolClearances: [],
      });
      aggregator.getPersons.mockResolvedValue([]);

      await service.fetchPersons(clientId, filterParameters);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(aggregator.getPersons).toHaveBeenCalledWith(
        ['idm-2'],
        expect.any(OfferContext),
        filterParameters,
        validatedGroupClearances,
        [],
      );
    });
  });
});
