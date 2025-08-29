import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import type { RequestMaybeContainingIntrospection } from '../interfaces/request-with-introspection.interface';
import { isRequestWithIntrospection } from '../interfaces/request-with-introspection.interface';
import { transformIntoExpressContext } from '../util/graphql/express-context';

/**
 * @returns string
 */
export const ClientId = createParamDecorator<never, string>(
  (_, context: ExecutionContext) => {
    const req =
      transformIntoExpressContext<RequestMaybeContainingIntrospection>(
        context,
      ).req;
    const clientId = isRequestWithIntrospection(req)
      ? req.introspection.clientId
      : undefined;
    if (!clientId) {
      throw new Error(
        'ParamDecorator ClientId: Cannot get client ID from request',
      );
    }
    return clientId;
  },
);
