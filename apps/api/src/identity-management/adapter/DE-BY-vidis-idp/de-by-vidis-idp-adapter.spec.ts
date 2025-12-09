import { DeByVidisIdpAdapter } from './de-by-vidis-idp-adapter';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { ClientCredentialsProvider } from '../../authentication/client-credentials';
import { SchulconnexQueryParameters } from '../../../controller/parameters/schulconnex-query-parameters';
import { type BearerToken } from '../../authentication/bearer-token';
import { type SchulconnexPersonsResponse } from '../../fetcher/schulconnex/schulconnex-response.interface';
import {
  createTestingInfrastructure,
  type TestingInfrastructure,
} from '../../../test/testing-module';
import { IdentityProviderModule } from '../../identity-provider.module';

describe('DE_BY_vidis_idpAdapter', () => {
  let infra: TestingInfrastructure;
  let adapter: DeByVidisIdpAdapter;
  let mockSchulconnexFetcher: jest.Mocked<SchulconnexFetcher>;
  let mockClientCredentialsProvider: jest.Mocked<ClientCredentialsProvider>;

  beforeEach(async () => {
    // Create mocks for all dependencies
    mockSchulconnexFetcher = {
      fetchPersons: jest.fn(),
    } as unknown as jest.Mocked<SchulconnexFetcher>;

    mockClientCredentialsProvider = {
      authenticate: jest.fn(),
    } as unknown as jest.Mocked<ClientCredentialsProvider>;

    infra = await createTestingInfrastructure({
      imports: [IdentityProviderModule],
    })
      .configureModule((module) => {
        module
          .overrideProvider(SchulconnexFetcher)
          .useValue(mockSchulconnexFetcher)
          .overrideProvider(ClientCredentialsProvider)
          .useValue(mockClientCredentialsProvider);
      })
      .build();

    adapter = infra.module.get(DeByVidisIdpAdapter);
  });

  afterEach(async () => {
    await infra.tearDown();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('getIdentifier', () => {
    it('should return the correct identifier', () => {
      expect(adapter.getIdentifier()).toBe('DE-BY-vidis-idp');
    });
  });

  describe('getPersons', () => {
    it('should authenticate, fetch persons, and transform the response', async () => {
      // Mock data
      const mockParameters: SchulconnexQueryParameters =
        new SchulconnexQueryParameters();
      const mockAuthToken: BearerToken = {
        token: 'test-auth-token',
      };
      const mockResponse: SchulconnexPersonsResponse[] = [
        { pid: 'person1' },
        { pid: 'person2' },
      ];

      // Setup mocks
      mockClientCredentialsProvider.authenticate.mockResolvedValue(
        mockAuthToken,
      );
      mockSchulconnexFetcher.fetchPersons.mockResolvedValue(mockResponse);

      // Call the method
      const result = await adapter.getPersons(mockParameters);

      // Assertions
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockClientCredentialsProvider.authenticate).toHaveBeenCalledWith(
        'https://de-by-vidis-idp-token-endpoint.example.local',
        'test-de-by-vidis-idp-client-id',
        'test-de-by-vidis-idp-client-secret',
        'client_credentials',
        'urn:eduplaces:idm:v1:schools:read urn:eduplaces:idm:v1:groups:read urn:eduplaces:idm:v1:people:read',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockSchulconnexFetcher.fetchPersons).toHaveBeenCalledWith(
        'https://de-by-vidis-idp-api-endpoint.example.local',
        mockParameters,
        mockAuthToken,
      );
      expect(result).toEqual({
        idm: 'DE-BY-vidis-idp',
        response: mockResponse,
      });
    });
  });
});
