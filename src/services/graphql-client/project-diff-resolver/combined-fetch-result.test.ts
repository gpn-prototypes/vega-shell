import { GraphQLError } from 'graphql';

import { CombinedFetchResult } from './combined-fetch-result';

describe('CombinedFetchResult', () => {
  let sut: CombinedFetchResult;

  beforeEach(() => {
    sut = new CombinedFetchResult();
  });

  test('начальное значение', () => {
    expect(sut.get()).toStrictEqual({});
  });

  test('добавление нескольких результатов', () => {
    const error1 = new GraphQLError('test');
    const error2 = new GraphQLError('test 2');

    sut.combine({ data: { test: 'test' } });
    sut.combine({ data: { test2: 'test2' } });

    expect(sut.get()).toStrictEqual({
      data: { test: 'test', test2: 'test2' },
    });

    sut.combine({ errors: [error1] });
    sut.combine({ errors: [error2] });

    expect(sut.get()).toStrictEqual({
      data: { test: 'test', test2: 'test2' },
      errors: [error1, error2],
    });

    sut.combine({ context: { ctx: 'ctx' } });
    sut.combine({ context: { ctx2: 'ctx2' } });

    expect(sut.get()).toStrictEqual({
      data: { test: 'test', test2: 'test2' },
      context: { ctx: 'ctx', ctx2: 'ctx2' },
      errors: [error1, error2],
    });

    sut.combine({ extensions: { ext: 'ext' } });
    sut.combine({ extensions: { ext2: 'ext2' } });

    expect(sut.get()).toStrictEqual({
      data: { test: 'test', test2: 'test2' },
      context: { ctx: 'ctx', ctx2: 'ctx2' },
      extensions: { ext: 'ext', ext2: 'ext2' },
      errors: [error1, error2],
    });
  });
});
