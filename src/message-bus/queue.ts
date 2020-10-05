import { QueueMessage } from './types';

export class Queue {
  private max: number;

  private messages: QueueMessage[];

  constructor(maxSize: number) {
    this.max = maxSize;
    this.messages = [];
  }

  // LIFO queue
  enqueue(message: QueueMessage): void {
    if (this.messages.length === this.max) {
      this.messages.pop();
    }

    this.messages.unshift(message);
  }

  peek(): QueueMessage | void {
    return this.messages[0];
  }

  clean(): void {
    this.messages = [];
  }

  toArray(): QueueMessage[] {
    return this.messages.slice();
  }
}
