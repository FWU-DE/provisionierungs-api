import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConsoleLogger, Injectable } from '@nestjs/common';

import type { RequestMaybeContainingIntrospection } from '../interfaces/request-with-introspection.interface';
import { transformIntoExpressContext } from '../util/graphql/express-context';
import { IntrospectionProvider } from '../introspection/introspection.provider';
import { PublicRouteEvaluator } from './public-route.evaluator';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly publicRouteEvaluator: PublicRouteEvaluator,
    private readonly logger: ConsoleLogger,
    private readonly introspectionProvider: IntrospectionProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route can be accessed without authentication
    const isAuthenticationRequired =
      await this.publicRouteEvaluator.isAuthenticationRequired(context);
    if (!isAuthenticationRequired) {
      this.logger.debug(
        'AccessTokenGuard: Route does not require authentication. Allowing access.',
      );
      return true;
    }

    const introspection = await this.introspectionProvider.getIntrospection(
      this.getRequest<RequestMaybeContainingIntrospection>(context),
    );
    if (introspection === null) {
      this.logger.error(
        'AccessTokenGuard: Access token is invalid. Denying access.',
      );
      return false;
    }

    this.logger.debug(
      'AccessTokenGuard: Provided access token is valid and all details were added to request object. Allowing access.',
    );
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  private getRequest<T>(context: ExecutionContext): T {
    return transformIntoExpressContext<T>(context).req;
  }
}
