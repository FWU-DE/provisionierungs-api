import type { ExecutionContext } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import type { GqlContextType } from '@nestjs/graphql';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request, Response } from 'express';

export interface ExpressContext<REQ = Request, RES = Response> {
  req: REQ;
  res: RES;
}

export type GqlContext = ExpressContext;

export function createContext({ req, res }: ExpressContext): GqlContext {
  return {
    req,
    res,
  };
}

/**
 * Helper function to transform a GraphQL ExecutionContext into an Express Request (that contains the user).
 */
export function transformIntoExpressContext<REQ = Request, RES = Response>(
  context: ExecutionContext,
): ExpressContext<REQ, RES> {
  let ctx: ExecutionContext;
  if (context.getType<GqlContextType>() === 'graphql') {
    const gqlContext = GqlExecutionContext.create(context);
    const { req, res } = gqlContext.getContext<ExpressContext>();
    ctx = new ExecutionContextHost([req, res]);
  } else {
    ctx = context;
  }

  const req = ctx.switchToHttp().getRequest<REQ>();
  const res = ctx.switchToHttp().getResponse<RES>();

  return { res, req };
}
