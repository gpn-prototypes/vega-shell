import {
  ApolloLink,
  FetchResult,
  NextLink,
  Observable,
  Operation as BareOperation,
  OperationVariables,
} from '@apollo/client';
import { BREAK, DocumentNode, visit } from 'graphql';

import type { Data, MergeStrategy, ProjectAccessor } from './project-diff-resolving-operation';
import { ProjectDiffResolvingOperation } from './project-diff-resolving-operation';

export interface Options<D extends Data = Data, V extends OperationVariables = OperationVariables> {
  errorTypename: string;
  maxAttempts?: number;
  projectAccessor?: Partial<ProjectAccessor<V, D>>;
  mergeStrategy?: Partial<MergeStrategy>;
}

interface Operation extends BareOperation {
  context?: {
    projectDiffResolving: Partial<Options>;
  };
}

export class ProjectDiffResolverLink extends ApolloLink {
  private readonly errorTypename: string;

  private readonly maxAttempts: number;

  private readonly projectAccessor: ProjectAccessor;

  private readonly mergeStrategy: MergeStrategy;

  static hasMutations(query: DocumentNode): boolean {
    let result = false;
    visit(query, {
      OperationDefinition: {
        enter(node) {
          if (node.operation === 'mutation') {
            result = true;
            return BREAK;
          }

          return undefined;
        },
      },
    });

    return result;
  }

  private static makeMergeStrategy(
    mergeStrategy: Partial<MergeStrategy>,
    defaults: MergeStrategy,
  ): MergeStrategy {
    return {
      default: mergeStrategy.default ?? defaults.default,
    };
  }

  private static makeProjectAccessor(accessor?: Partial<ProjectAccessor>): ProjectAccessor {
    const identity = <T>(value: T): T => value;
    const merge = (a: Data, b: Data): Data => ({ ...a, ...b });

    const {
      fromDiffError = () => ({ remote: {}, local: {} }),
      fromVariables = identity,
      toVariables = merge,
    } = accessor ?? {};

    return {
      fromDiffError,
      fromVariables,
      toVariables,
    };
  }

  constructor(defaultOptions: Options) {
    super();
    this.errorTypename = defaultOptions.errorTypename;
    this.maxAttempts = defaultOptions.maxAttempts ?? 5;
    this.projectAccessor = ProjectDiffResolverLink.makeProjectAccessor(
      defaultOptions.projectAccessor,
    );

    this.mergeStrategy = {
      default: 'replace',
    };
  }

  request(operation: Operation, nextLink: NextLink): Observable<FetchResult> {
    if (!ProjectDiffResolverLink.hasMutations(operation.query)) {
      return nextLink(operation);
    }

    const {
      maxAttempts = this.maxAttempts,
      errorTypename = this.errorTypename,
      projectAccessor = {},
      mergeStrategy = {},
    } = operation.getContext().projectDiffResolving ?? {};

    const resolving = new ProjectDiffResolvingOperation({
      maxAttempts,
      errorTypename,
      projectAccessor: ProjectDiffResolverLink.makeProjectAccessor({
        ...this.projectAccessor,
        ...projectAccessor,
      }),
      mergeStrategy: ProjectDiffResolverLink.makeMergeStrategy(mergeStrategy, this.mergeStrategy),
      operation,
      nextLink,
    });

    return resolving.run();
  }
}
