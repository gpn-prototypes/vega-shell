/* eslint-disable max-classes-per-file */
import { Message, WorkerInput, WorkerOutput, WorkerOutputMessageEvent } from '../types';

export interface MessageWorkerOutputListener {
  (output: WorkerOutput<Message>): void;
}

export class MessageWorkerError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'MessageWorkerError';
    this.message = message;
  }
}

export class ConnectionError extends MessageWorkerError {
  constructor(message: string) {
    super(message);

    this.message = `Connection error. ${message}`;
  }
}

export class MessageWorker {
  static isSupported(): boolean {
    try {
      return window.SharedWorker !== undefined;
    } catch {
      // istanbul ignore next
      return false;
    }
  }

  private worker: SharedWorker | null;

  private messageListener: null | ((event: WorkerOutputMessageEvent<Message>) => void);

  private outputListener: MessageWorkerOutputListener;

  constructor() {
    this.worker = null;
    this.messageListener = null;
    this.outputListener = () => {};
    this.close = this.close.bind(this);
  }

  private getConnectedWorker(): SharedWorker {
    if (this.worker === null) {
      throw new ConnectionError('SharedWorker is not connected');
    }

    return this.worker;
  }

  private close(): void {
    this.send({ command: 'close' });
  }

  private listen(): void {
    const worker = this.getConnectedWorker();

    this.messageListener = (event: WorkerOutputMessageEvent<Message>) => {
      this.outputListener(event.data);
    };

    worker.port.addEventListener('message', this.messageListener);
  }

  private unlisten(): void {
    const worker = this.getConnectedWorker();

    // istanbul ignore else
    if (this.messageListener !== null) {
      worker.port.removeEventListener('message', this.messageListener);
    }
  }

  isConnected(): boolean {
    return this.worker !== null;
  }

  connect(): void {
    if (this.isConnected() || !MessageWorker.isSupported()) {
      return;
    }

    window.addEventListener('beforeunload', this.close);
    this.worker = new SharedWorker('./shared-worker.ts', { type: 'module' });
    this.worker.port.start();
    this.listen();
  }

  disconnect(): void {
    if (this.isConnected() && MessageWorker.isSupported()) {
      window.removeEventListener('beforeunload', this.close);
      this.unlisten();
      this.close();
      this.worker = null;
    }
  }

  send(input: WorkerInput): void {
    if (MessageWorker.isSupported()) {
      this.getConnectedWorker().port.postMessage(input);
    }
  }

  setOutputListener(fn: MessageWorkerOutputListener): void {
    this.outputListener = fn;
  }
}
