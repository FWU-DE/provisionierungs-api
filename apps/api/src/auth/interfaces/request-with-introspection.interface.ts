import type { Request } from 'express';
import z from 'zod';
import type { ResourceOwnerType } from '../enums/resource-owner-type.enum';

export type KeycloakIntrospection =
  | { active: false }
  | {
      active: true;
      scope: string;
      client_id: string;
      sub: string;
      username: string;
      typ: 'Bearer' | 'ID';
    };

export const keycloakIntrospectionSchema = z.discriminatedUnion('active', [
  z.object({ active: z.literal(false) }),
  z.object({
    active: z.literal(true),
    scope: z.string(),
    client_id: z.string(),
    sub: z.string(),
    username: z.string(),
    typ: z.enum(['Bearer', 'ID']),
  }),
]);

export type Introspection = {
  authenticated: true;
  sub: string;
  subType: ResourceOwnerType;
  scopes: string[];
  clientId: string;
};

export interface RequestWithIntrospection extends Request {
  introspection: Introspection;
}

export type RequestMaybeContainingIntrospection =
  | Request
  | RequestWithIntrospection;

export function isRequestWithIntrospection(
  request: RequestMaybeContainingIntrospection,
): request is RequestWithIntrospection {
  return 'introspection' in (request as RequestWithIntrospection);
}
