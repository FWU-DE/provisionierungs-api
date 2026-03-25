import type { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import type { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { applyClearancePersonsGroupFilter } from '../../clearance/filter/clearance-group.filter';
import { applyClearancePersonsSchoolFilter } from '../../clearance/filter/clearance-school.filter';
import { Logger } from '../../common/logger';
import { SchulconnexPersonsQueryParameters } from '../../controller/parameters/schulconnex-persons-query-parameters';
import { OfferContext } from '../../offers/model/offer-context';
import { Pseudonymization } from '../../pseudonymization/pseudonymization';
import { type TestingInfrastructure, createTestingInfrastructure } from '../../test/testing-module';
import { type AdapterGetPersonsReturnType } from '../adapter/adapter-interface';
import { EduplacesStagingAdapter } from '../adapter/eduplaces-staging/eduplaces-staging-adapter';
import { EduplacesAdapter } from '../adapter/eduplaces/eduplaces-adapter';
import { SaarlandAdapter } from '../adapter/saarland/saarland-adapter';
import type { SchulconnexPersonsResponseDto } from '../dto/schulconnex/schulconnex-persons-response.dto';
import { PostRequestFilter } from '../post-request-filter/post-request-filter';
import { Aggregator } from './aggregator';

// Mock the clearance filter modules
jest.mock('../../clearance/filter/clearance-field.filter', () => ({
  applyClearancePersonsFieldFilter: jest
    .fn()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .mockImplementation((clientId, data) => data),
}));
jest.mock('../../clearance/filter/clearance-group.filter', () => ({
  applyClearancePersonsGroupFilter: jest
    .fn()
    .mockImplementation((data, clearanceEntries?: GroupClearance[]) => {
      if (!clearanceEntries) return [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    }),
}));
jest.mock('../../clearance/filter/clearance-school.filter', () => ({
  applyClearancePersonsSchoolFilter: jest
    .fn()
    .mockImplementation((data, clearanceEntries?: SchoolClearance[]) => {
      if (!clearanceEntries) return [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    }),
}));

describe('Aggregator', () => {
  let infra: TestingInfrastructure;
  let aggregator: Aggregator;
  let mockEduplacesAdapter: jest.Mocked<EduplacesAdapter>;
  let mockEduplacesStagingAdapter: jest.Mocked<EduplacesStagingAdapter>;
  let mockSaarlandAdapter: jest.Mocked<SaarlandAdapter>;
  let mockPseudonymization: jest.Mocked<Pseudonymization>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    // Create mocks for all dependencies
    mockEduplacesAdapter = {
      getIdentifier: jest.fn().mockReturnValue('eduplaces'),
      isEnabled: jest.fn().mockReturnValue(true),
      getPersons: jest.fn(),
    } as unknown as jest.Mocked<EduplacesAdapter>;

    mockEduplacesStagingAdapter = {
      getIdentifier: jest.fn().mockReturnValue('eduplaces-staging'),
      isEnabled: jest.fn().mockReturnValue(true),
      getPersons: jest.fn(),
    } as unknown as jest.Mocked<EduplacesStagingAdapter>;

    mockSaarlandAdapter = {
      getIdentifier: jest.fn().mockReturnValue('saarland'),
      isEnabled: jest.fn().mockReturnValue(true),
      getPersons: jest.fn(),
    } as unknown as jest.Mocked<SaarlandAdapter>;

    mockPseudonymization = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      pseudonymize: jest.fn().mockImplementation((clientId, data) => data),
    } as unknown as jest.Mocked<Pseudonymization>;

    mockLogger = {
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    infra = await createTestingInfrastructure({
      providers: [
        Aggregator,
        { provide: EduplacesAdapter, useValue: mockEduplacesAdapter },
        { provide: EduplacesStagingAdapter, useValue: mockEduplacesStagingAdapter },
        { provide: SaarlandAdapter, useValue: mockSaarlandAdapter },
        { provide: Pseudonymization, useValue: mockPseudonymization },
        { provide: Logger, useValue: mockLogger },
        {
          provide: PostRequestFilter,
          useValue: {
            filterByQueryParameters: jest
              .fn()
              .mockImplementation(
                (data: SchulconnexPersonsResponseDto[]): SchulconnexPersonsResponseDto[] => data,
              ),
          },
        },
      ],
    }).build();

    aggregator = infra.module.get(Aggregator);
  });

  afterEach(async () => {
    await infra.tearDown();
  });

  it('should be defined', () => {
    expect(aggregator).toBeDefined();
  });

  describe('getUsers', () => {
    it('should aggregate users from multiple adapters', async () => {
      // Mock data
      const mockParameters: SchulconnexPersonsQueryParameters =
        new SchulconnexPersonsQueryParameters('personen, personenkontexte');
      const mockOfferContext = new OfferContext(12345678, 'test-client');

      const mockIdmIds = ['eduplaces', 'eduplaces-staging'];

      const mockEduplacesResponse: AdapterGetPersonsReturnType = {
        idm: 'eduplaces',
        response: [
          {
            pid: 'user1',
            person: {
              name: {
                vorname: 'User 1',
                familienname: '',
                initialenfamilienname: null,
                initialenvorname: null,
                rufname: null,
              },
            },
            personenkontexte: [],
          },
        ],
      };

      const mockStagingResponse: AdapterGetPersonsReturnType = {
        idm: 'eduplaces-staging',
        response: [
          {
            pid: 'user2',
            person: {
              name: {
                vorname: 'User 2',
                familienname: '',
                initialenfamilienname: null,
                initialenvorname: null,
                rufname: null,
              },
            },
            personenkontexte: [],
          },
        ],
      };

      // Setup mocks
      mockEduplacesAdapter.getPersons.mockResolvedValue(mockEduplacesResponse);
      mockEduplacesStagingAdapter.getPersons.mockResolvedValue(mockStagingResponse);

      // Call the method - Providing empty arrays so the mocks (as updated) don't return empty
      const result = await aggregator.getPersons(
        mockIdmIds,
        mockOfferContext,
        mockParameters,
        [],
        [],
      );

      // Assertions
      expect(result).toEqual([
        {
          pid: 'user1',
          person: {
            name: {
              vorname: 'User 1',
              familienname: '',
              initialenfamilienname: null,
              initialenvorname: 'U',
              rufname: null,
            },
          },
          personenkontexte: [],
        },
        {
          pid: 'user2',
          person: {
            name: {
              vorname: 'User 2',
              familienname: '',
              initialenfamilienname: null,
              initialenvorname: 'U',
              rufname: null,
            },
          },
          personenkontexte: [],
        },
      ]);
    });

    it('should handle adapters that return null response', async () => {
      // Mock data
      const mockParameters: SchulconnexPersonsQueryParameters =
        new SchulconnexPersonsQueryParameters('personen, personenkontexte');
      const mockOfferContext = new OfferContext(12345678, 'test-client');
      const mockIdmIds = ['eduplaces', 'eduplaces-staging'];

      const mockEduplacesResponse = {
        idm: 'eduplaces',
        response: null,
      };

      const mockStagingResponse: AdapterGetPersonsReturnType = {
        idm: 'eduplaces-staging',
        response: [
          {
            pid: 'user2',
            person: {
              name: {
                rufname: 'user2',
              },
            },
            personenkontexte: [],
          },
        ],
      };

      // Setup mocks
      mockEduplacesAdapter.getPersons.mockResolvedValue(mockEduplacesResponse);
      mockEduplacesStagingAdapter.getPersons.mockResolvedValue(mockStagingResponse);

      // Call the method
      const result = await aggregator.getPersons(mockIdmIds, mockOfferContext, mockParameters, []);

      // Assertions
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalledWith('No data received from IDM: eduplaces');
      expect(result).toEqual([
        {
          pid: 'user2',
          person: {
            name: {
              rufname: 'user2',
            },
          },
          personenkontexte: [],
        },
      ]);
    });

    it('should handle non-existent adapter IDs', async () => {
      // Mock data
      const mockParameters: SchulconnexPersonsQueryParameters =
        new SchulconnexPersonsQueryParameters('personen, personenkontexte');
      const mockOfferContext = new OfferContext(12345678, 'test-client');
      const mockIdmIds = ['non-existent', 'eduplaces-staging'];

      const mockStagingResponse: AdapterGetPersonsReturnType = {
        idm: 'eduplaces-staging',
        response: [
          {
            pid: 'user2',
            person: {
              name: {
                rufname: 'user2',
              },
            },
            personenkontexte: [],
          },
        ],
      };

      // Setup mocks
      mockEduplacesStagingAdapter.getPersons.mockResolvedValue(mockStagingResponse);

      // Call the method
      const result = await aggregator.getPersons(
        mockIdmIds,
        mockOfferContext,
        mockParameters,
        [],
        [],
      );

      // Assertions
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalledWith('No adapter found for IDM: non-existent');
      expect(result).toEqual([
        {
          pid: 'user2',
          person: {
            name: {
              rufname: 'user2',
            },
          },
          personenkontexte: [],
        },
      ]);
    });

    it('should handle empty idmIds array', async () => {
      // Mock data
      const mockParameters: SchulconnexPersonsQueryParameters =
        new SchulconnexPersonsQueryParameters();
      const mockOfferContext = new OfferContext(12345678, 'test-client');
      const mockIdmIds: string[] = [];

      // Call the method
      const result = await aggregator.getPersons(
        mockIdmIds,
        mockOfferContext,
        mockParameters,
        [],
        [],
      );

      // Assertions
      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesAdapter.getPersons).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesStagingAdapter.getPersons).not.toHaveBeenCalled();
    });
  });

  describe('applyClearance', () => {
    const mockPersons: SchulconnexPersonsResponseDto[] = [
      { pid: 'p1', person: { name: { vorname: 'P1' } }, personenkontexte: [] },
      { pid: 'p2', person: { name: { vorname: 'P2' } }, personenkontexte: [] },
      { pid: 'p3', person: { name: { vorname: 'P3' } }, personenkontexte: [] },
    ];

    it('should return combined results from school and group filters', async () => {
      (applyClearancePersonsSchoolFilter as jest.Mock).mockReturnValue([mockPersons[0]]);
      (applyClearancePersonsGroupFilter as jest.Mock).mockReturnValue([mockPersons[1]]);

      // We test it through getPersons since applyClearance is private
      mockEduplacesAdapter.getPersons.mockResolvedValue({
        idm: 'eduplaces',
        response: mockPersons,
      });

      const schoolClearance = [{ schoolId: 's1' }] as SchoolClearance[];
      const groupClearance = [{ groupId: 'g1' }] as GroupClearance[];

      const result = await aggregator.getPersons(
        ['eduplaces'],
        new OfferContext(1, 'c1'),
        new SchulconnexPersonsQueryParameters(),
        groupClearance,
        schoolClearance,
      );

      // Result should be merged from school and group filters
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.pid)).toContain('p1');
      expect(result.map((p) => p.pid)).toContain('p2');

      // Verify school filter was called with all persons
      expect(applyClearancePersonsSchoolFilter).toHaveBeenCalledWith(mockPersons, schoolClearance);

      // Verify group filter was called with the diff (p2, p3)
      expect(applyClearancePersonsGroupFilter).toHaveBeenCalledWith(
        [mockPersons[1], mockPersons[2]],
        groupClearance,
      );
    });

    it('should return empty if both filters return empty', async () => {
      (applyClearancePersonsSchoolFilter as jest.Mock).mockReturnValue([]);
      (applyClearancePersonsGroupFilter as jest.Mock).mockReturnValue([]);

      mockEduplacesAdapter.getPersons.mockResolvedValue({
        idm: 'eduplaces',
        response: mockPersons,
      });

      const result = await aggregator.getPersons(
        ['eduplaces'],
        new OfferContext(1, 'c1'),
        new SchulconnexPersonsQueryParameters(),
        [],
        [],
      );

      expect(result).toHaveLength(0);
    });

    it('should only use school filter if group clearance is missing', async () => {
      (applyClearancePersonsSchoolFilter as jest.Mock).mockReturnValue([mockPersons[0]]);
      (applyClearancePersonsGroupFilter as jest.Mock).mockReturnValue([]);

      mockEduplacesAdapter.getPersons.mockResolvedValue({
        idm: 'eduplaces',
        response: mockPersons,
      });

      const result = await aggregator.getPersons(
        ['eduplaces'],
        new OfferContext(1, 'c1'),
        new SchulconnexPersonsQueryParameters(),
        undefined,
        [{ schoolId: 's1' }] as SchoolClearance[],
      );

      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('p1');
    });

    it('should directly call the private applyClearance method', () => {
      (applyClearancePersonsSchoolFilter as jest.Mock).mockReturnValue([mockPersons[0]]);
      (applyClearancePersonsGroupFilter as jest.Mock).mockReturnValue([mockPersons[1]]);

      const schoolClearance = [{ schoolId: 's1' }] as SchoolClearance[];
      const groupClearance = [{ groupId: 'g1' }] as GroupClearance[];

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const result = aggregator['applyPersonsClearance'](
        mockPersons,
        groupClearance,
        schoolClearance,
      );

      expect(result).toHaveLength(2);
      expect(result.map((p) => p.pid)).toContain('p1');
      expect(result.map((p) => p.pid)).toContain('p2');

      // Verify filters were called
      expect(applyClearancePersonsSchoolFilter).toHaveBeenCalledWith(mockPersons, schoolClearance);
      // Diff calculation: p1 is returned by school filter, so the diff should be [p2, p3]
      expect(applyClearancePersonsGroupFilter).toHaveBeenCalledWith(
        [mockPersons[1], mockPersons[2]],
        groupClearance,
      );
    });
  });

  // Test private methods through their public interface
  describe('adapter management', () => {
    it('should find adapter by ID when it exists', async () => {
      // Mock data
      const mockParameters: SchulconnexPersonsQueryParameters =
        new SchulconnexPersonsQueryParameters();
      const mockOfferContext = new OfferContext(12345678, 'test-client');
      const mockIdmIds = ['eduplaces'];

      const mockEduplacesResponse: AdapterGetPersonsReturnType = {
        idm: 'eduplaces',
        response: [
          {
            pid: 'user1',
            person: {
              name: {
                rufname: 'user2',
              },
            },
            personenkontexte: [],
          },
        ],
      };

      // Setup mocks
      mockEduplacesAdapter.getPersons.mockResolvedValue(mockEduplacesResponse);

      // Call the method
      await aggregator.getPersons(mockIdmIds, mockOfferContext, mockParameters, [], []);

      // Assertions
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesAdapter.getIdentifier).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesAdapter.getPersons).toHaveBeenCalledWith(mockParameters, [], []);
    });

    it('should not find adapter by ID when it does not exist', async () => {
      // Mock data
      const mockParameters: SchulconnexPersonsQueryParameters =
        new SchulconnexPersonsQueryParameters();
      const mockOfferContext = new OfferContext(12345678, 'test-client');
      const mockIdmIds = ['non-existent'];

      // Call the method
      await aggregator.getPersons(mockIdmIds, mockOfferContext, mockParameters, [], []);

      // Assertions
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesAdapter.getIdentifier).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesStagingAdapter.getIdentifier).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalledWith('No adapter found for IDM: non-existent');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesAdapter.getPersons).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesStagingAdapter.getPersons).not.toHaveBeenCalled();
    });
  });
});
