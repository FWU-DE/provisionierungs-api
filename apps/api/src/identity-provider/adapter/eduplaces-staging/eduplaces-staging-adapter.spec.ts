import { EduplacesStagingAdapter } from './eduplaces-staging-adapter';
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

describe('EduplacesStagingAdapter', () => {
  let infra: TestingInfrastructure;
  let adapter: EduplacesStagingAdapter;
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

    adapter = infra.module.get(EduplacesStagingAdapter);
  });

  afterEach(async () => {
    await infra.tearDown();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('getIdentifier', () => {
    it('should return the correct identifier', () => {
      expect(adapter.getIdentifier()).toBe('eduplaces-staging');
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
        'https://staging-token-endpoint.example.local',
        'test-staging-client-id',
        'test-staging-client-secret',
        'client_credentials',
        'urn:eduplaces:idm:v1:schools:read urn:eduplaces:idm:v1:groups:read urn:eduplaces:idm:v1:people:read',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockSchulconnexFetcher.fetchPersons).toHaveBeenCalledWith(
        'https://staging-api-endpoint.example.local',
        mockParameters,
        mockAuthToken,
      );
      expect(result).toEqual({
        idp: 'eduplaces-staging',
        response: mockResponse,
      });
    });
  });
});
