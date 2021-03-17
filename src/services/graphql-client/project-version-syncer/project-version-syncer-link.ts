import type { FetchResult, NextLink, Operation, OperationVariables } from '@apollo/client';
import { ApolloLink, fromPromise, Observable, toPromise } from '@apollo/client';
import type { DocumentNode } from 'graphql';

import type { Cache } from '../cache';

import { AbstractEndpointStrategy, createEndpointStrategy } from './endpoint-strategies';
import { ProjectOperations } from './project-operations';

interface Project {
  vid: string;
  version: number;
}

export interface CurrentProject {
  setVersion(version: number): void;
  get(): Project | null;
}

interface Params {
  cache: Cache;
  currentProject: CurrentProject;
}

export class ProjectVersionSyncerLink extends ApolloLink {
  private readonly cache: Cache;

  readonly currentProject: CurrentProject;

  readonly operations: ProjectOperations;

  private readonly maxAttempts: number;

  constructor(params: Params) {
    super();
    this.cache = params.cache;
    this.currentProject = params.currentProject;
    this.operations = new ProjectOperations({ context: this });
    this.maxAttempts = 10;
  }

  isCached(query: DocumentNode, variables?: OperationVariables): boolean {
    return this.cache.readQuery({ query, variables }) !== null;
  }

  makeStrategy(project: Project, operation: Operation): AbstractEndpointStrategy {
    const { uri } = operation.getContext();

    // istanbul ignore if
    if (typeof uri !== 'string') {
      throw new Error('missing uri in the context');
    }

    return createEndpointStrategy(uri, {
      operation,
      initialProject: project,
      context: this,
    });
  }

  trackOperation(project: Project, operation: Operation): void {
    this.operations.track(project.vid, operation);
  }

  onProjectOff(project: Project): void {
    // очищаем из кэша проект,
    // который больше не используется на клиенте
    this.cache.evict({
      id: this.cache.identify({ __typename: 'Project', vid: project.vid }),
    });

    this.cache.evict({
      id: this.cache.identify({ __typename: 'ProjectInner', vid: project.vid }),
    });

    this.operations.clear(project.vid);
  }

  onCurrentProjectUpdate(payload: Project & { operation: Operation }): void {
    const { vid, version } = payload;

    this.currentProject.setVersion(version);
    this.operations.markStaledAfterOperation(vid, payload.operation);
  }

  request(operation: Operation, forward: NextLink): Observable<FetchResult> {
    const project = this.currentProject.get();

    if (project === null) {
      return forward(operation);
    }

    const strategy = this.makeStrategy(project, operation);

    const attempt = this.operations.attempt(operation);

    return forward(operation).flatMap((fetchResult) => {
      strategy.processData(fetchResult.data);
      const staledOperations = this.operations.getStaled(project.vid);

      if (staledOperations.length > 0) {
        if (attempt < this.maxAttempts) {
          this.operations.attempt(operation);
        } else {
          throw new Error(
            `Project sync attempt limit exceeds. Project "${project.vid}". Attempts ${attempt}`,
          );
        }

        const staledQueriesPromises = staledOperations.map((staledOperation) => {
          return toPromise(this.request(staledOperation, forward)).then((result) => {
            this.operations.resetAttempt(staledOperation);

            // обновляем кэш сами, потому что
            // эти запросы не пойдут обратно по цепочке линков,
            // и apollo не обновит кэш автоматически
            this.cache.writeQuery({
              query: staledOperation.query,
              variables: staledOperation.variables,
              data: result.data,
            });
          });
        });

        this.operations.clearStaled(project.vid);

        return fromPromise(Promise.all(staledQueriesPromises)).map(() => fetchResult);
      }

      this.operations.resetAttempt(operation);
      return Observable.of(fetchResult);
    });
  }
}
