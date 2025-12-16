import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import type { RequestMaybeContainingIntrospection } from '../interfaces/request-with-introspection.interface';
import { isRequestWithIntrospection } from '../interfaces/request-with-introspection.interface';
import { transformIntoExpressContext } from '../util/graphql/express-context';

/**
 * @returns string | undefined
 */
export const SubOptional = createParamDecorator<never, string | undefined>(
  (_, context: ExecutionContext) => {
    const req = transformIntoExpressContext<RequestMaybeContainingIntrospection>(context).req;
    return isRequestWithIntrospection(req) ? req.introspection.sub : undefined;
  },
);
