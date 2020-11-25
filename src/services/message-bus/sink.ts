// eslint-disable-next-line max-classes-per-file
import { Queue } from './queue';
import { QueueListener, QueueMessage, QueuePattern, Unsubscribe, WorkerOutput } from './types';

type QueueKey = string;
type Filter<T, U> = T extends U ? T : never;

class QueueNotifier {
  listeners: Set<QueueListener> = new Set();

  notify(message: QueueMessage) {
    this.listeners.forEach((listener) => {
      listener(message);
    });
  }

  addListener(listener: QueueListener): Unsubscribe {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  removeAllListeners() {
    this.listeners.clear();
  }
}

interface QueueBucket {
  queue: Queue;
  notifier: QueueNotifier;
}

export class Sink {
  private buckets: Map<QueueKey, QueueBucket>;

  private static getQueueKey(pattern: QueuePattern): string {
    return `${pattern.channel}:${pattern.topic}`;
  }

  constructor() {
    this.buckets = new Map();
  }

  private useBucket(pattern: QueuePattern): QueueBucket {
    const queueKey = Sink.getQueueKey(pattern);
    let bucket = this.buckets.get(queueKey);

    if (bucket) {
      return bucket;
    }

    const queue = new Queue(10);
    const notifier = new QueueNotifier();
    bucket = { queue, notifier };

    this.buckets.set(queueKey, bucket);

    return bucket;
  }

  push(output: Filter<WorkerOutput, { type: 'message' }>): void {
    const message = output.payload;
    const pattern = { channel: message.channel, topic: message.topic };
    const bucket = this.useBucket(pattern);

    const queueMessage = { payload: message.payload, params: output.meta };

    bucket.queue.enqueue(queueMessage);
    bucket.notifier.notify(queueMessage);
  }

  peek(pattern: QueuePattern): QueueMessage | void {
    return this.useBucket(pattern).queue.peek();
  }

  log(pattern: QueuePattern): QueueMessage[] {
    return this.useBucket(pattern).queue.toArray();
  }

  clean(): void {
    this.buckets.forEach((bucket) => {
      bucket.queue.clean();
    });
  }

  subscribe<P>(pattern: QueuePattern, cb: QueueListener<P>): Unsubscribe {
    const bucket = this.useBucket(pattern);
    return bucket.notifier.addListener(cb);
  }
}
