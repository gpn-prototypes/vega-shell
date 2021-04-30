import type { Config as DiffPatcherConfig } from 'jsondiffpatch';
import * as jsonDiffPatch from 'jsondiffpatch';

interface ResolverParams {
  mergeStrategy: MergeStrategy;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = Record<string | number, any>;
type Matcher<T = any> = (data: any) => T; // eslint-disable-line @typescript-eslint/no-explicit-any
type Resolver<T = any> = (local: T, remote: T) => T; // eslint-disable-line @typescript-eslint/no-explicit-any
type MatchedResolver = [Matcher | string, Resolver];

interface Input<T extends AnyObject> {
  local: T;
  localChanges: T;
  remote: T;
}

export interface MergeStrategy {
  default: 'replace' | 'smart';
  resolvers: MatchedResolver[];
}
export class ProjectDiffResolver {
  private mergeStrategy: MergeStrategy;

  private diffPatcher: jsonDiffPatch.DiffPatcher;

  constructor(params: ResolverParams) {
    const { mergeStrategy } = params;

    this.mergeStrategy = mergeStrategy;

    const diffPatcherConfig: DiffPatcherConfig = {
      objectHash(item, index) {
        return item?.vid || `$$index:${index}`;
      },
      textDiff: {
        minLength: Infinity,
      },
      propertyFilter(name) {
        return !['__typename', 'version', 'vid'].includes(name);
      },
    };

    this.diffPatcher = jsonDiffPatch.create(diffPatcherConfig);
  }

  merge<T extends AnyObject>(input: Input<T>): T {
    const { local, remote, localChanges } = input;

    const getDataByMatcher = (
      matcher: string,
      object: AnyObject,
    ): AnyObject | AnyObject[] | null => {
      const matchedProperty =
        matcher.indexOf('.') !== -1 ? matcher.slice(0, matcher.indexOf('.')) : matcher;
      if (matchedProperty) {
        if (matchedProperty.indexOf('[*]') === -1) {
          if (!object[matchedProperty]) {
            return null;
          }
          return getDataByMatcher(matcher.slice(matcher.indexOf('.') + 1), object[matchedProperty]);
        }

        const data = object[matchedProperty.slice(0, matchedProperty.indexOf('[*]'))];
        if (!data) {
          return null;
        }

        return data;
      }
      return object;
    };

    const setDataByMatcher = (matcher: string, object: T, data: AnyObject | AnyObject[]): T => {
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
            currInstance = currInstance[matcherProperty];
          } else {
            currInstance[matcherProperty] = data;
          }
        });
      }

      return { ...object };
    };

    if (this.mergeStrategy.default === 'smart') {
      const diff = this.diffPatcher.diff(local, localChanges);

      if (diff !== undefined) {
        if (this.mergeStrategy.resolvers.length) {
          let patched = this.diffPatcher.patch(remote, diff);
          this.mergeStrategy.resolvers.forEach(([matcher, resolver]) => {
            if (typeof matcher === 'string') {
              const localData = getDataByMatcher(matcher, local);
              const localChangesData = getDataByMatcher(matcher, localChanges);
              const remoteData = getDataByMatcher(matcher, remote);

              if (
                Array.isArray(localData) &&
                Array.isArray(localChangesData) &&
                Array.isArray(remoteData)
              ) {
                const patchedRows = remoteData.map((remoteRow, index) => {
                  const rowDiff = this.diffPatcher.diff(localData[index], localChangesData[index]);
                  if (rowDiff) {
                    return resolver(localChangesData[index], remoteRow);
                  }

                  return remoteRow;
                });

                patched = setDataByMatcher(matcher, patched, patchedRows);
              } else {
                const patchedData = resolver(localChangesData, remoteData);
                patched = setDataByMatcher(matcher, patched, patchedData);
              }
            }
          });
          return patched;
        }
        return this.diffPatcher.patch(remote, diff);
      }
    }

    return { ...localChanges, version: remote.version };
  }
}
