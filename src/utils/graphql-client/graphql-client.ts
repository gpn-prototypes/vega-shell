import {
  ApolloClient,
  ApolloLink,
  createHttpLink as createApolloHttpLink,
  from,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { Identity } from '../identity/identity';

export type GraphQLClient = ApolloClient<NormalizedCacheObject>;

export type Error = {
  code: number;
  message: string;
};

type ErrorHandler = (error: Error) => void;

type Config = {
  uri: string;
  identity: Identity;
  onError: ErrorHandler;
};

type ResponseLinkConfig = {
  handleError: ErrorHandler;
};

export const createAuthLink = (identity: Identity): ApolloLink => {
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

export const createErrorLink = (config: ResponseLinkConfig): ApolloLink =>
  onError((error) => {
    if (error.networkError && 'statusCode' in error.networkError) {
      if (error.networkError.statusCode === 500) {
        config.handleError({ code: 500, message: 'internal-server-error' });
      }
    }
  });

export const createResponseLink = (config: ResponseLinkConfig): ApolloLink =>
  new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
      if (response.data && response.data.data) {
        const { code, __typename: typename } = response.data.data;

        if (typename === 'Error' && code === 'PROJECT_NOT_FOUND') {
          config.handleError({ code: 404, message: 'project-not-found' });
        }
      }

      return response;
    });
  });

export const createHttpLink = (uri: string): ApolloLink =>
  createApolloHttpLink({
    uri,
  });

export function createGraphqlClient(config: Config): GraphQLClient {
  const { uri, identity, onError: handleError } = config;
  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Project: {
          keyFields: ['vid'],
        },
      },
    }),
    link: from([
      createResponseLink({ handleError }),
      createErrorLink({ handleError }),
      createAuthLink(identity).concat(createHttpLink(uri)),
    ]),
  });
}
