import * as utils from './utils';

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
});
