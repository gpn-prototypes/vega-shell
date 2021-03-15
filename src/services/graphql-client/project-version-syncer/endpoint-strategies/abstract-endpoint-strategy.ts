import type { Operation } from '@apollo/client';

import * as utils from '../utils';

export interface Project {
  vid: string;
  version: number;
}

interface CurrentProject {
  get(): Project | null;
}

interface Context {
  currentProject: CurrentProject;
  trackOperation(project: Project, operation: Operation): void;
  onProjectOff(project: Project): void;
  onCurrentProjectUpdate(payload: Project & { operation: Operation }): void;
}

export interface Params {
  initialProject: Project;
  operation: Operation;
  context: Context;
}

export type Data = Record<string, unknown>;

export abstract class AbstractEndpointStrategy {
  protected readonly ctx: Context;

  private readonly initialProject: Project;

  private operation: Operation;

  constructor(params: Params) {
    this.initialProject = params.initialProject;
    this.operation = params.operation;
    this.ctx = params.context;
  }

  protected abstract findCurrentProject(data: Data, project: Project): Project | null;

  processData(data?: Data | null): void {
    const project = this.ctx.currentProject.get();

    if (project === null || project.vid !== this.initialProject.vid) {
      this.ctx.onProjectOff(this.initialProject);
      return;
    }

    if (data === null || data === undefined) {
      return;
    }

    const result = this.findCurrentProject(data, project);

    if (result === null) {
      return;
    }

    if (utils.hasOnlyQueryOperation(this.operation.query)) {
      this.ctx.trackOperation(project, this.operation);
    }

    if (result.version > project.version) {
      this.ctx.onCurrentProjectUpdate({ ...result, operation: this.operation });
    }
  }
}
