import { MessageBus } from './message-bus';
import type { MessageWorkerOutputListener } from './message-worker';
import type { MessageInput } from './types';

jest.mock('./logger', () => ({
  Logger: class Logger {
    // eslint-disable-next-line class-methods-use-this
    log() {}
  },
}));

describe('MessageBus', () => {
  let bus: MessageBus;

  beforeEach(() => {
    bus = MessageBus.create();
  });

  afterEach(() => {
    bus.dispose();
  });

  function createMessageInput(input: Partial<MessageInput> = {}) {
    const pattern = {
      channel: input.channel ?? 'test-channel',
      topic: input.topic ?? 'test-topic',
    };

    const payload = input.payload ?? 'test';

    return {
      pattern,
      payload,
      input: { ...pattern, payload, ...input },
    };
  }

  test('создается единая сессия', () => {
    expect(bus.session).toBe(MessageBus.getSession());
  });

  test('создание разных сессий', () => {
    expect(bus.session).not.toBe(MessageBus.create({ sameSession: false }).session);
  });

  test('сообщения между шинами общие', () => {
    const anotherBus = MessageBus.create();

    const { input, payload } = createMessageInput({ payload: 'test' });

    anotherBus.send(input);

    expect(bus.peek({ channel: 'test-channel', topic: 'test-topic' })).toMatchObject({
      payload,
    });
  });

  test('шина отсылает сообщение своим подписчикам', () => {
    const subscriber = jest.fn();

    const { input, pattern, payload } = createMessageInput();

    bus.subscribe(pattern, subscriber);
    bus.send(input);

    expect(subscriber).toBeCalledWith(
      expect.objectContaining({
        payload,
        params: expect.objectContaining({ self: true }),
      }),
    );
  });

  test('шина не отсылает сообщение своим подписчикам', () => {
    const subscriber = jest.fn();
    const pattern = { channel: 'test-channel', topic: 'test-topic' };
    const payload = 'test';

    bus.subscribe(pattern, subscriber);
    bus.send({ ...pattern, payload, self: false });

    expect(subscriber).not.toBeCalled();
  });

  test('шина получает сообщения от другой шины', () => {
    const subscriber = jest.fn();
    const { pattern, input, payload } = createMessageInput();
    const anotherBus = MessageBus.create();

    bus.subscribe(pattern, subscriber);
    anotherBus.send(input);

    expect(subscriber).toBeCalledWith(
      expect.objectContaining({
        payload,
        params: expect.objectContaining({ self: false }),
      }),
    );
  });

  test('выводится список последних сообщений', () => {
    const pattern = { channel: 'log', topic: 'test' };
    const message1 = createMessageInput({ ...pattern, payload: 'one' });
    const message2 = createMessageInput({ ...pattern, payload: 'two' });

    bus.send(message1.input);
    bus.send(message2.input);

    expect(bus.log(pattern)).toStrictEqual([
      expect.objectContaining({ payload: 'two' }),
      expect.objectContaining({ payload: 'one' }),
    ]);
  });

  test('оправка сообщения в другие вкладки', () => {
    const { input } = createMessageInput({ broadcast: true });
    const workerSendSpy = jest.spyOn(bus.session.worker, 'send');

    bus.send(input);

    expect(workerSendSpy).toBeCalledTimes(1);
  });

  test('обработка сообщения из другого контекста (вкладки, фрейма)', () => {
    let listener: MessageWorkerOutputListener = () => {};
    const subscriber = jest.fn();
    const { input, pattern } = createMessageInput();

    bus.subscribe(pattern, subscriber);
    bus.session.worker.setOutputListener = jest.fn((cb) => {
      listener = cb;
    });

    bus = MessageBus.create();

    listener({
      type: 'message',
      detail: {
        ...pattern,
        payload: input.payload,
        params: {
          broadcast: true,
          self: false,
          from: { bid: 'bus-id', sid: 'session-id' },
        },
      },
    });

    expect(subscriber).toBeCalled();
  });
});
