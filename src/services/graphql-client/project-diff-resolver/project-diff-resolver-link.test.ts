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
      projectAccessor: {
        fromDiffError: (data) => ({
          remote: data.result.remote,
          local: {},
        }),
      },
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

    expect(handledQueriesCount).toBe(0);
  });

  test('не обрабатывает мутацию, если в контексте не переданы настройки по решению конфликта', async () => {
    const mutation = gql`
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

    await toPromise(execute(link, { query: mutation }));

    expect(handledQueriesCount).toBe(0);
  });

  test('обрабатывается обычная ошибка', async () => {
    const query = gql`
      mutation TestMutation($foo: String!, $version: Int!) {
        testMutationOne(foo: $foo, version: $version) {
          result {
            ... on TestData { foo }
            ... on ${errorTypename} { message }
          }
        }
      }
    `;

    const stub = () => {
      return new Observable<Response>((observer) => {
        observer.error(new Error('test'));
      });
    };

    const link = createLink(stub as MockedHttpLink<Response>);

    const result = toPromise(
      execute(link, {
        query,
        context: {
          projectDiffResolving: {
            fromDiffError: () => ({ remote: {}, local: {} }),
          },
        },
      }),
    );
    await expect(result).rejects.toThrow('test');
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

      query TestQuery { data }

      mutation TestMutation($foo: String!, $version: Int!) {
        testMutationOne(foo: $foo, version: $version) {
          result {
            ... on TestData { ...testData }
            ... on ${errorTypename} {
              remote { ...testData }
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

    const result = await toPromise(
      execute(link, {
        query,
        variables,
        context: {
          projectDiffResolving: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fromDiffError: (data: any) => ({
              remote: data.result.remote,
              local: { vid, foo: 'foo' },
            }),
          },
        },
      }),
    );

    expect(patchedVars).toStrictEqual({
      ...variables,
      version: 2,
    });

    expect(result).toStrictEqual(expectedResponse);
  });

  test('корректно обрабатывает пустой ответ при успешной мутации', async () => {
    const vid = 'test-vid';
    const local = {
      vid,
      a: 1,
      version: 1,
    };

    const query = gql`
      fragment testData on TestData { vid data version }
      mutation TestMutation($foo: String!, $version: Int!) {
        testMutationOne(foo: $foo, version: $version) {
          result {
            ... on TestData { ...testData }
            ... on ${errorTypename} {
              remote { ...testData }
            }
          }
        }
      }
    `;

    const stub = createHttpLink(() => {
      return {};
    });

    const link = createLink(stub);

    const variables = {
      vid,
      data: [{ a: 1 }, { b: 2 }],
      version: 1,
    };

    const result = await toPromise(
      execute(link, {
        query,
        variables,
        context: {
          projectDiffResolving: {
            projectAccessor: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fromDiffError(data: any) {
                return {
                  remote: data.result.remote,
                  local,
                };
              },
            },
          },
        },
      }),
    );

    expect(result).toStrictEqual({});
  });

  test('автоматический режим решения конфликтов', async () => {
    const vid = 'test-vid';
    const query = gql`
      fragment testData on TestData {
        vid
        data
      }

      mutation TestMutation($foo: String!, $version: Int!) {
        testMutationOne(foo: $foo, version: $version) {
          result {
            ... on TestData { ...testData }
            ... on ${errorTypename} {
              remote { ...testData }
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
            data: { a: { b: 2, c: 2 }, d: [{ e: 4 }, { e: 5 }] },
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
              remote: {
                vid,
                data: { a: { b: 2, c: 1 }, d: [{ e: 2 }, { e: 5 }] },
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
      data: { a: { b: 1, c: 2 }, d: [{ e: 4 }, { e: 3 }] },
      version: 1,
    };

    const result = await toPromise(
      execute(link, {
        query,
        variables,
        context: {
          projectDiffResolving: {
            mergeStrategy: {
              default: 'smart',
            },
            projectAccessor: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fromDiffError(data: any) {
                return {
                  remote: data.result.remote,
                  local: {
                    vid,
                    data: { a: { b: 1, c: 1 }, d: [{ e: 2 }, { e: 3 }] },
                    version: 1,
                  },
                };
              },
            },
          },
        },
      }),
    );

    expect(patchedVars).toStrictEqual({
      vid,
      data: { a: { b: 2, c: 2 }, d: [{ e: 4 }, { e: 5 }] },
      version: 2,
    });

    expect(result).toStrictEqual(expectedResponse);
  });

  test('режим решения конфликтов с применением резолверов', async () => {
    const vid = 'test-vid';
    const query = gql`
      fragment testData on TestData {
        vid
        data
      }

      mutation TestMutation($foo: String!, $version: Int!) {
        testMutationOne(foo: $foo, version: $version) {
          result {
            ... on TestData { ...testData }
            ... on ${errorTypename} {
              remote { ...testData }
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
            data: { a: { b: 2, c: 2 }, d: [{ e: 4 }, { e: 3 }] },
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
              remote: {
                vid,
                data: { a: { b: 2, c: 1 }, d: [{ e: 2 }, { e: 5 }] },
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
      data: { a: { b: 1, c: 2 }, d: [{ e: 4 }, { e: 3 }] },
      version: 1,
    };

    const result = await toPromise(
      execute(link, {
        query,
        variables,
        context: {
          projectDiffResolving: {
            mergeStrategy: {
              default: 'smart',
              resolvers: [['data.d[*]', (local: any) => local]],
            },
            projectAccessor: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fromDiffError(data: any) {
                return {
                  remote: data.result.remote,
                  local: {
                    vid,
                    data: { a: { b: 1, c: 1 }, d: [{ e: 2 }, { e: 3 }] },
                    version: 1,
                  },
                };
              },
            },
          },
        },
      }),
    );

    expect(patchedVars).toStrictEqual({
      vid,
      data: { a: { b: 2, c: 2 }, d: [{ e: 4 }, { e: 3 }] },
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
            ... on TestData { ...testData }
            ... on ${errorTypename} {
              remote { ...testData }
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
              remote: {
                vid,
                foo: 'foo_1',
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

    const result = await toPromise(
      execute(link, {
        query,
        variables,
        context: {
          projectDiffResolving: {
            mergeStrategy: {
              default: 'smart',
            },
            projectAccessor: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fromDiffError(data: any) {
                return {
                  remote: data.result.remote,
                  local: {
                    vid,
                    foo: 'foo_1',
                    version: 1,
                  },
                };
              },
            },
          },
        },
      }),
    );

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
        remote { ...testData }
      }

      mutation TestMutation($foo: String!, $bar: String!, $version: Int!) {
        testMutationOne(foo: $foo, version: $version) {
          result {
            ... on TestData { ...testData }
            ... on ${errorTypename} { ...diffErrorData }
          }
        }

        testMutationTwo(bar: $bar, version: $version) {
          result {
            ... on TestData { ...testData }
            ... on ${errorTypename} { ...diffErrorData }
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
        context: {
          projectDiffResolving: {
            projectAccessor: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fromDiffError(data: any) {
                return {
                  remote: data.result.remote,
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
        context: {
          projectDiffResolving: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fromDiffError: (data: any) => ({ local: {}, remote: data.result.remote }),
          },
        },
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
