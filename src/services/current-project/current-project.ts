enum Code {
  Idle = 'IDLE',
  NotFound = 'NOT_FOUND',
  InProgress = 'IN_PROGRESS',
  Done = 'DONE',
  Error = 'ERROR',
}

type ProjectVID = string;

interface Project {
  vid: ProjectVID;
  version: number;
}

type CheckoutStatus =
  | { code: Code.Idle }
  | { code: Code.Done; project: Project }
  | { code: Code.InProgress; vid: ProjectVID }
  | { code: Code.NotFound; vid: ProjectVID }
  | { code: Code.Error; vid: ProjectVID };

export enum FindProjectResultCode {
  Success = 'SUCCESS',
  NotFound = 'NOT_FOUND',
  Error = 'ERROR',
}

export type FindProjectResult =
  | { code: FindProjectResultCode.Success; project: Project }
  | { code: FindProjectResultCode.NotFound }
  | { code: FindProjectResultCode.Error };

interface FindProject {
  (vid: ProjectVID): Promise<FindProjectResult>;
}

interface OnStatusChange {
  (status: Readonly<CheckoutStatus>): void;
}

interface Params {
  findProject: FindProject;
  onStatusChange: OnStatusChange;
}

export class CurrentProject {
  private checkoutStatus: Readonly<CheckoutStatus>;

  private findProject: FindProject;

  private onStatusChange: OnStatusChange;

  readonly codes: typeof Code;

  constructor(params: Params) {
    this.codes = Code;
    this.findProject = params.findProject;
    this.onStatusChange = params.onStatusChange;
    this.checkoutStatus = Object.freeze({
      code: Code.Idle,
    });
  }

  private setStatus(status: CheckoutStatus) {
    this.checkoutStatus = Object.freeze({ ...status });
    this.onStatusChange(this.checkoutStatus);
  }

  private toIdle(): void {
    this.setStatus({ code: Code.Idle });
  }

  private toInProgress(vid: ProjectVID): void {
    this.setStatus({ code: Code.InProgress, vid });
  }

  private toDone(project: Project): void {
    this.setStatus({ code: Code.Done, project });
  }

  private toError(vid: ProjectVID): void {
    this.setStatus({ code: Code.Error, vid });
  }

  private toNotFound(vid: ProjectVID): void {
    this.setStatus({ code: Code.NotFound, vid });
  }

  public setVersion(version: number): void {
    if (
      this.checkoutStatus.code === this.codes.Done &&
      this.checkoutStatus.project.version < version
    ) {
      this.toDone({ ...this.checkoutStatus.project, version });
    }
  }

  public async checkout(vid: ProjectVID): Promise<CheckoutStatus> {
    this.toInProgress(vid);

    try {
      const result = await this.findProject(vid);

      if (result.code === FindProjectResultCode.NotFound) {
        this.toNotFound(vid);
        return this.status();
      }

      if (result.code === FindProjectResultCode.Success) {
        this.toDone(result.project);
        return this.status();
      }

      this.toError(vid);
    } catch (err) {
      this.toError(vid);
    }

    return this.status();
  }

  public release(): void {
    this.toIdle();
  }

  public status(): CheckoutStatus {
    return this.checkoutStatus;
  }

  public get(): Project | null {
    if (this.checkoutStatus.code === Code.Done) {
      return this.checkoutStatus.project;
    }

    return null;
  }
}
