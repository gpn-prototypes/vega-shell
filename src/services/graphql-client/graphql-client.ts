import {
  ApolloClient,
  ApolloLink,
  createHttpLink as createApolloHttpLink,
  from,
  HttpOptions,
  NormalizedCacheObject,
  Observable,
  ServerParseError,
} from '@apollo/client';
import { ErrorResponse, onError } from '@apollo/client/link/error';

import { Identity } from '../identity/identity';

import { Cache, createCache } from './cache';
import { ProjectDiffResolverLink } from './project-diff-resolver';
import { CurrentProject, ProjectVersionSyncerLink } from './project-version-syncer';
import { normalizeUri } from './utils';

export type GraphQLClient = ApolloClient<NormalizedCacheObject>;
export type ServerError = {
  code: number;
  message: string;
  userMessage?: string;
};

export type GraphQLClientError = Error | ServerError | ServerParseError | undefined;

export type ErrorHandler = (error: ServerError) => void;

export type GraphQLClientConfig = {
  uri: string;
  identity: Identity;
  currentProject: CurrentProject;
  fetch?: HttpOptions['fetch'];
  link?: ApolloLink;
  onError: ErrorHandler;
};

type ResponseLinkConfig = {
  handleError: ErrorHandler;
};

export const createAuthLink = (identity: Identity): ApolloLink =>
  new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      const subscriptions = new Set<ZenObservable.Subscription>();

      const unsubscribe = () => {
        subscriptions.forEach((sub) => {
          sub.unsubscribe();
        });
      };

      identity.getToken().then((token) => {
        if (token === null) {
          const error = { statusCode: 401 };

          observer.error(error);
          return;
        }

        operation.setContext((context: Record<string, unknown>) => ({
          ...context,
          headers: {
            ...(context.headers as Record<string, string>),
            Authorization: `Bearer ${token}`,
          },
        }));

        const sub = forward(operation).subscribe({
          next(value) {
            observer.next(value);
          },
          error(errorValue) {
            observer.error(errorValue);
          },
          complete() {
            observer.complete();
          },
        });

        subscriptions.add(sub);
      });

      return unsubscribe;
    });
  });

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
    }

    return error.forward(error.operation);
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

const createProjectVersionSyncerLink = (params: {
  cache: Cache;
  currentProject: CurrentProject;
}): ApolloLink => {
  return new ProjectVersionSyncerLink({
    cache: params.cache,
    currentProject: params.currentProject,
  });
};

export function createGraphqlClient(config: GraphQLClientConfig): GraphQLClient {
  const { uri, identity, onError: handleError, fetch, currentProject } = config;
  const cache = createCache();
  return new ApolloClient({
    connectToDevTools: process.env.VEGA_ENV === 'development',
    cache,
    link: from([
      createErrorLink({ handleError }),
      createSwitchUriLink(uri),
      createProjectVersionSyncerLink({ cache, currentProject }),
      createProjectDiffResolverLink(),
      createAuthLink(identity),
      config.link ?? createHttpLink({ fetch }),
    ]),
  });
}
