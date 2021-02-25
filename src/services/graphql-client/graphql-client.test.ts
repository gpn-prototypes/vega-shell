import { FetchResult, gql, throwServerError } from '@apollo/client';
import { ErrorResponse } from '@apollo/client/link/error';
import fetchMock from 'fetch-mock';

import { makePromise } from '../../testing/make-promise';
import { Identity } from '../identity';
import { mockValidToken } from '../identity/tokenHandlers';

import {
  createGraphqlClient,
  getParsedError,
  GraphQLClientConfig,
  isServerParseError,
} from './graphql-client';
import { mocks, queries } from './mocks';

beforeEach(() => {
  jest.restoreAllMocks();
  fetchMock.restore();
});

afterEach(() => {
  fetchMock.restore();
});

const PROJECT_VID = 'projectVid';

const URI = '/graphql-uri';

const fetchResult: FetchResult = { data: { foo: 'bar' } };

const createMockClient = (config?: Partial<GraphQLClientConfig>) =>
  createGraphqlClient({
    onError: jest.fn(),
    uri: URI,
    identity: new Identity({ apiUrl: '/api' }),
    currentProject: {
      get: jest.fn().mockReturnValue(null),
      setVersion: jest.fn(),
    },
    ...config,
  });

describe('createGraphqlClient', () => {
  test('выставляет хедер Authorization при наличии токена', async () => {
    fetchMock.post(`${URI}`, makePromise(fetchResult));

    const defaultIdentity = new Identity({
      apiUrl: '/api',
      accessToken: mockValidToken(),
      refreshToken: mockValidToken(),
    });

    const client = createMockClient({ identity: defaultIdentity });

    await client.query({
      query: queries.sample,
    });

    const token = await defaultIdentity.getAccessToken();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastCall = fetchMock.lastCall()!;
    const [, request] = lastCall;

    expect(request?.headers).toMatchObject({
      Authorization: `Bearer ${token}`,
    });
  });

  test('меняет uri, если в контексте содержится projectVid', async () => {
    fetchMock.post(`${URI}/${PROJECT_VID}`, makePromise(fetchResult));

    const client = createMockClient();

    await client.query({
      query: queries.sample,
      context: {
        projectVid: PROJECT_VID,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastCall = fetchMock.lastCall()!;
    const [url] = lastCall;

    expect(url).toBe(`${URI}/${PROJECT_VID}`);
  });

  test('обрабатывает 500 ошибку', async () => {
    const onError = jest.fn();

    fetchMock.post(URI, () => {
      return throwServerError({ status: 500, ok: false } as Response, {}, 'Internal server error');
    });

    const client = createMockClient({
      onError,
    });

    await expect(
      client.query({
        query: queries.sample,
      }),
    ).rejects.toThrow();

    expect(onError).toBeCalledWith({ code: 500, message: 'internal-server-error' });
  });

  test('обрабатывает 401 ошибку', async () => {
    const onError = jest.fn();

    fetchMock.post(URI, () => {
      return throwServerError({ status: 401, ok: false } as Response, {}, 'Unauthorized');
    });

    const client = createMockClient({
      onError,
    });

    await expect(
      client.query({
        query: queries.sample,
      }),
    ).rejects.toThrow();

    expect(onError).toBeCalledWith({ code: 401, message: 'unauthorized' });
  });

  test('корректно возвращает ответ с сервера', async () => {
    fetchMock.post(URI, { data: mocks.projectResponse });

    const client = createMockClient();

    const response = await client.query({ query: queries.GET_PROJECT });

    expect(response).toMatchObject({ data: mocks.projectResponse });
  });

  describe('конкурентный доступ', () => {
    const errorTypename = 'TestError';

    test('решает конфликты', async () => {
      let attempt = 1;
      let data = {};
      const vid = 'test-vid';

      const expectedResponse = {
        data: {
          testMutationOne: {
            vid,
            foo: 'foo_2',
            bar: 'bar_1',
            version: 3,
            __typename: 'Test',
          },
        },
      };

      fetchMock.post(URI, () => {
        if (attempt === 1) {
          attempt += 1;
          data = {
            testMutationOne: {
              remote: {
                vid,
                foo: 'foo_1',
                bar: 'bar_1',
                version: 2,
                __typename: 'Test',
              },
              __typename: errorTypename,
            },
          };
        }

        if (attempt === 2) {
          data = { ...expectedResponse.data };
        }

        return { data };
      });

      const mutation = gql`
        fragment testData on TestData {
          vid
          version
          foo
          bar
        }
        mutation TestMutation($foo: String!, $version: Int!) {
          testMutationOne(foo: $foo, version: $version) {
            ... on TestData {
              ...testData
            }
            ... on ${errorTypename} {
              remote {
                ...testData
              }
            }
          }
        }
      `;

      const client = createMockClient();

      const variables = {
        vid,
        foo: 'foo_2',
        version: 1,
      };

      const result = await client.mutate({
        mutation,
        variables,
        context: {
          projectDiffResolving: {
            errorTypename,
            projectAccessor: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fromDiffError(mutationResult: any) {
                return {
                  remote: mutationResult.data,
                  local: {
                    vid,
                    foo: 'foo',
                    bar: 'bar',
                    version: 1,
                  },
                };
              },
            },
          },
        },
      });

      expect(result).toEqual(expectedResponse);
    });

    test('выбрасывает иключение, если не передан projectAccessor.fromDiffError', async () => {
      let attempt = 1;
      let data = {};
      const vid = 'test-vid';

      const expectedResponse = {
        data: {
          testMutationOne: {
            vid,
            foo: 'foo_2',
            bar: 'bar_1',
            version: 3,
            __typename: 'Test',
          },
        },
      };

      fetchMock.post(URI, () => {
        if (attempt === 1) {
          attempt += 1;
          data = {
            testMutationOne: {
              remote: {
                vid,
                foo: 'foo_1',
                bar: 'bar_1',
                version: 2,
                __typename: 'Test',
              },
              __typename: errorTypename,
            },
          };
        }

        if (attempt === 2) {
          data = { ...expectedResponse.data };
        }

        return { data };
      });

      const mutation = gql`
        fragment testData on TestData {
          vid
          version
          foo
          bar
        }

        mutation TestMutation($foo: String!, $version: Int!) {
          testMutationOne(foo: $foo, version: $version) {
            ... on TestData {
              ...testData
            }
            ... on ${errorTypename} {
              remote {
                ...testData
              }
            }
          }
        }
      `;

      const client = createMockClient();

      const variables = {
        vid,
        foo: 'foo_2',
        version: 1,
      };

      const result = client.mutate({
        mutation,
        variables,
        context: {
          projectDiffResolving: {
            errorTypename,
          },
        },
      });

      await expect(result).rejects.toThrow();
    });
  });

  test('корректно парсит ошибку', async () => {
    fetchMock.mock(URI, { status: 404, body: 'not-found' });

    const client = createMockClient();

    try {
      await client.query({
        query: queries.sample,
      });
    } catch (err) {
      expect(err.networkError.bodyText).toBe('not-found');
    }
  });
});

describe('isServerParseError', () => {
  test('возвращает true, если в имени ошибки содержится ServerParseError', () => {
    expect(
      isServerParseError({
        name: 'ServerParseError',
        message: 'server-parse-error',
      }),
    ).toBeTruthy();
  });

  test('возвращает false, если ошибка равна undefined', () => {
    expect(isServerParseError(undefined)).not.toBeTruthy();
  });

  test('возвращает false, если имя ошибки не ServerParseError', () => {
    expect(
      isServerParseError({
        name: 'ValidationError',
        message: 'validation-error',
      }),
    ).not.toBeTruthy();
  });
});

describe('getParsedError', () => {
  test('обрабатывает некорректную ошибку', () => {
    const bodyText = 'sample text';
    const error: ErrorResponse = {
      networkError: {
        name: 'ServerParseError',
        message: 'server-parse-error',
        bodyText,
      },
      forward: jest.fn(),
      operation: {
        query: queries.sample,
        variables: {},
        operationName: 'GET_SAMPLE',
        setContext: jest.fn(),
        getContext: jest.fn(),
        extensions: [],
      },
    };

    const parsedError = getParsedError(error);

    expect(parsedError.networkError?.message).toBe(bodyText);
  });
});
