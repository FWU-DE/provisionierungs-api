import { Logger } from '../../common/logger';
import { type TestingInfrastructure, createTestingInfrastructure } from '../../test/testing-module';
import { Aggregator } from '../aggregator/aggregator';
import type { SchulconnexGroup } from '../dto/schulconnex/schulconnex-group.dto';
import { type GroupsPerIdmModel } from '../model/groups-per-idm.model';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let infra: TestingInfrastructure;
  let validationService: ValidationService;
  let mockAggregator: jest.Mocked<Aggregator>;

  beforeEach(async () => {
    mockAggregator = {
      getGroups: jest.fn(),
    } as unknown as jest.Mocked<Aggregator>;

    infra = await createTestingInfrastructure({
      providers: [
        ValidationService,
        { provide: Aggregator, useValue: mockAggregator },
        {
          provide: Logger,
          useValue: {
            setContext: jest.fn(),
            error: jest.fn(),
            log: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).build();

    validationService = infra.module.get(ValidationService);
  });

  afterEach(async () => {
    await infra.tearDown();
  });

  it('should be defined', () => {
    expect(validationService).toBeDefined();
  });

  describe('validateGroupsForSchools', () => {
    it('should return empty array if groupIds is empty', async () => {
      const result = await validationService.validateGroupsForSchools(['school1'], [], ['idm1']);
      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAggregator.getGroups).not.toHaveBeenCalled();
    });

    it('should return empty array if schoolIds is empty', async () => {
      const result = await validationService.validateGroupsForSchools([], ['group1'], ['idm1']);
      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAggregator.getGroups).not.toHaveBeenCalled();
    });

    it('should return unique group IDs that were found by aggregator', async () => {
      const schoolIds = ['school1'];
      const groupIds = ['group1', 'group2', 'non-existent-group'];
      const idmIds = ['idm1'];

      const mockGroupsResponse: GroupsPerIdmModel[] = [
        {
          idm: 'idm1',
          groups: [
            { id: 'group1' },
            { id: 'group2' },
            { id: 'group1' }, // Duplicate for Set test
          ] as SchulconnexGroup[],
        },
      ];

      mockAggregator.getGroups.mockResolvedValue(mockGroupsResponse);

      const result = await validationService.validateGroupsForSchools(schoolIds, groupIds, idmIds);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAggregator.getGroups).toHaveBeenCalledWith(idmIds, undefined, schoolIds);
      expect(result).toEqual(['group1', 'group2']);
      expect(result.length).toBe(2);
    });

    it('should aggregate groups from multiple IDMs', async () => {
      const schoolIds = ['school1'];
      const groupIds = ['group1', 'group2'];
      const idmIds = ['idm1', 'idm2'];

      const mockGroupsResponse: GroupsPerIdmModel[] = [
        {
          idm: 'idm1',
          groups: [{ id: 'group1' }] as SchulconnexGroup[],
        },
        {
          idm: 'idm2',
          groups: [{ id: 'group2' }] as SchulconnexGroup[],
        },
      ];

      mockAggregator.getGroups.mockResolvedValue(mockGroupsResponse);

      const result = await validationService.validateGroupsForSchools(schoolIds, groupIds, idmIds);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAggregator.getGroups).toHaveBeenCalledWith(idmIds, undefined, schoolIds);
      expect(result).toEqual(['group1', 'group2']);
    });

    it('should return empty array if aggregator returns no groups', async () => {
      const schoolIds = ['school1'];
      const groupIds = ['group1'];
      const idmIds = ['idm1'];

      mockAggregator.getGroups.mockResolvedValue([]);

      const result = await validationService.validateGroupsForSchools(schoolIds, groupIds, idmIds);

      expect(result).toEqual([]);
    });

    it('should return empty array if aggregator returns results with no groups', async () => {
      const schoolIds = ['school1'];
      const groupIds = ['group1'];
      const idmIds = ['idm1'];

      mockAggregator.getGroups.mockResolvedValue([{ idm: 'idm1', groups: [] }]);

      const result = await validationService.validateGroupsForSchools(schoolIds, groupIds, idmIds);

      expect(result).toEqual([]);
    });
  });
});
