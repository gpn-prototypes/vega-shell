import * as utils from './utils';
import { MatchedResolver } from './utils';

describe('utils', () => {
  describe('omitTypename', () => {
    const simpleInput = {
      __typename: 'test',
      value: 'test',
    };

    const simpleOutput = {
      value: 'test',
    };

    const complexInput = {
      ...simpleInput,
      nestedObject: {
        ...simpleInput,
        nested: {
          object: simpleInput,
          array: [simpleInput],
        },
      },
      nestedArray: [[simpleInput], [simpleInput]],
    };

    const complexOutput = {
      ...simpleOutput,
      nestedObject: {
        ...simpleOutput,
        nested: {
          object: simpleOutput,
          array: [simpleOutput],
        },
      },
      nestedArray: [[simpleOutput], [simpleOutput]],
    };
    test('обрабатывает примитивы', () => {
      expect(utils.omitTypename('')).toBe('');
      expect(utils.omitTypename(0)).toBe(0);
      expect(utils.omitTypename(null)).toBe(null);
      expect(utils.omitTypename(undefined)).toBe(undefined);
      expect(utils.omitTypename(true)).toBe(true);
      expect(utils.omitTypename(false)).toBe(false);
    });

    test('удаляет поле из объекта', () => {
      expect(utils.omitTypename(simpleInput)).toStrictEqual(simpleOutput);
    });

    test('обрабатывает массивы', () => {
      expect(utils.omitTypename([simpleInput])).toStrictEqual([simpleOutput]);
    });

    test('обрабатывает вложенные структуры', () => {
      expect(utils.omitTypename(complexInput)).toStrictEqual(complexOutput);
    });
  });

  describe('normalizeUri', () => {
    test('удалает последний слэш', () => {
      expect(utils.normalizeUri('/test/')).toBe('/test');
    });

    test('удаляет повторения слэшей', () => {
      expect(utils.normalizeUri('//test///foo/bar///')).toBe('/test/foo/bar');
    });

    test('учитывает протокол', () => {
      expect(utils.normalizeUri('/http:///foo.bar//graphql')).toBe('http://foo.bar/graphql');
    });
  });

  describe('getDataByMatcher', () => {
    const testObject = {
      project: {
        inner: {
          0: {
            element: { data: 'element' },
            array: [{ data: 'first' }, { data: 'second' }, { data: 'third' }],
          },
        },
        outer: {
          first: 1,
          second: 2,
        },
      },
    };

    test('get element by matcher', () => {
      const mockElementMatcher = 'project.inner.0.element';
      const element = utils.getDataByMatcher(mockElementMatcher, testObject);

      expect(element).toEqual(testObject.project.inner[0].element);
    });

    test('get null if element by matcher does not exist', () => {
      const mockElementMatcher = 'project.inner.0.notExist';
      const element = utils.getDataByMatcher(mockElementMatcher, testObject);

      expect(element).toEqual(null);
    });

    test('get array by matcher', () => {
      const mockArrayMatcher = 'project.inner.0.array[*]';
      const element = utils.getDataByMatcher(mockArrayMatcher, testObject);

      expect(element).toEqual(testObject.project.inner[0].array);
    });

    test('get null if array by matcher does not exist', () => {
      const mockElementMatcher = 'project.inner.0.notExist[*]';
      const element = utils.getDataByMatcher(mockElementMatcher, testObject);

      expect(element).toEqual(null);
    });
  });

  describe('setDataByMatcher', () => {
    const testObject = {
      project: {
        inner: {
          0: {
            element: { data: 'element' },
            array: [{ data: 'first' }, { data: 'second' }, { data: 'third' }],
          },
        },
        outer: {
          first: 1,
          second: 2,
        },
      },
    };

    test('set element by matcher', () => {
      const mockElementMatcher = 'project.inner.0.element';
      const newElement = { data: 'new element' };
      const result = utils.setDataByMatcher(mockElementMatcher, testObject, newElement);

      expect(result.project.inner[0].element).toEqual(newElement);
    });

    test('set array by matcher', () => {
      const mockElementMatcher = 'project.inner.0.array[*]';
      const newArray = [{ data: 'new first' }, { data: 'new second' }, { data: 'new third' }];
      const result = utils.setDataByMatcher(mockElementMatcher, testObject, newArray);

      expect(result.project.inner[0].array).toEqual(newArray);
    });

    test('add to new path if path by matcher does not exist', () => {
      const mockElementMatcher = 'project.path.notExist';
      const newElement = { data: 'new element' };
      const result = utils.setDataByMatcher(mockElementMatcher, testObject, newElement);

      expect((result.project as any).path.notExist).toEqual(newElement);
    });

    test('return object as is if matcher is empty', () => {
      const mockElementMatcher = '';
      const newElement = { data: 'new element' };
      const result = utils.setDataByMatcher(mockElementMatcher, testObject, newElement);

      expect(result).toEqual(testObject);
    });
  });

  describe('removeDataByResolvers', () => {
    const testObject = {
      project: {
        inner: {
          0: {
            element: { data: 'element' },
            array: [{ data: 'first' }, { data: 'second' }, { data: 'third' }],
          },
        },
        outer: {
          first: 1,
          second: 2,
        },
      },
    };

    const resolvers = [
      ['project.inner.0.array', () => {}],
      ['project.outer', () => {}],
    ] as MatchedResolver[];

    test('remove element by matcher', () => {
      const result = utils.removeDataByResolvers(resolvers, testObject);
      const expectedObject = {
        project: {
          inner: {
            0: {
              element: { data: 'element' },
              array: {},
            },
          },
          outer: {},
        },
      };
      expect(result).toEqual(expectedObject);
    });
  });
});
