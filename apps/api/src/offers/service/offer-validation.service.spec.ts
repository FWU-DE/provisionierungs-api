import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { OffersDto } from '../dto/offers.dto';
import { OffersService } from '../offers.service';
import { OfferValidationService } from './offer-validation.service';

describe('OfferValidationService', () => {
  let service: OfferValidationService;
  let offersService: jest.Mocked<OffersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferValidationService,
        {
          provide: OffersService,
          useValue: {
            getOfferByIdGroupedBySchool: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OfferValidationService>(OfferValidationService);
    offersService = module.get(OffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateSchoolsAreActiveForOffer', () => {
    const offerId = 123;

    it('should return all school ids if all schools have active offers', async () => {
      const schoolIds = ['school-1', 'school-2'];

      offersService.getOfferByIdGroupedBySchool.mockResolvedValue(
        new Map([
          ['school-1', { offerId } as OffersDto],
          ['school-2', { offerId } as OffersDto],
        ]),
      );

      const result = await service.validateSchoolsAreActiveForOffer(schoolIds, offerId);

      expect(result).toEqual(['school-1', 'school-2']);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(offersService.getOfferByIdGroupedBySchool).toHaveBeenCalledWith(
        ['school-1', 'school-2'],
        offerId,
      );
    });

    it('should return only active school ids', async () => {
      const schoolIds = ['school-active', 'school-inactive'];

      offersService.getOfferByIdGroupedBySchool.mockResolvedValue(
        new Map([
          ['school-active', { offerId } as OffersDto],
          ['school-inactive', null],
        ]),
      );

      const result = await service.validateSchoolsAreActiveForOffer(schoolIds, offerId);

      expect(result).toEqual(['school-active']);
    });

    it('should handle schools missing from the activeOfferBySchoolId map', async () => {
      const schoolIds = ['school-missing'];

      offersService.getOfferByIdGroupedBySchool.mockResolvedValue(new Map());

      const result = await service.validateSchoolsAreActiveForOffer(schoolIds, offerId);

      expect(result).toEqual([]);
    });

    it('should handle empty schoolIds list', async () => {
      const schoolIds: string[] = [];

      const result = await service.validateSchoolsAreActiveForOffer(schoolIds, offerId);

      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(offersService.getOfferByIdGroupedBySchool).not.toHaveBeenCalled();
    });
  });
});
