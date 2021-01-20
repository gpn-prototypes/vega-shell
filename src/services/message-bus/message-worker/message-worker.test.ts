import { ConnectionError, MessageWorker } from './message-worker';

describe('MessageWorker', () => {
  let worker: MessageWorker;

  const port = {
    postMessage: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    start: jest.fn(),
  };

  beforeAll(() => {
    class FakeSharedWorker {
      port = port;
    }

    Object.defineProperty(global, 'SharedWorker', {
      value: FakeSharedWorker,
      writable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(global, 'SharedWorker', {
      value: undefined,
      writable: true,
    });
  });

  beforeEach(() => {
    worker = new MessageWorker();
    port.postMessage.mockClear();
    port.addEventListener.mockClear();
    port.removeEventListener.mockClear();
    port.start.mockClear();
  });

  afterEach(() => {
    worker.disconnect();
  });

  test('попытка отправить комманду в воркер до connect создает исключение', () => {
    expect(() => worker.send({ command: 'close' })).toThrowError(ConnectionError);
    worker.disconnect();
  });

  test('вызов connect создает подключение к порту', () => {
    worker.connect();
    expect(port.start).toBeCalledTimes(1);
    expect(port.addEventListener).toBeCalledTimes(1);
  });

  test('повторный connect не имеет эффекта', () => {
    worker.connect();
    worker.connect();
    expect(port.start).toBeCalledTimes(1);
    expect(port.addEventListener).toBeCalledTimes(1);
  });

  test('вызов disconnect отписывает от сообщений и закрывает порт', () => {
    worker.connect();
    worker.disconnect();
    expect(port.removeEventListener).toBeCalledTimes(1);
    expect(port.postMessage).toBeCalledWith({ command: 'close' });
  });

  test('повторный disconnect не имеет эффекта', () => {
    worker.connect();
    worker.disconnect();
    worker.disconnect();
    expect(port.removeEventListener).toBeCalledTimes(1);
    expect(port.postMessage).toBeCalledTimes(1);
  });

  test('после соединения isConnected возвращает true', () => {
    expect(worker.isConnected()).toBe(false);
    worker.connect();
    expect(worker.isConnected()).toBe(true);
  });

  test('после разединения isConnected возвращает false', () => {
    worker.connect();
    worker.disconnect();
    expect(worker.isConnected()).toBe(false);
  });

  describe('подписка', () => {
    let callback = () => {};
    const message = { channel: 'test', topic: 'example' };

    port.addEventListener.mockImplementation((_, cb) => {
      callback = () => cb({ data: message });
    });

    function sendMessage() {
      worker.send({ command: 'process-message', data: message });
      callback();
    }

    beforeEach(() => {
      worker.connect();
    });

    test('слушатель получает сообщения из воркера', () => {
      const listener = jest.fn();

      worker.setOutputListener(listener);
      sendMessage();

      expect(listener).toBeCalledTimes(1);
    });

    test('можно изменять слушателя', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      worker.setOutputListener(listener1);
      worker.setOutputListener(listener2);
      sendMessage();

      expect(listener1).toBeCalledTimes(0);
      expect(listener2).toBeCalledTimes(1);
    });

    test('отсутсвие слушателя не имеет эффекта', () => {
      expect(sendMessage).not.toThrow();
    });
  });

  test('при beforeunload происходит отписка от воркера', () => {
    const eventsMap = new Map<string, VoidFunction[]>();
    const originalAddEventListener = global.addEventListener;

    global.addEventListener = jest.fn((type, listener) => {
      const listeners = eventsMap.get(type) ?? [];
      eventsMap.set(type, [...listeners, listener as VoidFunction]);
    });

    worker.connect();
    const [unload] = eventsMap.get('beforeunload') as VoidFunction[];
    unload();

    expect(port.postMessage).toBeCalledWith({ command: 'close' });

    global.addEventListener = originalAddEventListener;
  });
});
