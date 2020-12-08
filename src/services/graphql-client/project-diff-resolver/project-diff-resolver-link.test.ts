import {
  ApolloLink,
  execute,
  FetchResult,
  gql,
  Observable,
  Operation,
  toPromise,
} from '@apollo/client';
import { DocumentNode, visit } from 'graphql';

import { Options, ProjectDiffResolverLink } from './project-diff-resolver-link';

interface TestData extends Record<string, unknown> {
  version: number;
}

interface DiffError {
  __typename: string;
  remote: TestData;
}

interface Response extends FetchResult {
  data: {
    test?: string;
    testMutationOne?: {
      result: TestData | DiffError;
    };
    testMutationTwo?: {
      result: TestData | DiffError;
    };
  };
}

type MockedHttpLink<T extends FetchResult> = jest.Mock<Observable<T>>;

describe('ProjectDiffResolverLink', () => {
  const errorTypename = 'TestError';

  function createResolverLink(defaults?: Partial<Options>) {
    return new ProjectDiffResolverLink({
      errorTypename,
      projectAccessor: { fromDiffError: (data) => ({ remote: data.result.remote, local: {} }) },
      ...defaults,
    });
  }

  function createHttpLink<T extends FetchResult>(
    func: (operation: Operation) => T,
  ): MockedHttpLink<T> {
    return jest.fn((operation: Operation) => {
      return Observable.of(func(operation));
    });
  }

  function createLink<R>(httpLink?: MockedHttpLink<R>, options?: Partial<Options>) {
    const resolverLink = createResolverLink(options);

    if (httpLink !== undefined) {
      return ApolloLink.from([resolverLink, httpLink]);
    }

    return resolverLink;
  }

  afterEach(() => {
    gql.resetCaches();
  });

  test('создается без ошибок', () => {
    expect(createLink).not.toThrow();
  });

  test('не обрабатывает запрос, если в нем нет мутаций', async () => {
    const query = gql`
      query TestQuery {
        test
      }
    `;

    const mutation = gql`
      query TestQuery {
        test
      }
      mutation TestMutation {
        updateTest
      }
    `;

    let handledQueriesCount = 0;

    const stub = createHttpLink((operation) => {
      const context = operation.getContext();

      if (context.attempt !== undefined) {
        handledQueriesCount += 1;
      }

      return {};
    });

    const link = createLink(stub);

    await toPromise(execute(link, { query }));
    await toPromise(execute(link, { query: mutation }));

    expect(handledQueriesCount).toBe(1);
  });

  test('выполняется запрос', async () => {
    const query = gql`
      query TestQuery {
        test
      }
    `;

    const response: Response = {
      data: {
        test: 'test',
      },
    };

    const stub = createHttpLink(() => response);

    const link = createLink(stub);

    const result = await toPromise(execute(link, { query }));

    expect(stub).toBeCalledTimes(1);
    expect(result).toStrictEqual(response);
  });

  test('решает конфликт с одной мутацией', async () => {
    const vid = 'test-vid';
    const query = gql`
      fragment testData on TestData {
        vid
        version
        foo
        bar
      }

      mutation TestMutation($foo: String!, $version: Int!) {
        testMutationOne(foo: $foo, version: $version) {
          result {
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
      }
    `;

    const expectedResponse: Response = {
      data: {
        testMutationOne: {
          result: {
            vid,
            foo: 'foo_2',
            bar: 'bar_1',
            version: 3,
            __typename: 'Test',
          },
        },
      },
    };

    let patchedVars = {};

    const stub = createHttpLink((operation) => {
      const { attempt } = operation.getContext();
      patchedVars = operation.variables;

      let data: Response['data'] = {};

      if (attempt === 1) {
        data = {
          testMutationOne: {
            result: {
              local: {
                vid,
                foo: 'foo',
                bar: 'bar',
                version: 1,
                __typename: 'Test',
              },
              remote: {
                vid,
                foo: 'foo_1',
                bar: 'bar_1',
                version: 2,
                __typename: 'Test',
              },
              __typename: errorTypename,
            },
          },
        };
      }

      if (attempt === 2) {
        data = {
          testMutationOne: {
            result: {
              vid,
              bar: 'bar_1',
              ...patchedVars,
              version: 3,
              __typename: 'Test',
            },
          },
        };
      }

      return { data };
    });

    const link = createLink(stub);

    const variables = {
      vid,
      foo: 'foo_2',
      version: 1,
    };

    const result = await toPromise(execute(link, { query, variables }));

    expect(patchedVars).toStrictEqual({
      ...variables,
      version: 2,
    });

    expect(result).toStrictEqual(expectedResponse);
  });

  test('корректно обрабатывается пустой diff', async () => {
    const vid = 'test-vid';
    const query = gql`
      fragment testData on TestData {
        vid
        version
        foo
      }

      mutation TestMutation($foo: String!, $version: Int!) {
        testMutationOne(foo: $foo, version: $version) {
          result {
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
      }
    `;

    const expectedResponse: Response = {
      data: {
        testMutationOne: {
          result: {
            vid,
            foo: 'foo_1',
            version: 3,
            __typename: 'Test',
          },
        },
      },
    };

    let patchedVars = {};

    const stub = createHttpLink((operation) => {
      const { attempt } = operation.getContext();
      patchedVars = operation.variables;

      let data: Response['data'] = {};

      if (attempt === 1) {
        data = {
          testMutationOne: {
            result: {
              local: {
                vid,
                foo: 'foo',
                version: 1,
                __typename: 'Test',
              },
              remote: {
                vid,
                foo: 'foo',
                version: 2,
                __typename: 'Test',
              },
              __typename: errorTypename,
            },
          },
        };
      }

      if (attempt === 2) {
        data = {
          testMutationOne: {
            result: {
              vid,
              ...patchedVars,
              version: 3,
              __typename: 'Test',
            },
          },
        };
      }

      return { data };
    });

    const link = createLink(stub);

    const variables = {
      vid,
      foo: 'foo_1',
      version: 1,
    };

    const result = await toPromise(execute(link, { query, variables }));

    expect(patchedVars).toStrictEqual({
      ...variables,
      version: 2,
    });

    expect(result).toStrictEqual(expectedResponse);
  });

  test('решает конфликт версий в нескольких мутациях', async () => {
    const vid = 'test-vid';
    const query = gql`
      fragment testData on TestData {
        vid
        version
        foo
        bar
      }

      fragment diffErrorData on ${errorTypename} {
        message
        remote {
          ...testData
        }
      }

      mutation TestMutation($foo: String!, $bar: String!, $version: Int!) {
        testMutationOne(foo: $foo, version: $version) {
          result {
            ... on TestData {
              ...testData
            }

            ... on ${errorTypename} {
              ...diffErrorData
            }
          }
        }

        testMutationTwo(bar: $bar, version: $version) {
          result {
            ... on TestData {
              ...testData
            }
            ... on ${errorTypename} {
              ...diffErrorData
            }
          }
        }
      }
    `;

    const response: Response = {
      data: {
        testMutationOne: {
          result: {
            vid,
            foo: 'foo_1',
            bar: 'bar',
            version: 3,
            __typename: 'Test',
          },
        },
        testMutationTwo: {
          result: {
            vid,
            foo: 'foo_1',
            bar: 'bar_1',
            version: 4,
            __typename: 'Test',
          },
        },
      },
    };

    const queries: DocumentNode[] = [];

    const stub = createHttpLink((operation) => {
      const { attempt } = operation.getContext();

      queries.push(operation.query);

      let data: Response['data'];

      switch (attempt) {
        case 1:
          data = {
            testMutationOne: {
              result: {
                __typename: errorTypename,
                remote: {
                  vid,
                  foo: 'foo',
                  bar: 'bar',
                  version: 2,
                  __typename: 'Test',
                },
              },
            },
            testMutationTwo: {
              result: {
                __typename: errorTypename,
                remote: {
                  vid,
                  foo: 'foo',
                  bar: 'bar',
                  version: 2,
                },
              },
            },
          };

          break;

        case 2:
          data = {
            testMutationOne: {
              result: {
                vid,
                foo: 'foo_1',
                bar: 'bar',
                version: 3,
                __typename: 'Test',
              },
            },
            testMutationTwo: {
              result: {
                __typename: errorTypename,
                remote: {
                  vid,
                  foo: 'foo_1',
                  bar: 'bar',
                  version: 3,
                },
              },
            },
          };

          break;

        case 3:
          data = {
            testMutationTwo: {
              result: {
                vid,
                foo: 'foo_1',
                bar: 'bar_1',
                version: 4,
                __typename: 'Test',
              },
            },
          };
          break;

        default:
          throw new Error('Ожидалось решение конфликта с 3-х попыток');
      }

      return { data };
    });

    const link = createLink(stub);

    const result = await toPromise(
      execute(link, {
        query,
        variables: {
          version: 1,
          foo: 'foo_1',
          bar: 'bar_1',
        },
      }),
    );

    const lastQuery = queries.slice().reverse()[0];

    let lastMutationFieldsCount = 0;

    expect(result).toStrictEqual(response);

    visit(lastQuery, {
      OperationDefinition: {
        enter(def) {
          if (def.operation === 'mutation') {
            lastMutationFieldsCount = def.selectionSet.selections.length;
          }
        },
      },
    });

    // проверяем, что у последней мутации остается только одно поле testMutationTwo
    expect(lastMutationFieldsCount).toBe(1);
  });

  test('срабатывает отписка', async () => {
    const fn = jest.fn();
    const timeout = 1000;
    const query = gql`
      query TestQuery {
        test
      }
    `;

    const data = {
      data: {
        test: 'never',
      },
    };

    const stub = jest.fn(
      () =>
        new Observable<typeof data>((observer) => {
          setTimeout(() => {
            observer.next(data);
          }, timeout);
        }),
    );

    const link = createLink(stub);

    jest.useFakeTimers();

    const subscription = execute(link, { query }).subscribe({
      next: () => {
        fn();
      },
    });

    subscription.unsubscribe();

    jest.advanceTimersByTime(timeout);

    expect(fn).not.toBeCalled();
  });

  test('учитывает максимальное кол-во попыток', async () => {
    let attempt = 0;
    const max = 10;
    const query = gql`
      mutation TestMutation($foo: String!, $version: Int!) {
        testMutationOne(foo: $foo, version: $version) {
          result {
            ... on TestData {
              foo
            }
            ... on ${errorTypename} {
              message
            }
          }
        }
      }
    `;

    const response: Response = {
      data: {
        testMutationOne: {
          result: {
            __typename: errorTypename,
            remote: {
              foo: 'baz',
              version: 2,
            },
          },
        },
      },
    };

    const stub = createHttpLink((operation) => {
      attempt = operation.getContext().attempt;
      return response;
    });

    const link = createLink(stub, { maxAttempts: max });
    const result = await toPromise(
      execute(link, {
        query,
        variables: {
          version: 1,
          foo: 'bar',
        },
      }),
    ).catch((error) => error);

    expect(attempt).toBe(max);
    expect(result).toStrictEqual(response);
  });
});
