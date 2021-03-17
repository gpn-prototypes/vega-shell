import type { DocumentNode, Operation, OperationVariables } from '@apollo/client';
import { print } from 'graphql';

type ProjectVid = string;
type OperationsByProject = Map<ProjectVid, Set<Operation>>;

interface Context {
  isCached(query: DocumentNode, variables: OperationVariables): boolean;
}

interface Params {
  context: Context;
}

function hasOperationName(operation: Operation): boolean {
  return typeof operation.operationName === 'string';
}

export class ProjectOperations {
  private readonly trackedByProject: OperationsByProject;

  private readonly staledByProject: OperationsByProject;

  private readonly attempts: Map<Operation, number>;

  private readonly ctx: Context;

  constructor(params: Params) {
    this.staledByProject = new Map();
    this.trackedByProject = new Map();
    this.attempts = new Map();
    this.ctx = params.context;
  }

  track(vid: ProjectVid, operation: Operation): void {
    const tracked = this.getTrackedSet(vid);

    tracked.forEach((op) => {
      if (!hasOperationName(operation) && !hasOperationName(op)) {
        // анонимные запросы сравниваются по телу
        if (print(operation.query) === print(op.query)) {
          tracked.delete(op);
        }

        return;
      }

      // если операция с таким именем уже отслеживается,
      // то удаляем старую и добавляем новую
      if (op.operationName === operation.operationName) {
        tracked.delete(op);
      }
    });

    tracked.add(operation);
  }

  attempt(operation: Operation): number {
    const current = this.attempts.get(operation) ?? 0;
    const count = current + 1;

    this.attempts.set(operation, count);

    return count;
  }

  resetAttempt(operation: Operation): void {
    this.attempts.delete(operation);
  }

  drop(vid: ProjectVid, operation: Operation): void {
    const tracked = this.getTrackedSet(vid);
    tracked.delete(operation);
    this.resetAttempt(operation);
  }

  private getTrackedSet(vid: ProjectVid): Set<Operation> {
    const tracked = this.trackedByProject.get(vid) ?? new Set();

    this.trackedByProject.set(vid, tracked);

    return tracked;
  }

  private getStaledSet(vid: ProjectVid): Set<Operation> {
    const staled = this.staledByProject.get(vid) ?? new Set();
    this.staledByProject.set(vid, staled);

    return staled;
  }

  getStaled(vid: ProjectVid): Operation[] {
    const set = this.getStaledSet(vid);

    return Array.from(set);
  }

  markStaledAfterOperation(vid: ProjectVid, triggeredOperation: Operation): Operation[] {
    const tracked = this.getTrackedSet(vid);
    const staled = this.getStaledSet(vid);

    tracked.forEach((operation) => {
      // игнорируем операцию, которая вызвала обновление
      if (operation === triggeredOperation) {
        return;
      }

      // Считаем, что если данных нет в кэше, то они
      // больше не используется на клиенте, и перезапрашивать
      // их уже не нужно. Поэтому удаляем их из списка отслеживаемых
      if (!this.ctx.isCached(operation.query, operation.variables)) {
        tracked.delete(operation);
        return;
      }

      staled.add(operation);
    });

    return this.getStaled(vid);
  }

  clearStaled(vid: ProjectVid): void {
    this.getStaledSet(vid).clear();
  }

  clear(vid: ProjectVid): void {
    this.clearStaled(vid);
    this.getTrackedSet(vid).clear();
  }
}
