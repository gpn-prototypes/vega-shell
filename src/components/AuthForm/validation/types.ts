export type AnyValue = unknown;
export type Value<T extends AnyValue = AnyValue> = T;
export type ValidationFn<C = undefined, V = AnyValue> = (value: V, config: C) => boolean | null;
export type StrictValidationFn<C = undefined, V = AnyValue> = (value: V, config: C) => boolean;
export interface MessageFn<C = undefined, V = AnyValue> {
  (config: C, value: V): string;
}

export interface Validator<C, V = AnyValue> {
  (config?: C, messageFn?: MessageFn<C, V>): {
    (value: V): string | null;
  };
}

export interface Config {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type Validators = {
  [key in Rule]: Validator<Config>;
};

export interface Values {
  [key: string]: Value;
}

export type Rule =
  | 'required'
  | 'email'
  | 'min'
  | 'max'
  | 'pattern'
  | 'minLength'
  | 'maxLength'
  | 'minLengthPassword'
  | 'maxLengthPassword'
  | 'password';
