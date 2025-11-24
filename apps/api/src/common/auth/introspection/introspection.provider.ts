import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { ResourceOwnerType } from '../enums/resource-owner-type.enum';
import type {
  Introspection,
  RequestMaybeContainingIntrospection,
  RequestWithIntrospection,
} from '../interfaces/request-with-introspection.interface';
import { isRequestWithIntrospection } from '../interfaces/request-with-introspection.interface';
import { IntrospectionClient } from './introspection-client';
import authConfig, { type AuthConfig } from '../config/auth.config';
import { AccessTokenVerifierFactory } from './access-token-verifier.factory';
import { ensureError } from '@fwu-rostering/utils/error';
import { assertUnreachable } from '@fwu-rostering/utils/typescript';

@Injectable()
export class IntrospectionProvider {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfig: AuthConfig,
    private readonly logger: ConsoleLogger,
    private readonly introspectionClient: IntrospectionClient,
    private readonly accessTokenVerifierFactory: AccessTokenVerifierFactory,
  ) {}

  async getIntrospection(
    request: RequestMaybeContainingIntrospection,
  ): Promise<Introspection | null> {
    if (isRequestWithIntrospection(request)) {
      return request.introspection;
    }

    // Extract the access token from the request
    const accessToken = this.extractAccessTokenFromHeader(request);

    if (!accessToken && this.authConfig.AUTH_VALIDATION !== 'off') {
      this.logger.debug(
        'IntrospectionProvider: No access token found in request.',
      );
      return null;
    }

    // Get introspection for the access token
    this.logger.debug(
      'IntrospectionProvider: Request contains access token. Performing introspection...',
    );
    const introspection = await this.getIntrospectionFromConfiguredSource(
      accessToken ?? null,
    );

    if (introspection === null) {
      this.logger.log(
        'IntrospectionProvider: Access token introspection unsuccessful.',
      );
      return null;
    }

    // If the token is not an access token, access is denied
    if (introspection.typ !== 'Bearer') {
      this.logger.log(
        'IntrospectionProvider: Provided token is not an access token.',
      );
      return null;
    }

    // If the token does not have a subject, access is denied
    if (!introspection.sub) {
      this.logger.error(
        'IntrospectionProvider: Token introspection does not contain a subject or client ID.',
      );
      return null;
    }

    (request as RequestWithIntrospection).introspection = introspection;

    return introspection;
  }

  private extractAccessTokenFromHeader(req: Request): string | undefined {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) return undefined;

    const [type, token] = authorizationHeader.split(' ');
    if (type !== 'Bearer') {
      this.logger.log(
        `IntrospectionProvider: Token found in authorization header but type is not Bearer: ${type}`,
      );
      return undefined;
    }
    return token;
  }

  private async getIntrospectionFromConfiguredSource(
    accessToken: string | null,
  ): Promise<Introspection | null> {
    if (this.authConfig.AUTH_VALIDATION === 'off') {
      return {
        authenticated: true as const,
        typ: 'Bearer',
        sub: 'dfba621d-4f89-46be-b32d-5260e4f94cac',
        subType: ResourceOwnerType.CLIENT,
        scopes: [],
        clientId: 'auth_validation_off',
      };
    }

    if (accessToken === null) {
      this.logger.log(
        'IntrospectionProvider: No access token provided for introspection.',
      );
      return null;
    }

    if (this.authConfig.AUTH_VALIDATION === 'introspect') {
      const result =
        await this.introspectionClient.getIntrospectionResponse(accessToken);

      // If the token is expired or revoked, access is denied
      if (!result.active) {
        this.logger.log(
          'IntrospectionProvider: Provided token is expired or revoked.',
        );
        return null;
      }

      // Determine the resource owner type
      const resourceOwnerType = result.sid
        ? ResourceOwnerType.USER
        : ResourceOwnerType.CLIENT;

      this.logger.debug(
        `IntrospectionProvider: Token is valid, resource owner type is ${resourceOwnerType}`,
      );

      return {
        authenticated: true as const,
        typ: result.typ,
        sub: result.sub,
        subType: resourceOwnerType,
        scopes: result.scope.split(' '),
        clientId: result.client_id ?? null,
        heimatorganisation: result.heimatorganisation,
        schulkennung: result.schulkennung,
      };
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (this.authConfig.AUTH_VALIDATION === 'verify-jwt') {
      try {
        const accessTokenVerifier =
          await this.accessTokenVerifierFactory.create();
        const jwtVerifyResult =
          await accessTokenVerifier.verifyAccessToken(accessToken);

        const scopes = jwtVerifyResult.scope?.split(' ') ?? [];
        // Determine the resource owner type
        const resourceOwnerType = jwtVerifyResult.sid
          ? ResourceOwnerType.USER
          : ResourceOwnerType.CLIENT;

        return {
          authenticated: true as const,
          typ: jwtVerifyResult.typ,
          sub: jwtVerifyResult.sub,
          subType: resourceOwnerType,
          scopes,
          clientId: jwtVerifyResult.client_id ?? null,
          heimatorganisation: jwtVerifyResult.heimatorganisation,
          schulkennung: jwtVerifyResult.schulkennung,
        };
      } catch (error: unknown) {
        this.logger.warn(
          `IntrospectionProvider: Error verifying JWT access token: ${
            ensureError(error).message
          }`,
        );
        return null;
      }
    }

    assertUnreachable(this.authConfig);
  }
}
