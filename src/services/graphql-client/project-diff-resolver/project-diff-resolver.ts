import type { Config as DiffPatcherConfig } from 'jsondiffpatch';
import * as jsonDiffPatch from 'jsondiffpatch';

import { getDataByMatcher, removeDataByResolvers, setDataByMatcher } from '../utils';

interface ResolverParams {
  mergeStrategy: MergeStrategy;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = Record<string | number, any>;
type Matcher<T = any> = (data: any) => T; // eslint-disable-line @typescript-eslint/no-explicit-any
type Resolver<T = any> = (local: T, remote: T, diff?: jsonDiffPatch.Delta) => T; // eslint-disable-line @typescript-eslint/no-explicit-any
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
        return item?.vid || item?.code || `$$index:${index}`;
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

    if (this.mergeStrategy.default === 'smart') {
      const diff = this.diffPatcher.diff(local, localChanges);
      if (diff !== undefined) {
        if (this.mergeStrategy.resolvers.length) {
          const localWithoutResolved = removeDataByResolvers(
            this.mergeStrategy.resolvers,
            this.diffPatcher.clone(local),
          );
          const remoteWithoutResolved = removeDataByResolvers(
            this.mergeStrategy.resolvers,
            this.diffPatcher.clone(remote),
          );
          const localChangesWithoutResolved = removeDataByResolvers(
            this.mergeStrategy.resolvers,
            this.diffPatcher.clone(localChanges),
          );
          const diffWithoutResolved = this.diffPatcher.diff(
            localWithoutResolved,
            localChangesWithoutResolved,
          ) as jsonDiffPatch.Delta;
          let patched = this.diffPatcher.patch(
            this.diffPatcher.clone(remoteWithoutResolved),
            diffWithoutResolved,
          );
          this.mergeStrategy.resolvers.forEach(([matcher, resolver]) => {
            if (typeof matcher === 'string') {
              const localData = getDataByMatcher(matcher, local);
              const localChangesData = getDataByMatcher(matcher, localChanges);
              const remoteData = getDataByMatcher(matcher, remote);

              if (
                Array.isArray(localData) &&
                Array.isArray(localChangesData) &&
                Array.isArray(remoteData) &&
                matcher.includes('[*]')
              ) {
                let patchedRows = remoteData.map((remoteRow, index) => {
                  const rowDiff = this.diffPatcher.diff(localData[index], localChangesData[index]);
                  return resolver(localChangesData[index], remoteRow, rowDiff);
                });

                if (remoteData.length < localChangesData.length) {
                  patchedRows = [...patchedRows, ...localChangesData.slice(remoteData.length)];
                }

                patched = setDataByMatcher(matcher, patched, patchedRows);
              } else {
                const objectDiff = this.diffPatcher.diff(localData, localChangesData);
                const patchedData = resolver(localChangesData, remoteData, objectDiff);
                patched = setDataByMatcher(matcher, patched, patchedData);
              }
            }
          });
          return patched;
        }
        return this.diffPatcher.patch(this.diffPatcher.clone(remote), diff);
      }
    }

    return { ...localChanges, version: remote.version };
  }
}
