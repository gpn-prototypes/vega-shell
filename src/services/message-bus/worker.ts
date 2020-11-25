import type { WorkerInputMessageEvent, WorkerOutput } from './types';

// eslint-disable-next-line no-restricted-globals
const worker = (self as unknown) as SharedWorkerGlobalScope;

class Hub {
  private ports: Set<MessagePort>;

  constructor() {
    this.ports = new Set();
  }

  public connect(port: MessagePort): void {
    this.ports.add(port);
  }

  public disconnect(port: MessagePort): void {
    try {
      port.close();
    } finally {
      this.ports.delete(port);
    }
  }

  public notify(output: WorkerOutput, options: { exclude?: MessagePort } = {}) {
    this.ports.forEach((port) => {
      if (port !== options.exclude) {
        port.postMessage(output);
      }
    });
  }
}

const hub = new Hub();

worker.addEventListener('connect', (e) => {
  const [port] = e.ports;

  hub.connect(port);

  port.addEventListener('message', (event: WorkerInputMessageEvent) => {
    const input = event.data;

    if (input.command === 'process-message') {
      const inputMessage = input.payload;

      const message = {
        channel: inputMessage.channel,
        topic: inputMessage.topic,
        payload: inputMessage.payload,
      };

      const params = {
        self: inputMessage.self ?? false,
      };

      hub.notify(
        { type: 'message', payload: message, meta: params },
        { exclude: params.self === false ? port : undefined },
      );

      return;
    }

    if (input.command === 'close') {
      hub.disconnect(port);
    }
  });

  port.start();
});
