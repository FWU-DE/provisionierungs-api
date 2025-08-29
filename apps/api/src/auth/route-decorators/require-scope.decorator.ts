import { Reflector } from '@nestjs/core';

export type RecursiveArray<T> = (RecursiveArray<T> | T)[];

/**
 * This decorator limits access to a route by OAuth2 scopes.
 * Based on this decorator the RequiredScopesGuard checks if the used access token has the required scopes.
 *
 * First order array items are ORed, second order array items are ANDed.
 *
 * @example
 * ```ts
 * \@RequireScope(['this:one', ['or:both', 'of:these']])
 * // or
 * \@RequireScope('this:scope')
 * ```
 */
export const RequireScope = Reflector.createDecorator<
  string | RecursiveArray<string> | undefined
>();
