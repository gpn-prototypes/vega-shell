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
}

type CheckoutStatus =
  | { code: Code.Idle }
  | { code: Code.Done; project: Project }
  | { code: Code.InProgress; vid: ProjectVID }
  | { code: Code.NotFound; vid: ProjectVID }
  | { code: Code.Error; vid: ProjectVID };

export enum FindProjectResult {
  Success = 'SUCCESS',
  NotFound = 'NOT_FOUND',
  Error = 'ERROR',
}
interface FindProject {
  (vid: ProjectVID): Promise<FindProjectResult>;
}
interface Params {
  findProject: FindProject;
}

export class CurrentProject {
  private checkoutStatus: CheckoutStatus;

  private findProject: FindProject;

  readonly codes: typeof Code;

  constructor(params: Params) {
    this.codes = Code;
    this.findProject = params.findProject;
    this.checkoutStatus = {
      code: Code.Idle,
    };
  }

  private toIdle(): void {
    this.checkoutStatus = {
      code: Code.Idle,
    };
  }

  private toInProgress(vid: ProjectVID): void {
    this.checkoutStatus = {
      code: Code.InProgress,
      vid,
    };
  }

  private toDone(vid: ProjectVID): void {
    this.checkoutStatus = {
      code: Code.Done,
      project: {
        vid,
      },
    };
  }

  private toError(vid: ProjectVID): void {
    this.checkoutStatus = {
      code: Code.Error,
      vid,
    };
  }

  private toNotFound(vid: ProjectVID): void {
    this.checkoutStatus = {
      code: Code.NotFound,
      vid,
    };
  }

  public async checkout(vid: ProjectVID): Promise<CheckoutStatus> {
    this.toInProgress(vid);

    try {
      const result = await this.findProject(vid);

      if (result === FindProjectResult.NotFound) {
        this.toNotFound(vid);
        return this.status();
      }

      if (result === FindProjectResult.Success) {
        this.toDone(vid);
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
