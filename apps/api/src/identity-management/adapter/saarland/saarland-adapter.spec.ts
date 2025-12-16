import { SaarlandAdapter } from './saarland-adapter';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { SchulconnexPersonsQueryParameters } from '../../../controller/parameters/schulconnex-persons-query-parameters';
import { type BearerToken } from '../../authentication/bearer-token';
import { type SchulconnexPersonsResponse } from '../../fetcher/schulconnex/schulconnex-response.interface';
import {
  createTestingInfrastructure,
  type TestingInfrastructure,
} from '../../../test/testing-module';
import { IdentityProviderModule } from '../../identity-provider.module';
import { FormUrlEncodedProvider } from '../../authentication/form-url-encoded';
import { Clearance } from '../../../clearance/entity/clearance.entity';
import { type SchulconnexOrganization } from '../../dto/schulconnex/schulconnex-organization.dto';

describe('SaarlandAdapter', () => {
  let infra: TestingInfrastructure;
  let adapter: SaarlandAdapter;
  let mockSchulconnexFetcher: jest.Mocked<SchulconnexFetcher>;
  let mockFormUrlEncodedProviderProvider: jest.Mocked<FormUrlEncodedProvider>;

  beforeEach(async () => {
    // Create mocks for all dependencies
    mockSchulconnexFetcher = {
      fetchPersons: jest.fn(),
      fetchOrganizations: jest.fn(),
    } as unknown as jest.Mocked<SchulconnexFetcher>;

    mockFormUrlEncodedProviderProvider = {
      authenticate: jest.fn(),
    } as unknown as jest.Mocked<FormUrlEncodedProvider>;

    infra = await createTestingInfrastructure({
      imports: [IdentityProviderModule],
    })
      .configureModule((module) => {
        module
          .overrideProvider(SchulconnexFetcher)
          .useValue(mockSchulconnexFetcher)
          .overrideProvider(FormUrlEncodedProvider)
          .useValue(mockFormUrlEncodedProviderProvider);
      })
      .build();

    adapter = infra.module.get(SaarlandAdapter);
  });

  afterEach(async () => {
    await infra.tearDown();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('getIdentifier', () => {
    it('should return the correct identifier', () => {
      expect(adapter.getIdentifier()).toBe('saarland');
    });
  });

  describe('getPersons', () => {
    it('should authenticate, fetch persons, and transform the response', async () => {
      // Mock data
      const mockPersonsQueryParameters: SchulconnexPersonsQueryParameters =
        new SchulconnexPersonsQueryParameters();
      const mockAuthToken: BearerToken = {
        token: 'test-auth-token',
      };
      const mockPersonsResponse: SchulconnexPersonsResponse[] = [
        { pid: 'person1' },
        { pid: 'person2' },
      ];
      const mockOrganizationsResponse: SchulconnexOrganization[] = [
        {
          id: 'schule-1',
          kennung: 'schule-1',
          name: 'Schule 1',
          typ: 'Schule',
        },
        {
          id: 'schule-2',
          kennung: 'schule-2',
          name: 'Schule 2',
          typ: 'Schule',
        },
        {
          id: 'schule-3',
          kennung: 'schule-3',
          name: 'Schule 3',
          typ: 'Schule',
        },
      ];

      // Setup mocks
      mockFormUrlEncodedProviderProvider.authenticate.mockResolvedValue(
        mockAuthToken,
      );
      mockSchulconnexFetcher.fetchPersons.mockResolvedValue(
        mockPersonsResponse,
      );
      mockSchulconnexFetcher.fetchOrganizations.mockResolvedValue(
        mockOrganizationsResponse,
      );

      const mockClearance1 = new Clearance();
      mockClearance1.offerId = 1;
      mockClearance1.idmId = 'saarland';
      mockClearance1.schoolId = 'schule-1';
      mockClearance1.groupId = 'group-1';

      const mockClearance2 = new Clearance();
      mockClearance2.offerId = 2;
      mockClearance2.idmId = 'saarland';
      mockClearance2.schoolId = 'schule-2';
      mockClearance2.groupId = 'group-3';

      // Call the method
      const result = await adapter.getPersons(mockPersonsQueryParameters, [
        mockClearance1,
        mockClearance2,
      ]);

      // Assertions
      expect(
        // eslint-disable-next-line @typescript-eslint/unbound-method
        mockFormUrlEncodedProviderProvider.authenticate,
      ).toHaveBeenCalledWith(
        'https://saarland-token-endpoint.example.local',
        'test-saarland-client-id',
        'test-saarland-client-secret',
        'client_credentials',
        'scope',
        'https://resource-123.tld',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockSchulconnexFetcher.fetchPersons).toHaveBeenCalledWith(
        'https://saarland-api-endpoint.example.local',
        new SchulconnexPersonsQueryParameters(
          undefined,
          undefined,
          undefined,
          undefined,
          'schule-1',
        ),
        mockAuthToken,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockSchulconnexFetcher.fetchPersons).toHaveBeenCalledWith(
        'https://saarland-api-endpoint.example.local',
        new SchulconnexPersonsQueryParameters(
          undefined,
          undefined,
          undefined,
          undefined,
          'schule-2',
        ),
        mockAuthToken,
      );
      expect(result).toEqual({
        idm: 'saarland',
        response: mockPersonsResponse,
      });
    });
  });
});
