import type { ApolloServerPlugin, BaseContext, GraphQLRequestContext } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

import { Logger } from '../logger';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  constructor(private readonly logger: Logger) {
    logger.setContext('GraphQL');
  }

  requestDidStart(context: GraphQLRequestContext<BaseContext>): Promise<void> {
    this.logger.debug(`GraphQL Query "${context.request.operationName ?? '-'}"`);

    return Promise.resolve();
  }
}
