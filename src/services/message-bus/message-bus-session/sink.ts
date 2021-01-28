import { QueuePattern, Unsubscribe } from '../types';

import { Notifier } from './notifier';
import { Queue } from './queue';

type QueueKey = string;
interface QueueBucket<Message> {
  queue: Queue<Message>;
  notifier: Notifier<Message>;
}

export class Sink<Message> {
  private max: number;

  private buckets: Map<QueueKey, QueueBucket<Message>>;

  private static getQueueKey(pattern: QueuePattern): string {
    return `${pattern.channel}:${pattern.topic}`;
  }

  constructor(max = 10) {
    this.buckets = new Map();
    this.max = max;
  }

  private useBucket(pattern: QueuePattern): QueueBucket<Message> {
    const queueKey = Sink.getQueueKey(pattern);
    let bucket = this.buckets.get(queueKey);

    if (bucket) {
      return bucket;
    }

    const queue = new Queue<Message>(this.max);
    const notifier = new Notifier<Message>();
    bucket = { queue, notifier };

    this.buckets.set(queueKey, bucket);

    return bucket;
  }

  push(pattern: QueuePattern, message: Message): void {
    const bucket = this.useBucket(pattern);

    bucket.queue.enqueue(message);
    bucket.notifier.notify(message);
  }

  peek(pattern: QueuePattern): Message | void {
    return this.useBucket(pattern).queue.peek();
  }

  log(pattern: QueuePattern): Message[] {
    return this.useBucket(pattern).queue.toArray();
  }

  clean(): void {
    this.buckets.forEach((bucket) => {
      bucket.queue.clean();
    });
  }

  removeAllListeners(): void {
    this.buckets.forEach((bucket) => {
      bucket.notifier.removeAllListeners();
    });
  }

  reset(): void {
    this.clean();
    this.removeAllListeners();
  }

  subscribe(pattern: QueuePattern, cb: (message: Message) => void): Unsubscribe {
    const bucket = this.useBucket(pattern);
    return bucket.notifier.addListener(cb);
  }
}
