import { gql } from '@apollo/client';

import { hasOnlyQueryOperation, traverse } from './utils';

describe('hasOnlyQueryOperation', () => {
  test('возвращает true, если в запросе только query', () => {
    const query = gql`
      query TestQuery {
        data
      }
    `;

    expect(hasOnlyQueryOperation(query)).toBe(true);
  });

  test('возвращает false, если в запросе нет query', () => {
    const query = gql`
      mutation TestMutation {
        data
      }
    `;

    expect(hasOnlyQueryOperation(query)).toBe(false);
  });

  test('возвращает false, если в запросе не только query', () => {
    const query = gql`
      query TestQuery {
        data
      }
      mutation TestMutation {
        data
      }
    `;

    expect(hasOnlyQueryOperation(query)).toBe(false);
  });
});

describe('traverse', () => {
  test('обход простого объекта', () => {
    const fn = jest.fn();
    const obj = { a: 1, b: null };

    traverse(obj, fn);

    expect(fn).toHaveBeenNthCalledWith(1, 'a', 1, obj, undefined);
    expect(fn).toHaveBeenNthCalledWith(2, 'b', null, obj, undefined);
  });

  test('обход вложенного объекта', () => {
    const fn = jest.fn();
    const nested = { b: 2 };
    const obj = { a: 1, nested };

    traverse(obj, fn);

    expect(fn).toHaveBeenNthCalledWith(1, 'a', 1, obj, undefined);
    expect(fn).toHaveBeenNthCalledWith(2, 'b', 2, nested, obj);
  });

  test('обход прерывается, если функция вернула null', () => {
    const fn = jest.fn();
    const obj = { a: 1, b: 2 };

    traverse(obj, fn);
    expect(fn).toBeCalledTimes(2);

    fn.mockClear();
    fn.mockReturnValueOnce(null);

    traverse(obj, fn);
    expect(fn).toBeCalledTimes(1);
  });
});
