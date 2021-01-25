import { AnyValue } from '../types';

import { createValidator } from './create-validator';

/* eslint-disable */
export const emailPattern = /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/;
/* eslint-enable */

export const AVAILABLE_PASSWORD_SYMBOLS = ',!@#$%^&()_+|~-=\\{}[]`“;’<>?,./';

export const required = createValidator<void, AnyValue>({
  messageFn: () => 'Обязательное поле',
  strictValidate(value) {
    if (value === undefined || value === null) {
      return false;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number' && Number.isNaN(value)) {
      return false;
    }

    return typeof value === 'string' && value.trim() !== '';
  },
});

export const pattern = createValidator<RegExp, string>({
  messageFn: () => `Недопустипое значение`,
  validate: (value, regexp) => regexp.test(value),
});

export const email = (): ReturnType<typeof pattern> =>
  pattern(emailPattern, () => 'Неверный формат email');

export const min = createValidator<number, number | string>({
  messageFn: (minValue) => `Минимальное значение ${minValue}`,
  validate: (value, minValue) => minValue <= Number(value),
});

export const max = createValidator<number, number | string>({
  validate: (value, maxValue) => maxValue >= Number(value),
  messageFn: (maxValue) => `Максимальное значение ${maxValue}`,
});

export const minLength = createValidator<number, string>({
  validate: (value, length) => value.length >= length,
  messageFn: (length) => `Минимальное количество символов ${length}`,
});

export const maxLength = createValidator<number, string>({
  validate: (value, length) => value.length <= length,
  messageFn: (length) => `Вы превысили максимальное количество символов в ${length} символов`,
});

export const validators = {
  required,
  pattern,
  email,
  min,
  max,
  minLength,
  maxLength,
};
