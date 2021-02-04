enum Code {
  IDLE = 'IDLE',
  NOT_FOUND = 'NOT_FOUND',
  CHECKOUT = 'CHECKOUT',
  CHECKED = 'CHECKED',
  ERROR = 'ERROR',
}

type ProjectVID = string;

type CheckoutStatus =
  | { code: Code.IDLE }
  | { code: Code.CHECKOUT; vid: ProjectVID }
  | { code: Code.CHECKED; vid: ProjectVID }
  | { code: Code.NOT_FOUND; vid: ProjectVID }
  | { code: Code.ERROR; vid: ProjectVID };

export enum FindProjectResult {
  SUCCESS,
  NOT_FOUND,
  ERROR,
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
      code: Code.IDLE,
    };
  }

  private toIdle(): void {
    this.checkoutStatus = {
      code: Code.IDLE,
    };
  }

  private toCheckout(vid: ProjectVID): void {
    this.checkoutStatus = {
      code: Code.CHECKOUT,
      vid,
    };
  }

  private toChecked(vid: ProjectVID): void {
    this.checkoutStatus = {
      code: Code.CHECKED,
      vid,
    };
  }

  private toError(vid: ProjectVID): void {
    this.checkoutStatus = {
      code: Code.ERROR,
      vid,
    };
  }

  private toNotFound(vid: ProjectVID): void {
    this.checkoutStatus = {
      code: Code.NOT_FOUND,
      vid,
    };
  }

  public async checkout(vid: ProjectVID): Promise<CheckoutStatus> {
    this.toCheckout(vid);

    try {
      const result = await this.findProject(vid);

      if (result === FindProjectResult.NOT_FOUND) {
        this.toNotFound(vid);
      } else if (result === FindProjectResult.ERROR) {
        this.toError(vid);
      } else if (result === FindProjectResult.SUCCESS) {
        this.toChecked(vid);
      }
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
}
