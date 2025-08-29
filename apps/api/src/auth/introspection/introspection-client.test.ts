import type { KeycloakIntrospection } from '../interfaces/request-with-introspection.interface';

export class TestIntrospectionClient {
  private tokens: Map<string, KeycloakIntrospection> = new Map<
    string,
    KeycloakIntrospection
  >();

  getIntrospectionResponse(
    accessToken: string,
  ): Promise<KeycloakIntrospection> {
    const token = this.tokens.get(accessToken);
    if (!token) {
      return Promise.resolve({ active: false });
    }

    return Promise.resolve(token);
  }

  addUserToken(
    token: string,
    scopes: string[],
    sub?: string,
    clientId?: string,
    username?: string,
  ) {
    this.tokens.set(token, {
      active: true,
      scope: scopes.join(' '),
      client_id: clientId ?? 'test-client-id',
      sub: sub ?? 'test-sub',
      typ: 'Bearer',
      username: username ?? 'test-username',
    });
  }

  addClientToken(token: string, scopes: string[], clientId?: string) {
    this.tokens.set(token, {
      active: true,
      scope: scopes.join(' '),
      client_id: clientId ?? 'test-client-id',
      sub: 'client-token-sub',
      typ: 'Bearer',
      username: `service-account-` + (clientId ?? 'test-client-id'),
    });
  }
}
