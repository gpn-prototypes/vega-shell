import {
  ApolloLink,
  execute,
  FetchResult,
  Observable,
  throwServerError,
  toPromise,
} from '@apollo/client';
import fetchMock from 'fetch-mock';

import { Identity } from '../identity';

import {
  createAuthLink,
  createErrorLink,
  createHttpLink,
  createResponseLink,
  createSwitchUriLink,
  normalizeUri,
} from './graphql-client';
import { mocks, queries } from './mocks';

beforeEach(() => {
  jest.restoreAllMocks();
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

    expect(handleError).toBeCalledWith({ code: 404, message: 'project-not-found' });
  });
});

describe('errorLink', () => {
  test('обрабатывает 500 ошибку', async () => {
    const handleError = jest.fn();
    const errorLink = createErrorLink({ handleError });

    const stub = jest.fn(() =>
      throwServerError({ status: 500, ok: false } as Response, {}, 'Internal server error'),
    ) as never;

    const link = ApolloLink.from([errorLink, stub]);

    try {
      await toPromise(
        execute(link, {
          query: queries.GET_PROJECT,
        }),
      );
    } catch {
      expect(handleError).toBeCalledWith({ code: 500, message: 'internal-server-error' });
    }
  });
});

function makePromise(res: unknown) {
  return new Promise((resolve) => setTimeout(() => resolve(res)));
}

describe('client', () => {
  const data: FetchResult = { data: { hello: 'world' } };

  beforeEach(() => {
    fetchMock.restore();
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('меняется uri', async () => {
    fetchMock.post('/graphql/projectVid1', makePromise(data));

    const URI = 'graphql';
    const PROJECT_VID = 'projectVid1';
    const CONFIG = { apiUrl: '/auth', token: 'test-token' };

    const uriLink = createSwitchUriLink(URI);

    const identity = new Identity(CONFIG);
    const authLink = createAuthLink(identity);

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
    const CONFIG = { apiUrl: '/auth', token: 'test-token' };

    const uriLink = createSwitchUriLink(URI);

    const identity = new Identity(CONFIG);
    const authLink = createAuthLink(identity);

    const link = ApolloLink.from([authLink, uriLink, createHttpLink()]);

    await toPromise(execute(link, { query: queries.sample }));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [uri] = fetchMock.lastCall()!;
    expect(uri).toBe('/graphql');
  });
});
