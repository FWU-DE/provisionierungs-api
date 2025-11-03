/* eslint-disable no-console */
import {
  ApolloLink,
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  HttpLink,
  Observable,
} from '@apollo/client';
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from '@apollo/client-integration-nextjs';
import { ErrorLink } from '@apollo/client/link/error';
import { type Subscriber, mergeMap } from 'rxjs';

import { getConfig } from './config';
import { verifySession } from './session';

export const { getClient: getGrahpqlClient } = registerApolloClient(() => {
  const authMiddleware = new ApolloLink((operation: ApolloLink.Operation, forward) => {
    return new Observable((observer: Subscriber<ApolloLink.Operation>) => {
      verifySession()
        .then((session) => {
          operation.setContext({ headers: { Authorization: `Bearer ${session.accessToken}` } });
          observer.next(operation);
          observer.complete();
        })
        .catch(console.error);
    }).pipe(
      mergeMap((op) => {
        return forward(op);
      }),
    );
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new ErrorLink(({ error }) => {
      if (CombinedGraphQLErrors.is(error)) {
        error.errors.forEach(({ message, locations, path }) => {
          console.log(
            // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          );
        });
      } else if (CombinedProtocolErrors.is(error)) {
        error.errors.forEach(({ message, extensions }) => {
          console.log(
            `[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`,
          );
        });
      } else {
        console.error(`[Network error]: ${error.message}`);
      }
    })
      .concat(authMiddleware)
      .concat(
        new HttpLink({
          uri: getConfig().apiBaseUrl + '/graphql',
        }),
      ),
  });
});
