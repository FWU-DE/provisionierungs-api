import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import type { RequestMaybeContainingIntrospection } from '../interfaces/request-with-introspection.interface';
import { isRequestWithIntrospection } from '../interfaces/request-with-introspection.interface';
import { transformIntoExpressContext } from '../util/graphql/express-context';

/**
 * @returns string[]
 */
export const Scopes = createParamDecorator<never, string[]>((_, context: ExecutionContext) => {
  const req = transformIntoExpressContext<RequestMaybeContainingIntrospection>(context).req;
  const scopes = isRequestWithIntrospection(req) ? req.introspection.scopes : undefined;
  if (!scopes) {
    throw new Error('ParamDecorator Scopes: Cannot get scopes from request');
  }
  return scopes;
});
