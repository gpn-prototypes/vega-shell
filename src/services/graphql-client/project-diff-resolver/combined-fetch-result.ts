import { FetchResult } from '@apollo/client';

export class CombinedFetchResult {
  private fetchResult: FetchResult;

  constructor() {
    this.fetchResult = {};
  }

  public combine(incoming: FetchResult): void {
    this.combineProp('data', incoming);
    this.combineProp('errors', incoming);
    this.combineProp('context', incoming);
    this.combineProp('extensions', incoming);
  }

  private combineProp<P extends keyof FetchResult>(prop: P, incoming: FetchResult): void {
    const existing = this.fetchResult;

    if (prop === 'errors') {
      if (existing.errors === undefined && incoming.errors !== undefined) {
        existing.errors = incoming.errors;
      } else if (existing.errors !== undefined) {
        existing.errors = existing.errors.concat(incoming.errors ?? []);
      }

      return;
    }

    if (existing[prop] === undefined && incoming[prop] !== undefined) {
      this.fetchResult[prop] = incoming[prop];
    } else if (existing[prop] !== undefined) {
      this.fetchResult[prop] = { ...existing[prop], ...(incoming[prop] ?? {}) };
    }
  }

  get(): FetchResult {
    return this.fetchResult;
  }
}
