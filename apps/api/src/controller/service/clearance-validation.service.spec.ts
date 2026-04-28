import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import type { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { OfferValidationService } from '../../offers/service/offer-validation.service';
import { ClearanceValidationService } from './clearance-validation.service';

describe('ClearanceValidationService', () => {
  let service: ClearanceValidationService;
  let offerValidationService: jest.Mocked<OfferValidationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClearanceValidationService,
        {
          provide: OfferValidationService,
          useValue: {
            validateSchoolsAreActiveForOffer: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClearanceValidationService>(ClearanceValidationService);
    offerValidationService = module.get(OfferValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateClearance', () => {
    const offerId = 123;

    it('should return all clearances if all schools have active offers', async () => {
      const groupClearances = [
        { id: 1, schoolId: 'school-1' } as unknown as GroupClearance,
        { id: 2, schoolId: 'school-2' } as unknown as GroupClearance,
      ];
      const schoolClearances = [{ id: 3, schoolId: 'school-1' } as unknown as SchoolClearance];

      offerValidationService.validateSchoolsAreActiveForOffer.mockResolvedValue([
        'school-1',
        'school-2',
      ]);

      const result = await service.validateClearance(offerId, groupClearances, schoolClearances);

      expect(result.groupClearances).toHaveLength(2);
      expect(result.schoolClearances).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(offerValidationService.validateSchoolsAreActiveForOffer).toHaveBeenCalledWith(
        ['school-1', 'school-2'],
        offerId,
      );
    });

    it('should filter out clearances for schools with inactive offers', async () => {
      const groupClearances = [
        { id: 1, schoolId: 'school-active' } as unknown as GroupClearance,
        { id: 2, schoolId: 'school-inactive' } as unknown as GroupClearance,
      ];
      const schoolClearances = [
        { id: 3, schoolId: 'school-active' } as unknown as SchoolClearance,
        { id: 4, schoolId: 'school-inactive' } as unknown as SchoolClearance,
      ];

      offerValidationService.validateSchoolsAreActiveForOffer.mockResolvedValue(['school-active']);

      const result = await service.validateClearance(
        offerId,
        [...groupClearances],
        [...schoolClearances],
      );

      expect(result.groupClearances).toHaveLength(1);
      expect(result.groupClearances[0].schoolId).toBe('school-active');
      expect(result.schoolClearances).toHaveLength(1);
      expect(result.schoolClearances[0].schoolId).toBe('school-active');
    });

    it('should correctly unique schoolIds from both clearance types', async () => {
      const groupClearances = [{ id: 1, schoolId: 'school-1' } as unknown as GroupClearance];
      const schoolClearances = [
        { id: 2, schoolId: 'school-1' } as unknown as SchoolClearance,
        { id: 3, schoolId: 'school-2' } as unknown as SchoolClearance,
      ];

      offerValidationService.validateSchoolsAreActiveForOffer.mockResolvedValue([
        'school-1',
        'school-2',
      ]);

      await service.validateClearance(offerId, groupClearances, schoolClearances);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(offerValidationService.validateSchoolsAreActiveForOffer).toHaveBeenCalledWith(
        expect.arrayContaining(['school-1', 'school-2']),
        offerId,
      );
      // Ensure it was called with exactly 2 schools (uniqueness check)
      const call = offerValidationService.validateSchoolsAreActiveForOffer.mock.calls[0];
      expect(call[0]).toHaveLength(2);
    });
  });
});
