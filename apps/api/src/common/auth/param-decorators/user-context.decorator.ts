import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import type { RequestMaybeContainingIntrospection } from '../interfaces/request-with-introspection.interface';
import { isRequestWithIntrospection } from '../interfaces/request-with-introspection.interface';
import { transformIntoExpressContext } from '../util/graphql/express-context';

export interface UserContext {
  sub: string;
  heimatorganisation: string;
  schulkennung: string[];
}

export const UserCtx = createParamDecorator<never, UserContext>((_, context: ExecutionContext) => {
  const req = transformIntoExpressContext<RequestMaybeContainingIntrospection>(context).req;

  if (!isRequestWithIntrospection(req)) {
    throw new Error('ParamDecorator UserCtx: Cannot get UserContext from request');
  }
  const introspection = req.introspection;
  if (!introspection.heimatorganisation || !introspection.schulkennung) {
    throw new Error(
      'ParamDecorator UserCtx: heimatorganisation or schulkennung missing in introspection',
    );
  }

  return {
    sub: introspection.sub,
    heimatorganisation: introspection.heimatorganisation,
    schulkennung: introspection.schulkennung,
  };
});
