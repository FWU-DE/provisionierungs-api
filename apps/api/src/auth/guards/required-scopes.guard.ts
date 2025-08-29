import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { RequestMaybeContainingIntrospection } from '../interfaces/request-with-introspection.interface';
import type { RecursiveArray } from '../route-decorators/require-scope.decorator';
import { RequireScope } from '../route-decorators/require-scope.decorator';
import { transformIntoExpressContext } from '../util/graphql/express-context';
import { IntrospectionProvider } from '../introspection/introspection.provider';

@Injectable()
export class RequiredScopesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: ConsoleLogger,
    private readonly introspectionProvider: IntrospectionProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug(
      'RequiredScopesGuard: Checking if all required scopes are granted for route...',
    );
    const handler = context.getHandler();
    const classRef = context.getClass();

    // Get the required scopes from the route
    const requiredScopes = this.reflector.getAllAndOverride(RequireScope, [
      handler,
      classRef,
    ]);

    // Grant access if no scopes are required
    if (!requiredScopes || requiredScopes.length === 0) {
      this.logger.debug(
        'RequiredScopesGuard: No scopes required for requested route. Allowing access.',
      );
      return true;
    }

    // Check if the required scopes are granted
    const introspection = await this.introspectionProvider.getIntrospection(
      this.getRequest(context),
    );
    if (!introspection) {
      this.logger.error(
        'RequiredScopesGuard: Access token is invalid. Denying access.',
      );
      return false;
    }

    const requiredScopesArray = Array.isArray(requiredScopes)
      ? requiredScopes
      : [requiredScopes];
    const grantedScopes = introspection.scopes;

    const canActivate = this.oneOfThem(requiredScopesArray, grantedScopes);
    if (!canActivate) {
      this.logger.log(
        'RequiredScopesGuard: Insufficient scopes to access route. Denying access.',
      );
      return false;
    }
    this.logger.debug(
      'RequiredScopesGuard: All required scopes are granted. Allowing access.',
    );
    return true;
  }

  private getRequest(
    context: ExecutionContext,
  ): RequestMaybeContainingIntrospection {
    return transformIntoExpressContext<RequestMaybeContainingIntrospection>(
      context,
    ).req;
  }

  private oneOfThem(
    requiredScopes: RecursiveArray<string>,
    grantedScopes: string[],
  ): boolean {
    return requiredScopes.some((scope) => {
      if (Array.isArray(scope)) {
        return this.allOfThem(scope, grantedScopes);
      }
      return grantedScopes.includes(scope);
    });
  }

  private allOfThem(
    requiredScopes: RecursiveArray<string>,
    grantedScopes: string[],
  ): boolean {
    return requiredScopes.every((scope) => {
      if (Array.isArray(scope)) {
        return this.oneOfThem(scope, grantedScopes);
      }
      return grantedScopes.includes(scope);
    });
  }
}
