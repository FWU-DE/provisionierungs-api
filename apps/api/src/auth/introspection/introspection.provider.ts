import { ConsoleLogger, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { ResourceOwnerType } from '../enums/resource-owner-type.enum';
import type {
  Introspection,
  RequestMaybeContainingIntrospection,
  RequestWithIntrospection,
} from '../interfaces/request-with-introspection.interface';
import { isRequestWithIntrospection } from '../interfaces/request-with-introspection.interface';
import { IntrospectionClient } from './introspection-client';

@Injectable()
export class IntrospectionProvider {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly introspectionClient: IntrospectionClient,
  ) {}

  async getIntrospection(
    request: RequestMaybeContainingIntrospection,
  ): Promise<Introspection | null> {
    if (isRequestWithIntrospection(request)) {
      return request.introspection;
    }

    // Extract the access token from the request
    const accessToken = this.extractAccessTokenFromHeader(request);

    if (!accessToken) {
      this.logger.debug(
        'IntrospectionProvider: No access token found in request.',
      );
      return null;
    }

    // Get introspection for the access token
    this.logger.debug(
      'IntrospectionProvider: Request contains access token. Performing introspection...',
    );
    const introspection =
      await this.introspectionClient.getIntrospectionResponse(accessToken);

    // If the token is expired or revoked, access is denied
    if (!introspection.active) {
      this.logger.log(
        'IntrospectionProvider: Provided token is expired or revoked.',
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

    // If the token does not have a subject or client ID, access is denied
    if (!introspection.sub || !introspection.client_id) {
      this.logger.error(
        'IntrospectionProvider: Token introspection does not contain a subject or client ID.',
      );
      return null;
    }

    // Determine the resource owner type
    const resourceOwnerType = introspection.username.startsWith(
      'service-account-',
    ) // TODO: Is this safe to assume?
      ? ResourceOwnerType.CLIENT
      : ResourceOwnerType.USER;

    this.logger.debug(
      `IntrospectionProvider: Token is valid, resource owner type is ${resourceOwnerType}`,
    );

    // Write the token introspection to the request object
    const intro: Introspection = {
      authenticated: true as const,
      sub: introspection.sub,
      subType: resourceOwnerType,
      scopes: introspection.scope.split(' '),
      clientId: introspection.client_id,
    };

    (request as RequestWithIntrospection).introspection = intro;

    return intro;
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
}
