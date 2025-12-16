import { Aggregator } from './aggregator';
import { EduplacesAdapter } from '../adapter/eduplaces/eduplaces-adapter';
import { EduplacesStagingAdapter } from '../adapter/eduplaces-staging/eduplaces-staging-adapter';
import { Pseudonymization } from '../../pseudonymization/pseudonymization';
import { Logger } from '../../common/logger';
import { SchulconnexPersonsQueryParameters } from '../../controller/parameters/schulconnex-persons-query-parameters';
import { type AdapterGetPersonsReturnType } from '../adapter/adapter-interface';
import {
  createTestingInfrastructure,
  type TestingInfrastructure,
} from '../../test/testing-module';
import { IdentityProviderModule } from '../identity-provider.module';
import type { Clearance } from '../../clearance/entity/clearance.entity';
import { OfferContext } from '../../offers/model/offer-context';

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
    .mockImplementation((data, clearanceEntries?: Clearance[]) => {
      void clearanceEntries;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    }),
}));

describe('Aggregator', () => {
  let infra: TestingInfrastructure;
  let aggregator: Aggregator;
  let mockEduplacesAdapter: jest.Mocked<EduplacesAdapter>;
  let mockEduplacesStagingAdapter: jest.Mocked<EduplacesStagingAdapter>;
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

    mockPseudonymization = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      pseudonymize: jest.fn().mockImplementation((clientId, data) => data),
    } as unknown as jest.Mocked<Pseudonymization>;

    mockLogger = {
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    infra = await createTestingInfrastructure({
      imports: [IdentityProviderModule],
    })
      .configureModule((module) => {
        module
          .overrideProvider(EduplacesAdapter)
          .useValue(mockEduplacesAdapter)
          .overrideProvider(EduplacesStagingAdapter)
          .useValue(mockEduplacesStagingAdapter)
          .overrideProvider(Pseudonymization)
          .useValue(mockPseudonymization)
          .overrideProvider(Logger)
          .useValue(mockLogger);
      })
      .build();

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
      mockEduplacesStagingAdapter.getPersons.mockResolvedValue(
        mockStagingResponse,
      );

      // Call the method
      const result = await aggregator.getPersons(
        mockIdmIds,
        mockOfferContext,
        mockParameters,
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
              initialenvorname: null,
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
              initialenvorname: null,
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
      mockEduplacesStagingAdapter.getPersons.mockResolvedValue(
        mockStagingResponse,
      );

      // Call the method
      const result = await aggregator.getPersons(
        mockIdmIds,
        mockOfferContext,
        mockParameters,
        [],
      );

      // Assertions
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalledWith(
        'No data received from IDM: eduplaces',
      );
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
      mockEduplacesStagingAdapter.getPersons.mockResolvedValue(
        mockStagingResponse,
      );

      // Call the method
      const result = await aggregator.getPersons(
        mockIdmIds,
        mockOfferContext,
        mockParameters,
      );

      // Assertions
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalledWith(
        'No adapter found for IDM: non-existent',
      );
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
      );

      // Assertions
      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesAdapter.getPersons).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesStagingAdapter.getPersons).not.toHaveBeenCalled();
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
      await aggregator.getPersons(
        mockIdmIds,
        mockOfferContext,
        mockParameters,
        [],
      );

      // Assertions
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesAdapter.getIdentifier).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesAdapter.getPersons).toHaveBeenCalledWith(
        mockParameters,
        [],
      );
    });

    it('should not find adapter by ID when it does not exist', async () => {
      // Mock data
      const mockParameters: SchulconnexPersonsQueryParameters =
        new SchulconnexPersonsQueryParameters();
      const mockOfferContext = new OfferContext(12345678, 'test-client');
      const mockIdmIds = ['non-existent'];

      // Call the method
      await aggregator.getPersons(
        mockIdmIds,
        mockOfferContext,
        mockParameters,
        [],
      );

      // Assertions
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesAdapter.getIdentifier).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesStagingAdapter.getIdentifier).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalledWith(
        'No adapter found for IDM: non-existent',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesAdapter.getPersons).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEduplacesStagingAdapter.getPersons).not.toHaveBeenCalled();
    });
  });
});
