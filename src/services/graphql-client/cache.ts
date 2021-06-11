import type { ApolloCache, NormalizedCacheObject, StoreObject } from '@apollo/client';
import { InMemoryCache } from '@apollo/client';

export const getDataIdFromObject = (
  obj: Readonly<StoreObject>,
  context: { keyObject?: Record<string, unknown> },
): string | undefined => {
  const { id, vid, _id, __typename } = obj;

  if (typeof __typename !== 'string') {
    return undefined;
  }

  let resultId = id;

  // istanbul ignore else
  if (context !== undefined) {
    if (id !== undefined) {
      context.keyObject = { id };
    } else if (vid !== undefined) {
      context.keyObject = { vid };
    } else if (_id !== undefined) {
      context.keyObject = { _id };
    } else {
      context.keyObject = undefined;
    }
  }

  if (_id !== undefined) {
    resultId = _id;
  }

  if (vid !== undefined) {
    resultId = vid;
  }

  if (resultId === undefined || resultId === null) {
    return undefined;
  }

  return `${__typename}:${
    typeof resultId === 'string' || typeof resultId === 'number'
      ? resultId
      : JSON.stringify(resultId)
  }`;
};

export type Cache = ApolloCache<NormalizedCacheObject>;

export function createCache(): Cache {
  return new InMemoryCache({
    dataIdFromObject: getDataIdFromObject,
    typePolicies: {
      Project: {
        keyFields: ['vid'],
      },
      ProjectInner: {
        keyFields: ['vid'],
      },
      DomainObject: {
        keyFields: ['vid'],
        fields: {
          domainObjectPath: {
            merge: (existing, incoming) => {
              return incoming;
            },
          },
          attributeValues: {
            merge: (existing, incoming) => {
              return incoming;
            },
          },
          risksValues: {
            merge: (existing, incoming) => {
              return incoming;
            },
          },
        },
      },
    },
  });
}
