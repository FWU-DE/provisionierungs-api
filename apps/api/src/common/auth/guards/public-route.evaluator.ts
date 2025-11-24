import type { ExecutionContext } from '@nestjs/common';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessTokenAuthRequired } from '../route-decorators/access-token-auth-required.decorator';
import { NoAccessTokenAuthRequired } from '../route-decorators/no-access-token-auth-required.decorator';

/**
 * This evaluator checks if a route should be accessible without authentication.
 * It checks for the following conditions:
 * - If the route has the @NoAuthRequired() decorator, access is granted
 * - If the route has the @NoAuthRequired() decorator on the class level, access is granted
 * - The @AuthRequired() decorator takes precedence over all @NoAuthRequired() decorators
 * - If no decorators are set, and Auth is not required by default, access is granted
 */
@Injectable()
export class PublicRouteEvaluator {
  private readonly isAuthRequiredByDefault: boolean = true;
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: ConsoleLogger,
  ) {}

  isAuthenticationRequired(
    context: ExecutionContext,
  ): boolean | Promise<boolean> {
    this.logger.debug(
      'PublicRouteEvaluator: Checking if requested route is public...',
    );
    const handler = context.getHandler();
    const classRef = context.getClass();

    const isAuthExplicitlyRequiredOnClassLevel = this.reflector.get(
      AccessTokenAuthRequired,
      classRef,
    );
    const isAuthExplicitlyRequiredOnMethodLevel = this.reflector.get(
      AccessTokenAuthRequired,
      handler,
    );
    const isAuthExplicitlyNotRequiredOnClassLevel = this.reflector.get(
      NoAccessTokenAuthRequired,
      classRef,
    );
    const isAuthExplicitlyNotRequiredOnMethodLevel = this.reflector.get(
      NoAccessTokenAuthRequired,
      handler,
    );

    // Decorators on the method level take precedence over decorators on the class level
    // Adding @AuthRequired() always requires authentication even if @NoAuthRequired() is set on the class or method
    if (isAuthExplicitlyRequiredOnMethodLevel) {
      this.logger.debug(
        'PublicRouteEvaluator: Route specifically marked as private on method level. Requiring authentication.',
      );
      return true;
    }
    // @NoAuthRequired() on the method level takes precedence over @AuthRequired() on the class level
    else if (isAuthExplicitlyNotRequiredOnMethodLevel) {
      this.logger.debug(
        'PublicRouteEvaluator: Route specifically marked as public on method level. No authentication required.',
      );
      return false;
    }
    // If nothing is set on the method level, check the class level
    // Adding @AuthRequired() always requires authentication even if @NoAuthRequired() is set as well
    else if (isAuthExplicitlyRequiredOnClassLevel) {
      this.logger.debug(
        'PublicRouteEvaluator: Route specifically marked as private on class level. Requiring authentication.',
      );
      return true;
    }
    // Adding @NoAuthRequired() to a class grants access.
    else if (isAuthExplicitlyNotRequiredOnClassLevel) {
      this.logger.debug(
        'PublicRouteEvaluator: Route specifically marked as public on class level. No authentication required.',
      );
      return false;
    }
    // If no explicit decorators are set, we check if Auth is required by default
    else if (this.isAuthRequiredByDefault) {
      this.logger.debug(
        'PublicRouteEvaluator: Auth is required by default, and no NoAuthRequired decorators are set. Requiring authentication.',
      );
      return true;
    }
    // If Auth is not required by default, and no explicit decorators are set, access is granted
    this.logger.debug(
      'PublicRouteEvaluator: Auth is not required by default, and no decorators are set. No authentication required.',
    );
    return false;
  }
}
