import { Queue } from './queue';

describe('Queue', () => {
  function seed(queue: Queue<number>, count: number): void {
    Array.from({ length: count }).forEach((_, index) => {
      queue.enqueue(index + 1);
    });
  }

  const max = 2;
  let queue: Queue<number>;

  beforeEach(() => {
    queue = new Queue<number>(max);
  });

  test('создается без ошибок', () => {
    expect(() => new Queue(0)).not.toThrow();
  });

  test('добавляет сообщения в начачло очереди', () => {
    seed(queue, 2);

    const messages = queue.toArray();

    expect(messages.length).toBe(2);
    expect(messages).toStrictEqual([2, 1]);
  });

  test('учитывает максимальный размер', () => {
    seed(queue, 3);

    const messages = queue.toArray();

    expect(messages.length).toBe(max);

    expect(queue.toArray()).toStrictEqual([3, 2]);
  });

  test('не мутирует возвращаемый массив', () => {
    seed(queue, 1);

    const messages = queue.toArray();

    queue.enqueue(2);

    expect(messages).not.toEqual(queue.toArray());
    expect(messages.length).not.toBe(queue.toArray().length);
  });

  test('peek указывает на первое сообщение в очереди', () => {
    seed(queue, 2);
    expect(queue.peek()).toBe(2);
  });

  test('очистка очереди', () => {
    seed(queue, 1);
    expect(queue.toArray().length).toBe(1);

    queue.clean();
    expect(queue.toArray().length).toBe(0);
  });
});
