import { Logger } from '../../common/logger';
import type { OffersConfig } from '../config/offers.config';
import { OffersFetcher } from './offers.fetcher';

describe('OffersFetcher', () => {
  let fetcher: OffersFetcher;
  let originalFetch: typeof global.fetch;

  const offersConfig: OffersConfig = {
    OFFERS_API_ENDPOINT: 'https://service-stage.vidis.schule/o/vidis-rest/v1.0',
    OFFERS_CLIENT_ID: 'test-client-id',
    OFFERS_CLIENT_SECRET: 'test-client-secret',
  };

  const offersResponsePayload = {
    items: [
      {
        clientId: ['client-1'],
        educationProviderOrganizationName: 'Provider',
        offerId: 100,
      },
    ],
    lastPage: 1,
    totalCount: 1,
    pageSize: 20,
    actions: {},
    page: 1,
    facets: [],
  };

  const mockOkResponse = (json: unknown) => ({
    ok: true,
    json: jest.fn().mockResolvedValue(json),
  });

  beforeEach(() => {
    originalFetch = global.fetch;

    fetcher = new OffersFetcher(offersConfig, new Logger());
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('uses bearer token authentication for fetching offers', async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce(
        mockOkResponse({
          access_token: 'token-1',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      )
      .mockResolvedValueOnce(mockOkResponse(offersResponsePayload));

    global.fetch = mockFetch;

    const response = await fetcher.fetchActiveOffers(['school-1']);

    expect(response).toHaveLength(1);
    expect(response[0]?.items[0].offerId).toBe(100);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://service-stage.vidis.schule/o/oauth2/token',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://service-stage.vidis.schule/o/vidis-rest/v1.0/offers/activated/by-school/school-1',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: 'Bearer token-1',
        },
      }),
    );
  });

  it('reuses cached bearer token until it expires', async () => {
    const mockFetch = jest
      .fn<Promise<ReturnType<typeof mockOkResponse>>, Parameters<typeof global.fetch>>()
      .mockResolvedValueOnce(
        mockOkResponse({
          access_token: 'token-1',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      )
      .mockResolvedValueOnce(mockOkResponse(offersResponsePayload))
      .mockResolvedValueOnce(mockOkResponse(offersResponsePayload));

    global.fetch = mockFetch as unknown as typeof global.fetch;

    await fetcher.fetchOfferForClientId('client-1');
    await fetcher.fetchOfferForClientId('client-1');

    const tokenCalls = mockFetch.mock.calls.filter(([input, _]) =>
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      String(input).includes('/o/oauth2/token'),
    );

    expect(tokenCalls).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('refreshes token after expiry', async () => {
    const mockFetch = jest
      .fn<Promise<ReturnType<typeof mockOkResponse>>, Parameters<typeof global.fetch>>()
      .mockResolvedValueOnce(
        mockOkResponse({
          access_token: 'token-1',
          expires_in: 0,
          token_type: 'bearer',
        }),
      )
      .mockResolvedValueOnce(mockOkResponse(offersResponsePayload))
      .mockResolvedValueOnce(
        mockOkResponse({
          access_token: 'token-2',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      )
      .mockResolvedValueOnce(mockOkResponse(offersResponsePayload));

    global.fetch = mockFetch as unknown as typeof global.fetch;

    await fetcher.fetchOfferForClientId('client-1');
    await fetcher.fetchOfferForClientId('client-1');

    const tokenCalls = mockFetch.mock.calls.filter(([input, _]) =>
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      String(input).includes('/o/oauth2/token'),
    );

    expect(tokenCalls).toHaveLength(2);
  });

  it('deduplicates in-flight token requests for concurrent offer calls', async () => {
    const mockFetch = jest
      .fn<Promise<ReturnType<typeof mockOkResponse>>, Parameters<typeof global.fetch>>()
      .mockResolvedValueOnce(
        mockOkResponse({
          access_token: 'token-1',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      )
      .mockResolvedValueOnce(mockOkResponse(offersResponsePayload))
      .mockResolvedValueOnce(mockOkResponse(offersResponsePayload));

    global.fetch = mockFetch as unknown as typeof global.fetch;

    await fetcher.fetchActiveOffers(['school-1', 'school-2']);

    const tokenCalls = mockFetch.mock.calls.filter(([input, _]) =>
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      String(input).includes('/o/oauth2/token'),
    );

    expect(tokenCalls).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('throws when token endpoint returns an error', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: jest.fn().mockResolvedValue('Unauthorized'),
    });

    global.fetch = mockFetch as unknown as typeof global.fetch;

    await expect(fetcher.fetchOfferForClientId('client-1')).rejects.toThrow(
      'Authorization towards Offers API failed.',
    );
  });

  it('returns null when offers endpoint responds with non-ok', async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce(
        mockOkResponse({
          access_token: 'token-1',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      )
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        text: jest.fn().mockResolvedValue('Failure'),
      });

    global.fetch = mockFetch as unknown as typeof global.fetch;

    const result = await fetcher.fetchOfferForClientId('client-1');

    expect(result).toBeNull();
  });
});
