import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ResourceOwnerType } from '../enums/resource-owner-type.enum';
import type { RequestMaybeContainingIntrospection } from '../interfaces/request-with-introspection.interface';
import { AllowResourceOwnerType } from '../route-decorators/allow-resource-owner-type.decorator';
import { transformIntoExpressContext } from '../util/graphql/express-context';
import { IntrospectionProvider } from '../introspection/introspection.provider';
import { PublicRouteEvaluator } from './public-route.evaluator';

@Injectable()
export class AllowedResourceOwnerTypesGuard implements CanActivate {
  private readonly defaultAllowedResourceOwnerTypes = [ResourceOwnerType.USER];
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: ConsoleLogger,
    private readonly introspectionProvider: IntrospectionProvider,
    private readonly publicRouteEvaluator: PublicRouteEvaluator,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.publicRouteEvaluator.isAuthenticationRequired(context)) {
      return true;
    }

    this.logger.debug(
      'AllowedResourceOwnerTypesGuard: Checking if resource owner type is allowed to access route...',
    );
    const handler = context.getHandler();
    const classRef = context.getClass();

    const allowedResourceOwnerTypes =
      this.reflector.getAllAndOverride(AllowResourceOwnerType, [
        handler,
        classRef,
      ]) ?? this.defaultAllowedResourceOwnerTypes;
    const allowedResourceOwnerTypesArray = Array.isArray(
      allowedResourceOwnerTypes,
    )
      ? allowedResourceOwnerTypes
      : [allowedResourceOwnerTypes];

    // Check if the resource owner type is allowed
    const introspection = await this.introspectionProvider.getIntrospection(
      this.getRequest(context),
    );
    if (!introspection) {
      this.logger.debug(
        'AllowedResourceOwnerTypesGuard: No access token given. Proceeding.',
      );
      return true;
    }
    const accessAllowed = allowedResourceOwnerTypesArray.includes(
      introspection.subType,
    );
    if (!accessAllowed) {
      this.logger.log(
        'AllowedResourceOwnerTypesGuard: Resource owner type is not allowed on request route. Denying access.',
      );
      this.logger.debug(
        `AllowedResourceOwnerTypesGuard: Allowed resource owner types: ${allowedResourceOwnerTypesArray.join(
          ', ',
        )}. Requested: ${introspection.subType}`,
      );
      return false;
    }

    this.logger.debug(
      'AllowedResourceOwnerTypesGuard: Resource owner type is allowed',
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
}
