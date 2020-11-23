import { ApolloLink, execute, Observable, throwServerError, toPromise } from '@apollo/client';
import fetchMock from 'fetch-mock';

import { Identity } from '../identity';

import {
  createAuthLink,
  createErrorLink,
  createHttpLink,
  createResponseLink,
  createSwitchUriLink,
} from './graphql-client';
import { mocks, queries } from './mocks';

beforeEach(() => {
  jest.restoreAllMocks();
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

function makeCallback(done: jest.DoneCallback, body: (...args: unknown[]) => void) {
  return (...args: unknown[]) => {
    try {
      body(...args);
      done();
    } catch (error) {
      done.fail(error);
    }
  };
}

describe('client', () => {
  const data = { data: { hello: 'world' } };

  beforeEach(() => {
    fetchMock.restore();
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('меняется uri', async (done) => {
    fetchMock.post('/graphql/projectVid1', makePromise(data));

    const URI = 'graphql/';
    const PROJECT_VID = 'projectVid1';
    const CONFIG = { apiUrl: 'auth_rest', token: 'token2' };

    const uriLink = createSwitchUriLink(URI);

    const identity = new Identity(CONFIG);
    const authLink = createAuthLink(identity);

    const linkR = ApolloLink.from([authLink, uriLink]);
    const link = linkR.concat(createHttpLink());

    execute(link, {
      query: queries.sample,
      context: {
        projectVid: 'projectVid1',
      },
    }).subscribe(
      makeCallback(done, () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [uri] = fetchMock.lastCall()!;
        expect(uri).toBe(`/${URI}${PROJECT_VID}`);
      }),
    );
  });

  it('не меняется uri', async (done) => {
    fetchMock.post('/graphql', makePromise(data));

    const URI = 'graphql';
    const CONFIG = { apiUrl: 'auth_rest', token: 'token2' };

    const uriLink = createSwitchUriLink(URI);

    const identity = new Identity(CONFIG);
    const authLink = createAuthLink(identity);

    const linkR = ApolloLink.from([authLink, uriLink]);
    const link = linkR.concat(createHttpLink());

    execute(link, {
      query: queries.sample,
    }).subscribe(
      makeCallback(done, () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [uri] = fetchMock.lastCall()!;
        expect(uri).toBe(`/${URI}`);
      }),
    );
  });
});
