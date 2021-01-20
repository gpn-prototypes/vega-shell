import { Sink } from './sink';

describe('Sink', () => {
  let sink: Sink<string>;

  const pattern1 = { channel: 'test', topic: 'one' };
  const pattern2 = { channel: 'test', topic: 'two' };

  beforeEach(() => {
    sink = new Sink();
  });

  afterEach(() => {
    sink.reset();
  });

  test('добавляются сообщения', () => {
    const message1 = 'test 1';
    const message2 = 'test 2';

    sink.push(pattern1, message1);
    sink.push(pattern2, message2);

    expect(sink.peek(pattern1)).toBe(message1);
    expect(sink.peek(pattern2)).toBe(message2);
  });

  test('выводится список последних сообщений', () => {
    sink.push(pattern1, 'one');
    sink.push(pattern1, 'two');
    sink.push(pattern2, 'three');
    sink.push(pattern2, 'four');

    const log1 = sink.log(pattern1);
    const log2 = sink.log(pattern2);

    expect(log1).toStrictEqual(['two', 'one']);
    expect(log2).toStrictEqual(['four', 'three']);
  });

  test('срабатывает очистка', () => {
    const message = 'test';
    sink.push(pattern1, message);
    sink.push(pattern2, message);

    sink.clean();

    expect(sink.log(pattern1)).toStrictEqual([]);
    expect(sink.log(pattern2)).toStrictEqual([]);
  });

  test('подписка на очередь', () => {
    const message1 = 'test 1';
    const message2 = 'test 2';
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    sink.subscribe(pattern1, listener1);
    sink.subscribe(pattern2, listener2);
    sink.push(pattern1, message1);
    sink.push(pattern2, message2);

    expect(listener1).toBeCalledWith(message1);
    expect(listener2).toBeCalledWith(message2);
  });

  test('отписка от очереди', () => {
    const message = 'test';
    const listener = jest.fn();
    const unsub1 = sink.subscribe(pattern1, listener);

    unsub1();
    sink.push(pattern1, message);

    expect(listener).not.toBeCalled();
  });

  test('отписка всех слушателей', () => {
    const message = 'test';
    const listener = jest.fn();
    sink.subscribe(pattern1, listener);

    sink.removeAllListeners();
    sink.push(pattern1, message);

    expect(listener).not.toBeCalled();
  });
});
