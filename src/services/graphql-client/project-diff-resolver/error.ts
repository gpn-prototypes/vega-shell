// istanbul ignore next проверяется на уровне typescript
export class ProjectDiffResolverError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectDiffResolverError';
    this.message = message;
  }
}
