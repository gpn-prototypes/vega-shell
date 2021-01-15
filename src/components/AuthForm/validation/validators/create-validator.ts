import { AnyValue, MessageFn, StrictValidationFn, ValidationFn, Validator, Value } from '../types';

interface ValidatorOptions<C, V extends AnyValue> {
  validate?: ValidationFn<C, V>;
  strictValidate?: StrictValidationFn<C, Value<V>>;
  messageFn: MessageFn<C, V>;
}

export function isEmptyInputValue(value: unknown): boolean {
  if (typeof value === 'number') {
    return false;
  }

  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }

  return value === null || value === undefined;
}

export function createValidator<C = void, V extends AnyValue = AnyValue>(
  options: ValidatorOptions<C, V>,
): Validator<C, Value<V>> {
  const { messageFn: defaultMessageFn } = options;

  const validate = options.strictValidate || options.validate;

  if (typeof validate !== 'function') {
    throw Error('[ui/form/validators] validate or strictValidate is not provided');
  }

  return (config, messageFn: MessageFn<C, V> = defaultMessageFn) => (
    value: Value<V>,
  ): string | null => {
    if (validate === options.validate && isEmptyInputValue(value)) {
      return null;
    }

    return validate(value, config as C) ? null : messageFn(config as C, value);
  };
}
