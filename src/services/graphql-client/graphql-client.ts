import {
  ApolloClient,
  ApolloLink,
  createHttpLink as createApolloHttpLink,
  from,
  HttpOptions,
  InMemoryCache,
  NormalizedCacheObject,
  ServerParseError,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { Identity } from '../identity/identity';

export type GraphQLClient = ApolloClient<NormalizedCacheObject>;

export type ServerError = {
  code: number;
  message: string;
  userMessage?: string;
};

export const notFoundErrorUserMessage = `Ошибка 404. Страница не найдена.
  Обратитесь в службу технической поддержки`;

type ErrorHandler = (error: ServerError) => void;

type Config = {
  uri: string;
  identity: Identity;
  onError: ErrorHandler;
};

type ResponseLinkConfig = {
  handleError: ErrorHandler;
};

export function normalizeUri(uri: string): string {
  const trimSlashRegxp = /^\/|\/$/g;
  const trimmed = uri.replace(trimSlashRegxp, '').trim();
  let protocol = '';
  let path = trimmed;

  if (trimmed.startsWith('http')) {
    [protocol, path] = trimmed.split('://');
  }

  path = path.replace(/\/{2,}/g, '/').replace(trimSlashRegxp, '');

  if (protocol !== '') {
    return `${protocol}://${path}`;
  }

  return `/${path}`;
}

export const createAuthLink = (identity: Identity): ApolloLink => {
  return setContext(async (_, { headers }) => {
    const token = await identity.getToken();

    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    };
  });
};

const isServerParseError = (
  error: Error | ServerError | ServerParseError | undefined,
): error is ServerParseError => {
  return error !== undefined && 'name' in error && error.name === 'ServerParseError';
};

export const createErrorLink = (config: ResponseLinkConfig): ApolloLink =>
  onError((error) => {
    if (isServerParseError(error.networkError)) {
      try {
        JSON.parse(error.networkError.bodyText);
      } catch (e) {
        // eslint-disable-next-line no-param-reassign
        error.networkError.message = error.networkError.bodyText;
      }
    }

    if (error.networkError && 'statusCode' in error.networkError) {
      if (error.networkError.statusCode === 500) {
        config.handleError({
          code: 500,
          message: 'internal-server-error',
        });
      }

      if (error.networkError.statusCode === 401) {
        config.handleError({ code: 401, message: 'unauthorized' });
      }
    }
  });

export const createResponseLink = (config: ResponseLinkConfig): ApolloLink =>
  new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
      if (response.data && response.data.project) {
        const { code, __typename: typename } = response.data.project;

        if (typename === 'Error' && code === 'PROJECT_NOT_FOUND') {
          config.handleError({
            code: 404,
            message: 'project-not-found',
            userMessage: notFoundErrorUserMessage,
          });
        }
      }

      return response;
    });
  });

export const createHttpLink = (options?: HttpOptions): ApolloLink => {
  return createApolloHttpLink(options);
};

export const createSwitchUriLink = (uri: string): ApolloLink =>
  new ApolloLink((operation, forward) => {
    const { projectVid, uri: contextUri } = operation.getContext();

    operation.setContext({
      uri: contextUri ?? normalizeUri(`/${uri}/${projectVid || ''}`),
    });

    return forward(operation);
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
      createSwitchUriLink(uri),
      createAuthLink(identity),
      createHttpLink(),
    ]),
  });
}