import {
  ApolloClient,
  ApolloLink,
  createHttpLink as createApolloHttpLink,
  from,
  HttpOptions,
  InMemoryCache,
  NormalizedCacheObject,
  ServerParseError,
  StoreObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ErrorResponse, onError } from '@apollo/client/link/error';

import { Identity } from '../identity/identity';

import { ProjectDiffResolverLink } from './project-diff-resolver';

export type GraphQLClient = ApolloClient<NormalizedCacheObject>;
export type ServerError = {
  code: number;
  message: string;
  userMessage?: string;
};

export type GraphQLClientError = Error | ServerError | ServerParseError | undefined;

export const notFoundErrorUserMessage = `Ошибка 404. Страница не найдена.
  Обратитесь в службу технической поддержки`;

export type ErrorHandler = (error: ServerError) => void;

export type GraphQLClientConfig = {
  uri: string;
  identity: Identity;
  fetch?: HttpOptions['fetch'];
  onError: ErrorHandler;
};

type ResponseLinkConfig = {
  handleError: ErrorHandler;
};

export const getDataIdFromObject = (
  obj: Readonly<StoreObject>,
  context: { keyObject?: Record<string, unknown> },
): string | undefined => {
  // eslint-disable-next-line no-underscore-dangle
  const { id, vid, _id, __typename } = obj;

  if (typeof __typename !== 'string') {
    return undefined;
  }

  let resultId = id;

  // istanbul ignore else
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

export const isServerParseError = (
  error: Error | ServerError | ServerParseError | undefined,
): error is ServerParseError => {
  return error !== undefined && 'name' in error && error.name === 'ServerParseError';
};

export const getParsedError = (error: ErrorResponse): ErrorResponse => {
  const apolloError = { ...error };
  if (isServerParseError(apolloError.networkError)) {
    try {
      JSON.parse(apolloError.networkError.bodyText);
    } catch (e) {
      // eslint-disable-next-line no-param-reassign
      apolloError.networkError.message = apolloError.networkError.bodyText;
    }
  }

  return apolloError;
};

export const createErrorLink = (config: ResponseLinkConfig): ApolloLink =>
  onError((apolloError) => {
    const error = getParsedError(apolloError);
    // istanbul ignore else
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

      if (error.networkError.statusCode === 404) {
        config.handleError({
          code: 404,
          message: 'not-found',
          userMessage: notFoundErrorUserMessage,
        });
      }
    }
    return error.forward(error.operation);
  });

export const createResponseLink = (config: ResponseLinkConfig): ApolloLink =>
  new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
      if (response.data && response.data.project) {
        const { code, __typename: typename } = response.data.project;

        if (typename === 'Error' && code === 'PROJECT_NOT_FOUND') {
          config.handleError({
            code: 404,
            message: 'not-found',
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

export const createProjectDiffResolverLink = (): ApolloLink => {
  return new ProjectDiffResolverLink({
    maxAttempts: 20,
    errorTypename: 'UpdateProjectDiff',
  });
};

export function createGraphqlClient(config: GraphQLClientConfig): GraphQLClient {
  const { uri, identity, onError: handleError, fetch } = config;
  return new ApolloClient({
    connectToDevTools: process.env.VEGA_ENV === 'development',
    cache: new InMemoryCache({
      dataIdFromObject: getDataIdFromObject,
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
      createProjectDiffResolverLink(),
      createAuthLink(identity),
      createHttpLink({ fetch }),
    ]),
  });
}
