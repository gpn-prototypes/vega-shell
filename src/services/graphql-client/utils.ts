type AnyValue = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type AnyObject = Record<string, AnyValue>;

export function isObject(value: AnyValue): value is AnyObject {
  return typeof value === 'object' && value !== null;
}

export function omitTypename(input: AnyValue): AnyValue {
  if (Array.isArray(input)) {
    return input.map(omitTypename);
  }

  if (isObject(input)) {
    const data = { ...input };

    Object.keys(input).forEach((key) => {
      if (key === '__typename') {
        delete data[key];
        return;
      }

      if (isObject(data[key])) {
        data[key] = omitTypename(data[key]);
      }
    });

    return data;
  }

  return input;
}
