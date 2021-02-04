export function makePromise(res: unknown): Promise<unknown> {
  return new Promise((resolve) => setTimeout(() => resolve(res)));
}
