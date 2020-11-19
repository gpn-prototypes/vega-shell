import { ApolloLink, execute, Observable, throwServerError, toPromise } from '@apollo/client';

import { createErrorLink, createResponseLink, notFoundErrorUserMessage } from './graphql-client';
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

    expect(handleError).toBeCalledWith({
      code: 404,
      message: 'project-not-found',
      userMessage: notFoundErrorUserMessage,
    });
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
      expect(handleError).toBeCalledWith({
        code: 500,
        message: 'internal-server-error',
      });
    }
  });
});
