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
    connectToDevTools: process.env.VEGA_ENV === 'development',
    cache: new InMemoryCache({
      dataIdFromObject(obj, context) {
        // eslint-disable-next-line no-underscore-dangle
        const { id, vid, _id, __typename } = obj;

        if (typeof __typename !== 'string') {
          return undefined;
        }

        let resultId = id;

        if (context !== undefined) {
          if (id !== undefined) {
            context.keyObject = { id };
          } else if (vid !== undefined) {
            context.keyObject = { vid };
          } else if (_id !== undefined) {
            context.keyObject = { _id };
          } else {
            context.keyObject = undefined;
          }
        }

        if (_id !== undefined) {
          resultId = _id;
        }

        if (vid !== undefined) {
          resultId = vid;
        }

        if (resultId === undefined || resultId === null) {
          return undefined;
        }

        return `${__typename}:${
          typeof resultId === 'string' || typeof resultId === 'number'
            ? resultId
            : JSON.stringify(resultId)
        }`;
      },
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
