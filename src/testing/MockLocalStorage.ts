export class MockLocalStorage {
  private store = new Map();

  readonly length = Infinity;

  public clear(): void {
    this.store.clear();
  }

  public getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  public setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  public removeItem(key: string): void {
    this.store.delete(key);
  }

  public key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }
}
