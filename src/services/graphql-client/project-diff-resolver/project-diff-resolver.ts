import type { Config as DiffPatcherConfig } from 'jsondiffpatch';
import * as jsonDiffPatch from 'jsondiffpatch';

interface MergeStrategyParams {
  default: 'replace' | 'smart';
}

interface ResolverParams {
  mergeStrategy: MergeStrategyParams;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = Record<string | number, any>;

interface Input<T extends AnyObject> {
  local: T;
  localChanges: T;
  remote: T;
}

export class ProjectDiffResolver {
  private mergeStrategy: MergeStrategyParams;

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

    if (this.mergeStrategy.default === 'smart') {
      const diff = this.diffPatcher.diff(local, localChanges);

      if (diff !== undefined) {
        return this.diffPatcher.patch(remote, diff);
      }
    }

    return { ...localChanges, version: remote.version };
  }
}
