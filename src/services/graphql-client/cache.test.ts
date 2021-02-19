import { getDataIdFromObject } from './cache';

const __typename = 'TestType';

describe('getDataIdFromObject', () => {
  test('если __typename не string, то вернет undefined', () => {
    // @ts-expect-error: тип входного параметра
    const dataId = getDataIdFromObject({ __typename: 1 }, { keyObject: undefined });

    expect(dataId).toBe(undefined);
  });

  describe.each(['id', 'vid', '_id'])('проверка наличия у объекта поля %s', (key) => {
    const context = { keyObject: undefined };
    const keyObj = 'test';
    const dataId = getDataIdFromObject({ [key]: keyObj, __typename }, context);

    test(`при наличии у объекта поля ${key} оно вернется в качестве возвращаемоего значения`, () => {
      expect(dataId).toBe(`${__typename}:${keyObj}`);
    });

    test(`у context в объект keyObject добавляется поле ${key}`, () => {
      expect(context.keyObject).toStrictEqual({
        [key]: keyObj,
      });
    });

    test(`если ${key} не строка или число, то вернется его сериализованная версия`, () => {
      const dataKey = getDataIdFromObject({ [key]: { [key]: key }, __typename }, context);

      expect(dataKey).toBe(`${__typename}:${JSON.stringify({ [key]: key })}`);
    });
  });

  test('если объект пустой, то вернется undefined', () => {
    const context = { keyObject: undefined };

    const dataId = getDataIdFromObject({ __typename }, context);

    expect(dataId).toBe(undefined);

    expect(context.keyObject).toBe(undefined);
  });
});
