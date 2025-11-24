import {
  type FlattenedJWSInput,
  type JWSHeaderParameters,
  type JWTPayload,
} from 'jose';
import z, { safeParse } from 'zod';

const openIdConnectSchema = z.object({
  issuer: z.string(),
  jwks_uri: z.url(),
  id_token_signing_alg_values_supported: z.array(z.string()).optional(),
});

type OpenIDConnectConfiguration = z.infer<typeof openIdConnectSchema>;

const accessTokenSchema = z.object({
  iss: z.string(),
  iat: z.number(),
  exp: z.number(),
  sub: z.string(),
  jti: z.string(),
  typ: z.enum(['Bearer', 'ID']),
  sid: z.string().optional(),
  scope: z.string().optional(),
  client_id: z.string().optional(),
  schulkennung: z.array(z.string()).optional(),
  heimatorganisation: z.string().optional(),
  email: z.string().optional(),
});

type AccessToken = z.infer<typeof accessTokenSchema>;

export class AccessTokenVerifier {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  private jose: typeof import('jose') | null = null;
  constructor(
    private jwks: (
      protectedHeader?: JWSHeaderParameters,
      token?: FlattenedJWSInput,
    ) => Promise<CryptoKey>,
    private openIDConnectConfig: Pick<
      OpenIDConnectConfiguration,
      'id_token_signing_alg_values_supported' | 'issuer'
    >,
  ) {}

  static async createFromOpenidConfigurationUrl(
    openidConfigurationUrl: string,
  ) {
    const response = await fetch(openidConfigurationUrl);
    const result = safeParse(openIdConnectSchema, await response.json());
    if (!result.success) {
      throw new Error(
        'Invalid OpenID Connect configuration: ' + result.error.message,
      );
    }

    const jwks = (await import('jose')).createRemoteJWKSet(
      new URL(result.data.jwks_uri),
    );
    return new AccessTokenVerifier(jwks, result.data);
  }

  async verifyAccessToken(logoutToken: string): Promise<AccessToken> {
    // use local config or fetch new
    const openIDConnectConfig = this.openIDConnectConfig;

    const algorithms =
      !openIDConnectConfig.id_token_signing_alg_values_supported ||
      openIDConnectConfig.id_token_signing_alg_values_supported.length <= 0
        ? ['RS256']
        : openIDConnectConfig.id_token_signing_alg_values_supported;

    const jwtVerifyResult = await (
      await this.getJose()
    ).jwtVerify<
      JWTPayload & { sid?: string; events?: Record<string, unknown> }
    >(logoutToken, this.jwks, {
      issuer: this.openIDConnectConfig.issuer,
      clockTolerance: 60,
      algorithms,
      requiredClaims: ['iss', 'iat', 'jti'],
    });

    const validatedResult = safeParse(
      accessTokenSchema,
      jwtVerifyResult.payload,
    );
    if (!validatedResult.success) {
      throw new Error(
        'Access token validation failed: ' + validatedResult.error.message,
      );
    }

    return validatedResult.data;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  private async getJose(): Promise<typeof import('jose')> {
    return (this.jose ??= await import('jose'));
  }
}
