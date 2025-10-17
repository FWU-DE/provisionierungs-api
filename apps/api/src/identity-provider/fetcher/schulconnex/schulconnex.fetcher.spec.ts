import { SchulconnexFetcher } from './schulconnex.fetcher';
import { Logger } from '../../../logger';
import { type SchulconnexQueryParameters } from '../../../controller/types/schulconnex';
import { type BearerToken } from '../../authentication/bearer-token';
import { schulconnexUsersResponseSchema } from './schulconnex.validator';
import {
  createTestingInfrastructure,
  type TestingInfrastructure,
} from '../../../test/testing-module';
import { IdentityProviderModule } from '../../identity-provider.module';

describe('SchulconnexFetcher', () => {
  let infra: TestingInfrastructure;
  let fetcher: SchulconnexFetcher;
  let mockLogger: jest.Mocked<Logger>;
  let mockFetch: jest.SpyInstance;

  beforeEach(async () => {
    // Create a mock for Logger
    mockLogger = {
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    // Mock global fetch
    mockFetch = jest.spyOn(global, 'fetch');

    infra = await createTestingInfrastructure({
      imports: [IdentityProviderModule],
    })
      .configureModule((module) => {
        module.overrideProvider(Logger).useValue(mockLogger);
      })
      .build();

    fetcher = infra.module.get(SchulconnexFetcher);
  });

  afterEach(async () => {
    mockFetch.mockRestore();
    await infra.tearDown();
  });

  it('should be defined', () => {
    expect(fetcher).toBeDefined();
  });

  describe('fetchPersons', () => {
    it('should fetch persons successfully', async () => {
      // Mock data
      const mockEndpointUrl = 'https://api.example.local';
      const mockParameters: SchulconnexQueryParameters = {
        vollstaendig: 'personenkontexte',
      };
      const mockToken: BearerToken = { token: 'test-token' };
      const mockResponse = [
        {
          pid: 'person1',
          person: {
            name: {
              vorname: 'Test',
              familienname: 'User',
            },
            stammorganisation: {
              id: 'org1',
            },
          },
          personenkontexte: [],
        },
      ];

      // Setup mock response
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as unknown as Response);

      // Call the method
      const result = await fetcher.fetchPersons(
        mockEndpointUrl,
        mockParameters,
        mockToken,
      );

      // Assertions
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.local/personen-info?vollstaendig=personenkontexte',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer test-token',
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return null when fetch fails', async () => {
      // Mock data
      const mockEndpointUrl = 'https://api.example.local';
      const mockParameters: SchulconnexQueryParameters = {};
      const mockToken: BearerToken = { token: 'test-token' };

      // Setup mock response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      } as unknown as Response);

      // Call the method
      const result = await fetcher.fetchPersons(
        mockEndpointUrl,
        mockParameters,
        mockToken,
      );

      // Assertions
      expect(result).toBeNull();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return null when validation fails', async () => {
      // Mock data
      const mockEndpointUrl = 'https://api.example.local';
      const mockParameters: SchulconnexQueryParameters = {};
      const mockToken: BearerToken = { token: 'test-token' };
      const mockResponse = [{ invalid: 'data' }]; // Invalid response structure

      // Setup mock response
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as unknown as Response);

      // Call the method
      const result = await fetcher.fetchPersons(
        mockEndpointUrl,
        mockParameters,
        mockToken,
      );

      // Assertions
      expect(result).toBeNull();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getValidator', () => {
    it('should return the schulconnex users response schema', () => {
      // Use reflection to access a protected method
      const validator = fetcher.getValidator();

      // Assertions
      expect(validator).toBe(schulconnexUsersResponseSchema);
    });
  });
});
