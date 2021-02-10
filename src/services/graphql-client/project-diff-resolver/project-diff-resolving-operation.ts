import {
  FetchResult,
  NextLink,
  Observable,
  Observer,
  Operation,
  OperationVariables,
} from '@apollo/client';
import { createOperation } from '@apollo/client/link/utils';
import { DocumentNode, visit } from 'graphql';
import type { Config as DiffPatcherConfig } from 'jsondiffpatch';
import * as jsonDiffPatch from 'jsondiffpatch';

import { omitTypename } from '../utils';

import { CombinedFetchResult } from './combined-fetch-result';
import { ProjectDiffResolverError } from './error';

export type Data = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
interface MutationResult {
  __typename: string;
  result: Data & {
    __typename: string;
  };
}

export interface ProjectAccessor<
  Variables extends OperationVariables = OperationVariables,
  ProjectData extends Data = Data
> {
  fromDiffError(
    mutationResult: MutationResult,
    local: ProjectData,
  ): { local: ProjectData; remote: ProjectData };
  fromVariables(variables: Variables): ProjectData;
  toVariables(variables: Variables, data: ProjectData): Variables;
}

export interface MergeStrategy {
  default: 'replace' | 'smart';
}

interface Options<V = OperationVariables, D = Data> {
  maxAttempts?: number;
  errorTypename: string;
  operation: Operation;
  nextLink: NextLink;
  projectAccessor: ProjectAccessor<V, D>;
  mergeStrategy: MergeStrategy;
}
export class ProjectDiffResolvingOperation {
  readonly errorTypename: string;

  private observer: Observer<FetchResult> | null;

  private operation: Operation;

  private subscription: ZenObservable.Subscription | null;

  private nextLink: NextLink;

  private maxAttempts: number;

  private attempt: number;

  private mutationFieldNames: Set<string>;

  private successMutationFieldNames: Set<string>;

  private fetchResult: CombinedFetchResult;

  private resolver: jsonDiffPatch.DiffPatcher;

  private projectAccessor: ProjectAccessor;

  private mergeStrategy: MergeStrategy;

  constructor(options: Options) {
    this.operation = options.operation;
    this.errorTypename = options.errorTypename;
    this.nextLink = options.nextLink;
    this.mutationFieldNames = new Set();
    this.successMutationFieldNames = new Set();

    this.observer = null;
    this.subscription = null;

    this.attempt = 1;
    this.maxAttempts = options.maxAttempts ?? 5;

    this.fetchResult = new CombinedFetchResult();

    this.projectAccessor = options.projectAccessor;
    this.mergeStrategy = options.mergeStrategy;

    this.resolver = jsonDiffPatch.create({
      objectHash(item, index) {
        return item?.vid || `$$index:${index}`;
      },
      textDiff: {
        minLength: Infinity,
      },
      propertyFilter(name) {
        return !['__typename', 'version', 'vid'].includes(name);
      },
    } as DiffPatcherConfig);
  }

  private snapshotMutationNames(node: DocumentNode): void {
    this.mutationFieldNames.clear();

    visit(node, {
      OperationDefinition: {
        enter: (def) => {
          if (def.operation !== 'mutation') {
            return false;
          }

          visit(def.selectionSet, {
            Field: {
              enter: (field) => {
                this.mutationFieldNames.add(field.name.value);
                return false;
              },
            },
          });

          return undefined;
        },
      },
    });
  }

  private snapshotSuccessMutationNames(fetchResult: FetchResult): void {
    const { data } = fetchResult;

    if (data === undefined || data === null) {
      return;
    }

    this.getMutationNames()
      .map((name) => [data[name], name])
      .filter(([value]) => value !== undefined && !this.hasDiffError(value))
      .forEach(([, name]) => {
        this.successMutationFieldNames.add(name);
      });
  }

  private getMutationNames(): string[] {
    return Array.from(this.mutationFieldNames);
  }

  private hasDiffError(data: Data): boolean {
    return this.errorTypename === (data.result ?? data)?.__typename;
  }

  private getMutationsWithDiffErrors(fetchResult: FetchResult): MutationResult[] {
    const { data } = fetchResult;

    if (data === undefined || data === null) {
      return [];
    }

    return this.getMutationNames()
      .map((name) => data[name])
      .filter((value) => value !== undefined && this.hasDiffError(value));
  }

  private combineFetchResults(incoming: FetchResult): void {
    this.fetchResult.combine(incoming);
  }

  public run(): Observable<FetchResult> {
    const observable = new Observable<FetchResult>((observer) => {
      this.observer = observer;
      return () => {
        // istanbul ignore else
        if (this.subscription !== null) {
          this.subscription.unsubscribe();
        }
      };
    });

    this.try();

    return observable;
  }

  private try(): void {
    this.updateOperationContext();

    if (this.attempt === 1) {
      this.snapshotMutationNames(this.operation.query);
    }

    this.subscription = this.nextLink(this.operation).subscribe({
      error: (error) => this.onError(error),
      next: (value) => {
        this.onData(value);
      },
    });
  }

  private done(data: FetchResult): void {
    // istanbul ignore if не должно происходить
    if (this.observer === null) {
      throw new ProjectDiffResolverError('Internal bug. Observer is null!');
    }

    // istanbul ignore else
    if (typeof this.observer.next === 'function' && typeof this.observer.complete === 'function') {
      this.observer.next(data);
      this.observer.complete();
      this.observer = null;
      return;
    }

    // istanbul ignore next не должно происходить
    throw new ProjectDiffResolverError('Internal bug. Incompatible observer!');
  }

  private onData(data: FetchResult): void {
    this.combineFetchResults(data);
    this.snapshotSuccessMutationNames(data);
    const mutationsWithErrors = this.getMutationsWithDiffErrors(data);

    if (mutationsWithErrors.length > 0) {
      if (this.attempt < this.maxAttempts) {
        this.resolveConflicts(mutationsWithErrors);
        this.retry();
      } else {
        this.onError(data);
      }

      return;
    }

    this.done(this.fetchResult.get());
  }

  private onError(error: unknown): void {
    // istanbul ignore else
    if (this.observer !== null && typeof this.observer.error === 'function') {
      this.observer.error(error);
    }
  }

  private updateOperationContext(): void {
    this.operation.setContext((ctx: Record<string, unknown>) => ({
      ...ctx,
      attempt: this.attempt,
    }));
  }

  private retry(): void {
    this.attempt += 1;
    this.try();
  }

  private resolveConflicts(mutations: MutationResult[]): void {
    // istanbul ignore if не должно происходить
    if (mutations.length === 0) {
      throw new ProjectDiffResolverError('Internal bug. No mutations with error!');
    }

    const { variables } = this.operation;
    const localChanges = this.projectAccessor.fromVariables(variables);
    const versions = this.projectAccessor.fromDiffError(mutations[0], localChanges);

    const { remote, local } = versions;

    if (this.mergeStrategy.default === 'smart') {
      const diff = this.resolver.diff(local, localChanges);

      if (diff !== undefined) {
        const patched = this.resolver.patch(remote, diff);

        const updatedVars = this.projectAccessor.toVariables(variables, omitTypename(patched));

        this.updateOperation(updatedVars);
        return;
      }
    }

    this.updateOperation(
      this.projectAccessor.toVariables(variables, { ...localChanges, version: remote.version }),
    );
  }

  private updateOperation(variables: OperationVariables): void {
    const isSuccessMutation = (name: string): boolean => {
      return this.successMutationFieldNames.has(name);
    };

    const query = visit(this.operation.query, {
      enter(node) {
        if (node.kind === 'Field' && isSuccessMutation(node.name.value)) {
          // удаляем выполненные мутации из повторного запроса
          return null;
        }

        return undefined;
      },
    });

    this.operation = createOperation(this.operation.getContext(), {
      ...this.operation,
      query,
      variables,
    });
  }
}
