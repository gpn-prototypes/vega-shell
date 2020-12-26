import type { WorkerInputMessageEvent, WorkerOutput } from './types';

// eslint-disable-next-line no-restricted-globals
const worker = (self as unknown) as SharedWorkerGlobalScope;

interface NotifyParams {
  initiator: MessagePort;
  self: boolean;
  broadcast: boolean;
}

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

  public notify(output: WorkerOutput, params: NotifyParams) {
    this.ports.forEach((port) => {
      if (params.self && port === params.initiator) {
        port.postMessage(output);
        return;
      }

      if (!params.broadcast) {
        return;
      }

      if (output.type === 'message') {
        port.postMessage({
          ...output,
          meta: {
            ...output.meta,
            self: false,
          },
        });
      } else {
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
        self: inputMessage.self ?? true,
        broadcast: inputMessage.broadcast ?? false,
      };

      hub.notify(
        { type: 'message', payload: message, meta: params },
        { initiator: port, self: params.self, broadcast: params.broadcast },
      );

      return;
    }

    if (input.command === 'close') {
      hub.disconnect(port);
    }
  });

  port.start();
});
