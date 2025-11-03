import { TestIntrospectionClient } from './introspection-client.test';

describe('TestIntrospectionClient', () => {
  let client: TestIntrospectionClient;

  beforeEach(() => {
    client = new TestIntrospectionClient();
  });

  it('returns inactive response for unknown token', async () => {
    const result = await client.getIntrospectionResponse('unknown');
    expect(result).toEqual({ active: false });
  });

  it('returns added user token', async () => {
    const token = 'user-token';
    const scopes = ['scope1', 'scope2'];
    client.addUserToken(token, scopes, 'sub123', 'client123', 'user123');
    const result = await client.getIntrospectionResponse(token);
    expect(result).toEqual({
      active: true,
      scope: 'scope1 scope2',
      client_id: 'client123',
      sub: 'sub123',
      typ: 'Bearer',
      username: 'user123',
      sid: 'test-sid',
    });
  });

  it('returns added client token', async () => {
    const token = 'client-token';
    const scopes = ['scopeA'];
    client.addClientToken(token, scopes, 'clientABC');
    const result = await client.getIntrospectionResponse(token);
    expect(result).toEqual({
      active: true,
      scope: 'scopeA',
      client_id: 'clientABC',
      sub: 'client-token-sub',
      typ: 'Bearer',
      username: 'service-account-clientABC',
    });
  });

  it('uses default values when optional params are missing in addUserToken', async () => {
    const token = 'default-user-token';
    const scopes = ['scopeX'];
    client.addUserToken(token, scopes);
    const result = await client.getIntrospectionResponse(token);
    expect(result).toEqual({
      active: true,
      scope: 'scopeX',
      client_id: 'test-client-id',
      sub: 'test-sub',
      typ: 'Bearer',
      username: 'test-username',
      sid: 'test-sid',
    });
  });

  it('uses default values when optional params are missing in addClientToken', async () => {
    const token = 'default-client-token';
    const scopes = ['scopeY'];
    client.addClientToken(token, scopes);
    const result = await client.getIntrospectionResponse(token);
    expect(result).toEqual({
      active: true,
      scope: 'scopeY',
      client_id: 'test-client-id',
      sub: 'client-token-sub',
      typ: 'Bearer',
      username: 'service-account-test-client-id',
    });
  });
});
