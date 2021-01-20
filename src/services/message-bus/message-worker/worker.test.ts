import type { WorkerInput } from '../types';

import type { MessageEventListener, Port } from './worker';
import { Worker } from './worker';

describe('Worker', () => {
  let worker: Worker;
  const portListenerMap = new Map<Port, MessageEventListener>();

  function createPort() {
    const port = {
      start: jest.fn(),
      close: jest.fn(),
      postMessage: jest.fn(),
      removeEventListener: jest.fn(),
      addEventListener: jest.fn((eventName: string, cb) => {
        if (eventName === 'message') {
          portListenerMap.set(port, cb);
        }
      }),
    };

    return port;
  }

  function execute(port: Port, input: WorkerInput) {
    const event = new MessageEvent<WorkerInput>('message', {
      data: input,
    });

    const listener = portListenerMap.get(port);

    if (listener === undefined) {
      throw new Error('Listener for a port is missing');
    }

    listener(event);
  }

  beforeEach(() => {
    worker = new Worker();
  });

  afterAll(() => {
    portListenerMap.clear();
  });

  function connectPort() {
    const port = createPort();
    worker.handleConnectEvent({ ports: [port] });
    return port;
  }

  test('обрабатывает событие connect', () => {
    const port = connectPort();

    expect(worker.hasPort(port)).toBe(true);
    expect(port.start).toBeCalled();
    expect(port.addEventListener).toBeCalled();
  });

  test('обрабатывается закрытие порта', () => {
    const port = connectPort();

    execute(port, { command: 'close' });

    expect(worker.hasPort(port)).toBe(false);
    expect(port.removeEventListener).toBeCalled();
  });

  test('повторноее закрытие порта не имеет эффекта', () => {
    const port = connectPort();

    execute(port, { command: 'close' });
    execute(port, { command: 'close' });

    expect(port.removeEventListener).toBeCalledTimes(1);
  });

  test('сообщение получают все порты, кроме отправителя', () => {
    const port1 = connectPort();
    const port2 = connectPort();

    const message = 'test';

    execute(port1, { command: 'process-message', data: message });

    expect(port1.postMessage).not.toBeCalled();
    expect(port2.postMessage).toBeCalledWith({ type: 'message', detail: message });
  });

  test('отправка неизвестной комманды не имеет эффекта', () => {
    const port = connectPort();

    expect(() => {
      // @ts-expect-error: неизвестная комманда
      execute(port, { command: 'unknown' });
    }).not.toThrow();
  });
});
