import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  from,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { BrowserMessageBus } from '../../message-bus';
import { Identity } from '../identity/identity';

export type GraphQLClient = ApolloClient<NormalizedCacheObject>;

type Config = {
  uri: string;
  identity: Identity;
  bus: BrowserMessageBus;
};

const authLink = (identity: Identity): ApolloLink => {
  return setContext((_, { headers }) => {
    const token = identity.getToken();
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    };
  });
};

const responseLink = (bus: BrowserMessageBus) =>
  new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
      if (response.data && response.data.data) {
        const { code, __typename: typename } = response.data.data;
        if (typename === 'Error' && code === 'PROJECT_NOT_FOUND') {
          // bus.send({ channel: 'project', topic: 'project-not-found', self: true });
        }
      }

      return response;
    });
  });

const httpLink = (uri: string): ApolloLink =>
  createHttpLink({
    uri,
  });

export function createGraphqlClient(config: Config): GraphQLClient {
  const { uri, identity, bus } = config;
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([responseLink(bus), authLink(identity).concat(httpLink(uri))]),
  });
}
