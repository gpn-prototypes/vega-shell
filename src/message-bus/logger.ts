/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
export class Logger {
  private scope: string;

  constructor(scope: string) {
    this.scope = scope;
  }

  private template(message: string): string {
    return `[${this.scope}] ${message}`;
  }

  log(message: string, ...args: any[]): void {
    console.groupCollapsed(this.template(message));

    args.forEach((arg) => {
      console.log(arg);
    });

    console.groupEnd();
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.template(message), ...args);
  }
}
