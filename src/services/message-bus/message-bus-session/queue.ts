export class Queue<Message> {
  private max: number;

  private messages: Message[];

  constructor(maxSize: number) {
    this.max = maxSize;
    this.messages = [];
  }

  // LIFO queue
  enqueue(message: Message): void {
    if (this.messages.length === this.max) {
      this.messages.pop();
    }

    this.messages.unshift(message);
  }

  peek(): Message | void {
    return this.messages[0];
  }

  clean(): void {
    this.messages = [];
  }

  toArray(): Message[] {
    return this.messages.slice();
  }
}
