import {
  ClientCredentialsProvider,
  clientCredentialsResponseSchema,
} from './client-credentials';
import { Logger } from '../../common/logger';
import {
  createTestingInfrastructure,
  type TestingInfrastructure,
} from '../../test/testing-module';
import { IdentityProviderModule } from '../identity-provider.module';

describe('ClientCredentialsProvider', () => {
  let infra: TestingInfrastructure;
  let provider: ClientCredentialsProvider;
  let mockLogger: jest.Mocked<Logger>;
  let originalFetch: typeof global.fetch;

  beforeEach(async () => {
    // Save original fetch
    originalFetch = global.fetch;

    // Mock logger
    mockLogger = {
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    infra = await createTestingInfrastructure({
      imports: [IdentityProviderModule],
    })
      .configureModule((module) => {
        module.overrideProvider(Logger).useValue(mockLogger);
      })
      .build();

    provider = infra.module.get(ClientCredentialsProvider);
  });

  afterEach(async () => {
    // Restore original fetch
    global.fetch = originalFetch;
    await infra.tearDown();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('authenticate', () => {
    it('should return a bearer token on successful authentication', async () => {
      // Mock successful fetch response
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'test-token',
            expires_in: 3600,
            scope: 'test-scope',
            token_type: 'bearer',
          }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await provider.authenticate(
        'https://test-endpoint.com/token',
        'test-username',
        'test-password',
        'client_credentials',
        'test-scope',
      );

      expect(result).toEqual({ token: 'test-token' });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-endpoint.com/token',
        {
          method: 'POST',
          headers: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            Authorization: expect.any(String),
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          body: expect.any(URLSearchParams),
        },
      );
    });

    it('should throw an error when fetch response is not ok', async () => {
      // Mock failed fetch response
      const mockResponse = {
        ok: false,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await expect(
        provider.authenticate(
          'https://test-endpoint.com/token',
          'test-username',
          'test-password',
        ),
      ).rejects.toThrow('Authorization towards Schulconnex failed.');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw an error when response validation fails', async () => {
      // Mock invalid response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          // Missing required fields
          token_type: 'bearer',
        }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await expect(
        provider.authenticate(
          'https://test-endpoint.com/token',
          'test-username',
          'test-password',
        ),
      ).rejects.toThrow('Authorization towards Schulconnex failed.');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should use default values for grantType and scope when not provided', async () => {
      // Mock successful fetch response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'test-token',
          expires_in: 3600,
          scope: '',
          token_type: 'bearer',
        }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await provider.authenticate(
        'https://test-endpoint.com/token',
        'test-username',
        'test-password',
      );

      // Check that fetch was called with the default values
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const body = fetchCall[1].body;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      expect(body.get('grant_type')).toBe('client_credentials');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      expect(body.get('scope')).toBe('');
    });
  });

  describe('clientCredentialsResponseSchema', () => {
    it('should validate a valid response', () => {
      const validResponse = {
        access_token: 'test-token',
        expires_in: 3600,
        scope: 'test-scope',
        token_type: 'bearer',
      };

      const result = clientCredentialsResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid response', () => {
      const invalidResponse = {
        // Missing access_token
        expires_in: 3600,
        scope: 'test-scope',
        token_type: 'bearer',
      };

      const result = clientCredentialsResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject an invalid token_type', () => {
      const invalidResponse = {
        access_token: 'test-token',
        expires_in: 3600,
        scope: 'test-scope',
        token_type: 'invalid-type', // Not 'bearer'
      };

      const result = clientCredentialsResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });
});
