import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { Identity } from '../identity/identity';

export type GraphQLClient = ApolloClient<NormalizedCacheObject>;

type Config = {
  uri: string;
  identity: Identity;
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

const httpLink = (uri: string): ApolloLink =>
  createHttpLink({
    uri,
  });

export function createGraphqlClient(config: Config): GraphQLClient {
  const { uri, identity } = config;
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink(identity).concat(httpLink(uri)),
  });
}
