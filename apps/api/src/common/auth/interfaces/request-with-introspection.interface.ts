import type { Request } from 'express';

import type { ResourceOwnerType } from '../enums/resource-owner-type.enum';

export interface Introspection {
  authenticated: true;
  typ: string;
  sub: string;
  subType: ResourceOwnerType;
  scopes: string[];
  clientId: string | null;
  heimatorganisation?: string;
  schulkennung?: string[];
}

export interface RequestWithIntrospection extends Request {
  introspection: Introspection;
}

export type RequestMaybeContainingIntrospection = Request | RequestWithIntrospection;

export function isRequestWithIntrospection(
  request: RequestMaybeContainingIntrospection,
): request is RequestWithIntrospection {
  return 'introspection' in (request as RequestWithIntrospection);
}
