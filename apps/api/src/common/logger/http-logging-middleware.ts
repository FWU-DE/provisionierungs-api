import type { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { Logger } from './logger';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {
    logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(`Request: ${req.url}`);
    next();
  }
}
