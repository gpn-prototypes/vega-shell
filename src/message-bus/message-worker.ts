/* eslint-disable max-classes-per-file */
// eslint-disable-next-line import/extensions
import type { Unsubscribe, WorkerInput, WorkerOutput, WorkerOutputMessageEvent } from './types';

interface WorkerOutputListener {
  (output: WorkerOutput): void;
}

abstract class MessageWorker {
  abstract send(input: WorkerInput): void;

  abstract listen(listener: WorkerOutputListener): Unsubscribe;

  abstract disconnect(): void;
}

export class BrowserMessageWorker extends MessageWorker {
  private worker: SharedWorker;

  private subscriptions: Unsubscribe[];

  constructor() {
    super();

    this.worker = new SharedWorker('./worker.ts', { type: 'module' });
    this.worker.port.start();
    this.close = this.close.bind(this);
    this.subscriptions = [];

    window.addEventListener('beforeunload', this.close);
  }

  close(): void {
    this.send({ command: 'close' });
  }

  send(input: WorkerInput): void {
    this.worker.port.postMessage(input);
  }

  listen(fn: WorkerOutputListener): Unsubscribe {
    const listener = (event: WorkerOutputMessageEvent) => {
      fn(event.data);
    };

    this.worker.port.addEventListener('message', listener);

    const unsub = () => {
      this.worker.port.removeEventListener('message', listener);
    };

    this.subscriptions.push(unsub);

    return unsub;
  }

  removeAllListeners(): void {
    this.subscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });

    this.subscriptions = [];
  }

  disconnect(): void {
    window.removeEventListener('beforeunload', this.close);
    this.removeAllListeners();
    this.close();
  }
}
