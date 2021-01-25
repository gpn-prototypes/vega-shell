import { createValidate } from './create-validate';
import { Validator, Value } from './types';
import { createValidator, emailPattern, isEmptyInputValue, validators } from './validators';

interface Form {
  email: string;
  password: string;
  count: number;
  isOk: boolean;
  optionalText?: string;
}

describe('Валидация полей по схеме', () => {
  describe('createValidate', () => {
    const validForm: Form = {
      email: 'test@gpn.ru',
      password: '1234567',
      count: 10,
      isOk: true,
      optionalText: '',
    };

    const validate = createValidate<Partial<Form>>({
      email: [validators.required(), validators.email(), validators.maxLength(255)],
      isOk: [validators.required()],
      count: [validators.min(1), validators.max(10)],
    });

    test('при валидных данных возвращает пустой объект', () => {
      expect(validate(validForm)).toStrictEqual({});
    });

    test('если поле не валидно, выводит объект с текстом ошибки', () => {
      const error = {
        email: 'Обязательное поле',
      };

      expect(validate({ ...validForm, email: '' })).toStrictEqual(error);
    });

    test('если поле не обязательное и отсутствует, выводится пустой объект', () => {
      expect(validate({ ...validForm, optionalText: '' })).toStrictEqual({});
      expect(validate({ ...validForm, optionalText: ' ' })).toStrictEqual({});
      expect(validate({ ...validForm, optionalText: undefined })).toStrictEqual({});
    });
  });

  describe('isEmptyInputValue', () => {
    test('должен считать значения пустыми', () => {
      expect(isEmptyInputValue('')).toBe(true);
      expect(isEmptyInputValue([])).toBe(true);
      expect(isEmptyInputValue(null)).toBe(true);
      expect(isEmptyInputValue(undefined)).toBe(true);
    });

    test('не должен считать значения пустыми', () => {
      expect(isEmptyInputValue(' ')).toBe(false);
      expect(isEmptyInputValue(true)).toBe(false);
      expect(isEmptyInputValue(false)).toBe(false);
      expect(isEmptyInputValue([''])).toBe(false);
      expect(isEmptyInputValue(0)).toBe(false);
      expect(isEmptyInputValue(NaN)).toBe(false);
      expect(isEmptyInputValue(Infinity)).toBe(false);
    });
  });

  describe('createValidator', () => {
    test('должен выдать ошибку, если не передан validate и strictValidate', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const createBrokenValidator = (): Validator<void, string> =>
        createValidator<void, string>({
          messageFn: () => 'test',
        });

      expect(createBrokenValidator).toThrow();
      consoleErrorSpy.mockRestore();
    });

    test('должен вызвать функцию сообщения об ошибке', () => {
      const messageFnImplementation = (config: string, value: Value<string>): string =>
        `config: ${config}, value: ${value}`;

      const messageFnMock = jest.fn(messageFnImplementation);
      const validateMock = jest.fn(() => false);
      const testConfig = 'testConfig';
      const testValue = 'testValue';

      const validator = createValidator<string, string>({
        messageFn: messageFnMock,
        validate: validateMock,
      });

      const validate = validator(testConfig);

      expect(validate(testValue)).toBe(messageFnImplementation(testConfig, testValue));
      expect(messageFnMock).toBeCalledWith(testConfig, testValue);
      expect(validateMock).toBeCalledWith(testValue, testConfig);
    });

    test('должен заменить дефолтную функцию сообщения об ошибке', () => {
      const messageFnImplementation = (config: string, value: Value<string>): string =>
        `config: ${config}, value: ${value}`;

      const messageFnMock = jest.fn(messageFnImplementation);
      const defaultMessageFnMock = jest.fn(() => 'never');
      const validateMock = jest.fn(() => false);
      const testConfig = 'testConfig';
      const testValue = 'testValue';

      const validator = createValidator<string, string>({
        messageFn: defaultMessageFnMock,
        validate: validateMock,
      });

      const validate = validator(testConfig, messageFnMock);

      expect(validate(testValue)).toBe(messageFnImplementation(testConfig, testValue));
      expect(defaultMessageFnMock).not.toBeCalled();
      expect(messageFnMock).toBeCalledWith(testConfig, testValue);
      expect(validateMock).toBeCalledWith(testValue, testConfig);
    });

    test('должен вызвать strictValidate, если передан validate', () => {
      const errorMessage = '';
      const messageFnMock = jest.fn(() => errorMessage);
      const strictValidateMock = jest.fn(() => false);
      const validateMock = jest.fn(() => false);
      const testConfig = 'testConfig';
      const testValue = 'testValue';

      const validator = createValidator<string, string>({
        messageFn: messageFnMock,
        validate: validateMock,
        strictValidate: strictValidateMock,
      });

      const validate = validator(testConfig);

      expect(validate(testValue)).toBe(errorMessage);
      expect(messageFnMock).toBeCalledWith(testConfig, testValue);
      expect(validateMock).not.toBeCalled();
      expect(strictValidateMock).toBeCalledWith(testValue, testConfig);
    });

    test('не должен вызывать validate, если поле пустое', () => {
      const messageFnMock = jest.fn();
      const validateMock = jest.fn(() => false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validator = createValidator<void, any>({
        messageFn: messageFnMock,
        validate: validateMock,
      });

      const validate = validator();

      expect(validate(null)).toBe(null);
      expect(validate(undefined)).toBe(null);
      expect(validate([])).toBe(null);
      expect(validate('')).toBe(null);
      expect(validateMock).not.toBeCalled();
      expect(messageFnMock).not.toBeCalled();
    });

    test('должен вызывать strictValidate, даже если поле пустое', () => {
      const errorMessage = '';
      const messageFnMock = jest.fn(() => errorMessage);
      const strictValidateMock = jest.fn(() => true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validator = createValidator<void, any>({
        messageFn: messageFnMock,
        strictValidate: strictValidateMock,
      });

      const validate = validator();

      expect(validate(null)).toBe(null);
      expect(validate(undefined)).toBe(null);
      expect(validate([])).toBe(null);
      expect(validate('')).toBe(null);
      expect(strictValidateMock).toBeCalledTimes(4);
      expect(messageFnMock).not.toBeCalled();
    });
  });

  describe('validators', () => {
    test('required', () => {
      const validate = validators.required();
      expect(validate('')).not.toBe(null);
      expect(validate(' ')).not.toBe(null);
      expect(validate(null)).not.toBe(null);
      expect(validate(undefined)).not.toBe(null);
      expect(validate([])).not.toBe(null);
      expect(validate(false)).not.toBe(null);
      expect(validate(NaN)).not.toBe(null);
    });

    test('pattern', () => {
      const validate = validators.pattern(/test/);
      expect(validate('test')).toBe(null);
      expect(validate(' ')).not.toBe(null);
    });

    test('min', () => {
      const validate = validators.min(1);
      expect(validate('0')).not.toBe(null);
      expect(validate(0)).not.toBe(null);
      expect(validate(1)).toBe(null);
      expect(validate('1')).toBe(null);
      expect(validate('')).toBe(null);
    });

    test('max', () => {
      const validate = validators.max(1);
      expect(validate('2')).not.toBe(null);
      expect(validate(2)).not.toBe(null);
      expect(validate(1)).toBe(null);
      expect(validate('1')).toBe(null);
      expect(validate('')).toBe(null);
    });

    test('minLength', () => {
      const validate = validators.minLength(2);
      expect(validate(' ')).not.toBe(null);
      expect(validate('1')).not.toBe(null);
      expect(validate('12')).toBe(null);
      expect(validate('  ')).toBe(null);
      expect(validate('')).toBe(null);
    });

    test('maxLength', () => {
      const validate = validators.maxLength(2);
      expect(validate('   ')).not.toBe(null);
      expect(validate('123')).not.toBe(null);
      expect(validate('12')).toBe(null);
      expect(validate('1')).toBe(null);
      expect(validate('')).toBe(null);
    });
  });
});

describe('Регулярные выражения для валидации', () => {
  test('проверка регулярного выражения для email на корректность', () => {
    const value = 'email@test.ru';

    expect(emailPattern.test(value)).toBe(true);
  });

  test('проверка регулярного выражения для email с плюсом на корректность', () => {
    const value = 'email+npm@test.ru';

    expect(emailPattern.test(value)).toBe(true);
  });

  test('проверка регулярного выражения для email с дефисоминусом на корректность', () => {
    const value = 'my-email@test.ru';

    expect(emailPattern.test(value)).toBe(true);
  });

  test('проверить поле email - некоректное значение', () => {
    const value = 'sdgsdfg';

    expect(emailPattern.test(value)).toBe(false);
  });

  test('проверить поле email - символ @', () => {
    const value = 'sdgsdfg@';

    expect(emailPattern.test(value)).toBe(false);
  });

  test('проверить поле email - отсутствует домен верхнего уровня', () => {
    const value = 'sdgsdfg@mail';

    expect(emailPattern.test(value)).toBe(false);
  });

  test('проверить поле email - корректное значение, проверка субдомена', () => {
    const value = 'test@test.aldamics.ru';

    expect(emailPattern.test(value)).toBe(true);
  });

  test('проверить поле email - отсутствует домен верхнего уровня', () => {
    const value = 'sdgsdfg@mail';

    expect(emailPattern.test(value)).toBe(false);
  });
});
