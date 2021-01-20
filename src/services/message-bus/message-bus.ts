import { Logger } from './logger';
import { MessageBusSession } from './message-bus-session';
import type { Message, MessageInput, QueueListener, QueuePattern, WorkerOutput } from './types';

interface MessageBusParams {
  debug?: boolean;
  sameSession: boolean;
}
export class MessageBus {
  private static session: MessageBusSession | null = null;

  static getSession(): MessageBusSession {
    MessageBus.session ??= new MessageBusSession();
    return MessageBus.session;
  }

  private id: string;

  private debug: boolean;

  readonly session: MessageBusSession;

  private logger = new Logger('MessageBus');

  static create(params?: Partial<MessageBusParams>): MessageBus {
    return new MessageBus(params);
  }

  constructor(params?: Partial<MessageBusParams>) {
    const { sameSession = true, debug = false } = params ?? {};

    this.debug = debug;

    if (!sameSession) {
      this.session = new MessageBusSession();
    } else {
      this.session = MessageBus.getSession();
    }

    this.id = MessageBusSession.createUuid();
    this.session.worker.setOutputListener((output) => {
      this.handleOutput(output);
    });
  }

  private handleOutput(output: WorkerOutput<Message>): void {
    // istanbul ignore next
    if (this.debug) {
      this.logger.log('Получено сообщение из воркера', output);
    }

    // istanbul ignore else
    if (output.type === 'message') {
      const message = output.detail;

      const pattern: QueuePattern = {
        channel: message.channel,
        topic: message.topic,
      };

      this.session.sink.push(pattern, this.identifySelfMessage(message));
    }
  }

  private identifySelfMessage(message: Message): Message {
    return {
      ...message,
      params: {
        ...message.params,
        self: this.id === message.params.from.bid,
      },
    };
  }

  private createMessage(input: MessageInput): Message {
    return {
      channel: input.channel,
      topic: input.topic,
      payload: input.payload,
      params: {
        broadcast: input.broadcast ?? false,
        self: input.self ?? true,
        from: {
          bid: this.id,
          sid: this.session.id,
        },
      },
    };
  }

  dispose(): void {
    this.session.kill();
  }

  send(input: MessageInput): void {
    const message = this.createMessage(input);
    const pattern = { channel: message.channel, topic: message.topic };

    this.session.sink.push(pattern, message);

    if (message.params.broadcast) {
      this.session.worker.send({ command: 'process-message', data: message });
    }

    // istanbul ignore next
    if (this.debug) {
      this.logger.log('Отправлено сообщение', message);
    }
  }

  peek<P>(pattern: QueuePattern): Message<P> | void {
    return this.session.sink.peek(pattern);
  }

  log<P>(pattern: QueuePattern): Message<P>[] {
    return this.session.sink.log(pattern);
  }

  subscribe<P>(pattern: QueuePattern, cb: QueueListener<P>): VoidFunction {
    return this.session.sink.subscribe(pattern, (message) => {
      if (message.params.from.bid === this.id && !message.params.self) {
        return;
      }

      cb(this.identifySelfMessage(message));
    });
  }
}
