import type { WorkerInput, WorkerInputMessageEvent, WorkerOutput } from '../types';

export type MessageEventListener = (event: WorkerInputMessageEvent) => void;
export interface Port {
  start(): void;
  close(): void;
  postMessage(message: unknown): void;
  addEventListener(name: 'message', cb: MessageEventListener): void;
  removeEventListener(name: 'message', cb: MessageEventListener): void;
}

export interface ConnectEvent {
  ports: Readonly<Port[]>;
}

export class Worker {
  private ports: Set<Port>;

  private portsMessageListenersMap: Map<Port, MessageEventListener>;

  constructor() {
    this.ports = new Set();
    this.portsMessageListenersMap = new Map();
  }

  private share(initiator: Port, output: WorkerOutput): void {
    this.ports.forEach((port) => {
      if (port !== initiator) {
        port.postMessage(output);
      }
    });
  }

  private closePort(port: Port): void {
    try {
      port.close();
    } finally {
      this.ports.delete(port);
      this.unbindMessageEventListener(port);
    }
  }

  private execute(initiator: Port, input: WorkerInput): void {
    if (input.command === 'process-message') {
      const message = input.data;
      const output: WorkerOutput = {
        type: 'message',
        detail: message,
      };

      this.share(initiator, output);
      return;
    }

    if (input.command === 'close') {
      this.closePort(initiator);
    }
  }

  private bindMessageEventListener(port: Port, listener: MessageEventListener): void {
    this.portsMessageListenersMap.set(port, listener);
    port.addEventListener('message', listener);
  }

  private unbindMessageEventListener(port: Port): void {
    const listener = this.portsMessageListenersMap.get(port);
    if (listener !== undefined) {
      port.removeEventListener('message', listener);
      this.portsMessageListenersMap.delete(port);
    }
  }

  public hasPort(port: Port): boolean {
    return this.ports.has(port);
  }

  public handleConnectEvent(event: ConnectEvent): void {
    const [port] = event.ports;

    this.ports.add(port);

    this.bindMessageEventListener(port, ({ data: input }) => {
      this.execute(port, input);
    });

    port.start();
  }
}
