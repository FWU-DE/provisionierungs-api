import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import type { RequestMaybeContainingIntrospection } from '../interfaces/request-with-introspection.interface';
import { isRequestWithIntrospection } from '../interfaces/request-with-introspection.interface';
import { transformIntoExpressContext } from '../util/graphql/express-context';

/**
 * @returns string
 */
export const Sub = createParamDecorator<never, string>((_, context: ExecutionContext) => {
  const req = transformIntoExpressContext<RequestMaybeContainingIntrospection>(context).req;
  const sub = isRequestWithIntrospection(req) ? req.introspection.sub : undefined;
  if (!sub) {
    throw new Error('ParamDecorator Sub: Cannot get sub from request');
  }
  return sub;
});
