import { GroupClearance } from '../../../clearance/entity/group-clearance.entity';
import { SchulconnexOrganizationQueryParameters } from '../../../controller/parameters/schulconnex-organisations-query-parameters';
import { SchulconnexPersonsQueryParameters } from '../../../controller/parameters/schulconnex-persons-query-parameters';
import {
  type TestingInfrastructure,
  createTestingInfrastructure,
} from '../../../test/testing-module';
import { type BearerToken } from '../../authentication/bearer-token';
import { FormUrlEncodedProvider } from '../../authentication/form-url-encoded';
import { type SchulconnexOrganization } from '../../dto/schulconnex/schulconnex-organization.dto';
import { type SchulconnexPersonsResponse } from '../../fetcher/schulconnex/schulconnex-response.interface';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { IdentityProviderModule } from '../../identity-provider.module';
import { SaarlandAdapter } from './saarland-adapter';

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
      fetchGroups: jest.fn(),
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
      expect(adapter.getIdentifier()).toBe('DE-SL-OnlineSchuleSaarlandTest');
    });
  });

  describe('isEnabled', () => {
    it('should return true if enabled via ENV var', () => {
      expect(adapter.isEnabled()).toBe(true);
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
        {
          pid: 'person1',
          personenkontexte: [
            {
              id: 'ctx1',
              organisation: {
                id: 'schule-1',
                kennung: 'OLD_schule-1',
              },
            },
          ],
        },
        { pid: 'person2' },
      ];
      const mockOrganizationsResponse: SchulconnexOrganization[] = [
        {
          id: 'schule-1',
          kennung: 'PREFIX_schule-1',
          name: 'Schule 1',
          typ: 'Schule',
        },
        {
          id: 'schule-2',
          kennung: 'PREFIX_schule-2',
          name: 'Schule 2',
          typ: 'Schule',
        },
        {
          id: 'schule-3',
          kennung: 'PREFIX_schule-3',
          name: 'Schule 3',
          typ: 'Schule',
        },
      ];

      // Setup mocks
      mockFormUrlEncodedProviderProvider.authenticate.mockResolvedValue(mockAuthToken);
      mockSchulconnexFetcher.fetchPersons.mockResolvedValue(mockPersonsResponse);
      mockSchulconnexFetcher.fetchOrganizations.mockResolvedValue(mockOrganizationsResponse);

      const mockClearance1 = new GroupClearance();
      mockClearance1.offerId = 1;
      mockClearance1.idmId = 'DE-SL-OnlineSchuleSaarlandTest';
      mockClearance1.schoolId = 'DE-SL-schule-1';
      mockClearance1.groupId = 'group-1';

      const mockClearance2 = new GroupClearance();
      mockClearance2.offerId = 2;
      mockClearance2.idmId = 'DE-SL-OnlineSchuleSaarlandTest';
      mockClearance2.schoolId = 'DE-SL-schule-2';
      mockClearance2.groupId = 'group-3';

      // Call the method
      const result = await adapter.getPersons(mockPersonsQueryParameters, 'test-client-id', [
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
        {
          'X-VIDIS-CLIENT-ID': 'test-client-id',
        },
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
        {
          'X-VIDIS-CLIENT-ID': 'test-client-id',
        },
      );
      expect(result).toEqual({
        idm: 'DE-SL-OnlineSchuleSaarlandTest',
        response: [
          {
            pid: 'person1',
            personenkontexte: [
              {
                id: 'ctx1',
                organisation: {
                  id: 'schule-1',
                  kennung: 'DE-SL-schule-1',
                },
              },
            ],
          },
          { pid: 'person2' },
        ],
      });
    });
  });

  describe('adjustOrganizationPrefix', () => {
    it('should split at "_" and prepend the school ID prefix', () => {
      // @ts-expect-error - accessing private method for testing
      expect(adapter.adjustOrganizationPrefix('XY_12345')).toBe('DE-SL-12345');
    });

    it('should work if no "_" is present', () => {
      // @ts-expect-error - accessing private method for testing
      expect(adapter.adjustOrganizationPrefix('12345')).toBe('DE-SL-12345');
    });

    it('should handle null or undefined', () => {
      // @ts-expect-error - accessing private method for testing
      expect(adapter.adjustOrganizationPrefix(null)).toBe(null);
      // @ts-expect-error - accessing private method for testing
      expect(adapter.adjustOrganizationPrefix(undefined)).toBe(undefined);
    });

    it('should handle multiple "_"', () => {
      // @ts-expect-error - accessing private method for testing
      expect(adapter.adjustOrganizationPrefix('A_B_C')).toBe('DE-SL-C');
    });
  });

  describe('convertSchoolIdPrefixToIDMExpectation', () => {
    it('should split at "-" and prepend "SL_"', () => {
      // @ts-expect-error - accessing private method for testing
      expect(adapter.convertSchoolIdPrefixToIDMExpectation('X-Y-12345')).toBe('SL_12345');
    });

    it('should work if no "-" is present', () => {
      // @ts-expect-error - accessing private method for testing
      expect(adapter.convertSchoolIdPrefixToIDMExpectation('12345')).toBe('SL_12345');
    });

    it('should handle null or undefined', () => {
      // @ts-expect-error - accessing private method for testing
      expect(adapter.convertSchoolIdPrefixToIDMExpectation(null)).toBe(null);
      // @ts-expect-error - accessing private method for testing
      expect(adapter.convertSchoolIdPrefixToIDMExpectation(undefined)).toBe(undefined);
    });
  });

  describe('getOrganizations', () => {
    it('should convert prefix in kennung parameter before fetching', async () => {
      const mockAuthToken: BearerToken = { token: 'test-token' };
      mockFormUrlEncodedProviderProvider.authenticate.mockResolvedValue(mockAuthToken);
      mockSchulconnexFetcher.fetchOrganizations.mockResolvedValue([]);

      const params = new SchulconnexOrganizationQueryParameters();
      params.kennung = 'X-Y-12345';

      await adapter.getOrganizations(params, 'test-client-id');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockSchulconnexFetcher.fetchOrganizations).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ kennung: 'SL_12345' }),
        mockAuthToken,
        {
          'X-VIDIS-CLIENT-ID': 'test-client-id',
        },
      );
    });
  });
});
