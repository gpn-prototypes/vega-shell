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

export function normalizeUri(uri: string): string {
  const trimSlashRegxp = /^\/|\/$/g;
  const trimmed = uri.replace(trimSlashRegxp, '').trim();
  let protocol = '';
  let path = trimmed;

  if (trimmed.startsWith('http')) {
    [protocol, path] = trimmed.split('://');
  }

  path = path.replace(/\/{2,}/g, '/').replace(trimSlashRegxp, '');

  if (protocol !== '') {
    return `${protocol}://${path}`;
  }

  return `/${path}`;
}

export function getDataByMatcher(
  matcher: string,
  object: AnyObject,
): AnyObject | AnyObject[] | null {
  const matchedProperty =
    matcher.indexOf('.') !== -1 ? matcher.slice(0, matcher.indexOf('.')) : matcher;

  if (matchedProperty.indexOf('[*]') === -1) {
    if (matcher.indexOf('.') === -1) {
      if (!object[matchedProperty]) {
        return null;
      }

      return object[matchedProperty];
    }

    return getDataByMatcher(matcher.slice(matcher.indexOf('.') + 1), object[matchedProperty]);
  }

  const data = object[matchedProperty.slice(0, matchedProperty.indexOf('[*]'))];
  if (!data) {
    return null;
  }

  return data;
}

export function setDataByMatcher<T extends AnyObject>(
  matcher: string,
  object: T,
  data: AnyObject | AnyObject[],
): T {
  const matcherProperties = matcher.split('.');
  if (matcherProperties) {
    const lastIndex = matcherProperties.length - 1;
    if (matcherProperties[lastIndex].indexOf('[*]') !== -1) {
      matcherProperties[lastIndex] = matcherProperties[lastIndex].slice(
        0,
        matcherProperties[lastIndex].indexOf('[*]'),
      );
    }

    let currInstance: AnyObject = object;
    matcherProperties.forEach((matcherProperty, index) => {
      if (index !== matcherProperties.length - 1) {
        if (!currInstance[matcherProperty]) {
          currInstance[matcherProperty] = {};
        }
        currInstance = currInstance[matcherProperty];
      } else {
        currInstance[matcherProperty] = data;
      }
    });
  }

  return { ...object };
}
