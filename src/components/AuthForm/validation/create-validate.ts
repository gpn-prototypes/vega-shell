import { AnyValue, Config as ConfigType, Validator, Value } from './types';

type Config<Values extends { [key: string]: Value<AnyValue> }> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [value in keyof Values]: ReturnType<Validator<ConfigType, Value<any>>>[];
};

export function createValidate<Values extends Record<string, unknown>>(config: Config<Values>) {
  return (values: Values): Partial<Record<keyof Values, string>> => {
    const errors: Partial<Record<keyof Values, string>> = {};

    Object.keys(config).forEach((prop: keyof Config<Values>) => {
      const value = values[prop];
      const validations = config[prop];
      const [error] = validations.map((validate) => validate(value)).filter((err) => err !== null);

      if (error !== null && error !== undefined) {
        errors[prop] = error;
      }
    });

    return errors;
  };
}
