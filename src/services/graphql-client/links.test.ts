import {
  ApolloLink,
  execute,
  FetchResult,
  Observable,
  throwServerError,
  toPromise,
} from '@apollo/client';
import fetchMock from 'fetch-mock';

import { makePromise } from '../../testing/make-promise';
import { Identity } from '../identity';
import { mockValidToken } from '../identity/tokenHandlers';

import {
  createAuthLink,
  createErrorLink,
  createHttpLink,
  createResponseLink,
  createSwitchUriLink,
  ErrorHandler,
  normalizeUri,
  notFoundErrorUserMessage,
} from './graphql-client';
import { mocks, queries } from './mocks';

const validToken = mockValidToken();

const makeErrorLink = (error: {
  status: number;
  message: string;
}): { link: ApolloLink; handler: ErrorHandler } => {
  const handleError = jest.fn();

  const errorLink = createErrorLink({ handleError });

  const stub = jest.fn(() =>
    throwServerError({ status: error.status, ok: false } as Response, {}, error.message),
  ) as never;

  const link = ApolloLink.from([errorLink, stub]);

  return { link, handler: handleError };
};

const tokens = {
  'access-token': validToken,
  'refresh-token': validToken,
};

beforeEach(() => {
  jest.restoreAllMocks();
  fetchMock.restore();
});

afterEach(() => {
  fetchMock.restore();
});

describe('normalizeUri', () => {
  test('удалает последний слэш', () => {
    expect(normalizeUri('/test/')).toBe('/test');
  });

  test('удаляет повторения слэшей', () => {
    expect(normalizeUri('//test///foo/bar///')).toBe('/test/foo/bar');
  });

  test('учитывает протокол', () => {
    expect(normalizeUri('/http:///foo.bar//graphql')).toBe('http://foo.bar/graphql');
  });
});

describe('responseLink', () => {
  test('обрабатывает 404 ошибку', async () => {
    const handleError = jest.fn();

    const responseLink = createResponseLink({ handleError });

    const stub = jest.fn(() => Observable.of(mocks.projectNotFoundError)) as never;

    const link = ApolloLink.from([responseLink, stub]);

    await toPromise(
      execute(link, {
        query: queries.GET_PROJECT,
      }),
    );

    expect(handleError).toBeCalledWith({
      code: 404,
      message: 'not-found',
      userMessage: notFoundErrorUserMessage,
    });
  });

  test('возвращает response', async () => {
    const handleError = jest.fn();

    const responseLink = createResponseLink({ handleError });

    const stub = jest.fn(() => Observable.of(mocks.projectResponse)) as never;

    const link = ApolloLink.from([responseLink, stub]);

    const result = await toPromise(
      execute(link, {
        query: queries.GET_PROJECT,
      }),
    );

    expect(result).toEqual(mocks.projectResponse);
  });
});

describe('errorLink', () => {
  test('обрабатывает 500 ошибку', async () => {
    const { link, handler: handleError } = makeErrorLink({
      status: 500,
      message: 'Internal server error',
    });

    await expect(
      toPromise(
        execute(link, {
          query: queries.GET_PROJECT,
        }),
      ),
    ).rejects.toThrow();

    expect(handleError).toBeCalledWith({
      code: 500,
      message: 'internal-server-error',
    });
  });

  test('обрабатывает 404 ошибку', async () => {
    const { link, handler: handleError } = makeErrorLink({ status: 404, message: 'Not found' });

    try {
      await toPromise(
        execute(link, {
          query: queries.GET_PROJECT,
        }),
      );
    } catch {
      expect(handleError).toBeCalledWith({
        code: 404,
        message: 'not-found',
        userMessage: notFoundErrorUserMessage,
      });
    }
  });

  test('обрабатывает 401 ошибку', async () => {
    const { link, handler: handleError } = makeErrorLink({ status: 401, message: 'Unauthorized' });

    await expect(
      toPromise(
        execute(link, {
          query: queries.GET_PROJECT,
        }),
      ),
    ).rejects.toThrow();

    expect(handleError).toBeCalledWith({
      code: 401,
      message: 'unauthorized',
    });
  });
});

describe('switchUriLink', () => {
  const data: FetchResult = { data: { hello: 'world' } };

  it('меняется uri', async () => {
    fetchMock.post('/graphql/projectVid1', makePromise(data));

    const URI = 'graphql';
    const PROJECT_VID = 'projectVid1';
    const CONFIG = {
      apiUrl: '/auth',
      accessToken: tokens['access-token'],
      refreshToken: tokens['refresh-token'],
    };

    const uriLink = createSwitchUriLink(URI);

    const identity = new Identity(CONFIG);
    const authLink = createAuthLink(identity, { handleError: () => {} });

    const link = ApolloLink.from([authLink, uriLink, createHttpLink()]);

    await toPromise(
      execute(link, {
        query: queries.sample,
        context: {
          projectVid: PROJECT_VID,
        },
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [uri] = fetchMock.lastCall()!;
    expect(uri).toBe('/graphql/projectVid1');
  });

  it('не меняется uri', async () => {
    fetchMock.post('/graphql', makePromise(data));

    const URI = 'graphql';
    const CONFIG = {
      apiUrl: '/auth',
      accessToken: tokens['access-token'],
      refreshToken: tokens['refresh-token'],
    };

    const uriLink = createSwitchUriLink(URI);

    const identity = new Identity(CONFIG);
    const authLink = createAuthLink(identity, { handleError: () => {} });

    const link = ApolloLink.from([authLink, uriLink, createHttpLink()]);

    await toPromise(execute(link, { query: queries.sample }));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [uri] = fetchMock.lastCall()!;
    expect(uri).toBe('/graphql');
  });

  it('если uri передан в контексте, то projectVid не учитывается', async () => {
    fetchMock.post('/context-graphql-uri', makePromise(data));

    const URI = 'graphql';
    const CONFIG = {
      apiUrl: '/auth',
      accessToken: tokens['access-token'],
      refreshToken: tokens['refresh-token'],
    };

    const uriLink = createSwitchUriLink(URI);

    const identity = new Identity(CONFIG);
    const authLink = createAuthLink(identity, { handleError: () => {} });

    const link = ApolloLink.from([authLink, uriLink, createHttpLink()]);

    await toPromise(
      execute(link, {
        query: queries.sample,
        context: { projectVid: 'test-vid', uri: '/context-graphql-uri' },
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [uri] = fetchMock.lastCall()!;
    expect(uri).toBe('/context-graphql-uri');
  });
});

describe('authLink', () => {
  test('при наличии токена он проставляется в запрос', async () => {
    const data: FetchResult = { data: { hello: 'world' } };

    fetchMock.post('/context-graphql-uri', makePromise(data));

    const identity = new Identity({
      apiUrl: '/api',
      accessToken: tokens['access-token'],
      refreshToken: tokens['refresh-token'],
    });

    const authLink = createAuthLink(identity, { handleError: () => {} });
    const link = ApolloLink.from([authLink, createHttpLink()]);

    await toPromise(
      execute(link, {
        query: queries.sample,
        context: { uri: '/context-graphql-uri' },
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [, request] = fetchMock.lastCall()!;
    expect(request?.headers).toMatchObject({
      Authorization: `Bearer ${tokens['access-token']}`,
    });
  });
});
