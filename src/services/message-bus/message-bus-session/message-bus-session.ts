import { v4 as uuid } from 'uuid';

import { MessageWorker } from '../message-worker/message-worker';
import type { Message } from '../types';

import { Sink } from './sink';

export class MessageBusSession {
  static createUuid(): string {
    return uuid();
  }

  readonly id: string;

  readonly sink: Sink<Message>;

  readonly worker: MessageWorker;

  constructor() {
    this.id = MessageBusSession.createUuid();
    this.sink = new Sink();
    this.worker = new MessageWorker();
    this.worker.connect();
  }

  kill(): void {
    this.sink.reset();
    this.worker.disconnect();
  }
}
