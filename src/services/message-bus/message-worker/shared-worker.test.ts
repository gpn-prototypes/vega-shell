import type { ConnectEvent } from './worker';

describe('SharedWorker', () => {
  let handler: (event: ConnectEvent) => void;

  const spy = jest.spyOn(global, 'addEventListener').mockImplementation((name, cb) => {
    if (name === 'connect') {
      // @ts-expect-error: ругается на мок
      handler = cb;
    }
  });

  afterAll(() => {
    spy.mockRestore();
  });

  const port = {
    start: jest.fn(),
    close: jest.fn(),
    postMessage: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  const event = {
    ports: [port],
  };

  test('обрабатывает connect', async () => {
    await import('./shared-worker');
    expect(handler).not.toBe(undefined);
    expect(() => handler(event)).not.toThrow();
  });
});
