import { Logger } from './logger';
import { BrowserMessageWorker } from './message-worker';
import { Sink } from './sink';
import { MessageBus, MessageInput, QueueListener, QueueMessage, QueuePattern } from './types';

export class BrowserMessageBus implements MessageBus {
  private logger = new Logger('MessageBus');

  private worker = new BrowserMessageWorker();

  private sink = new Sink();

  static create(): BrowserMessageBus {
    return new BrowserMessageBus();
  }

  private constructor() {
    this.worker.listen((output) => {
      if (output.type === 'message') {
        this.logger.log('Получено сообщение из воркера', output);
        this.sink.push(output);
      }

      if (output.type === 'reply') {
        this.logger.log(`Команда "${output.meta.command}" выполнена`, {
          result: output.payload,
          input: output.meta,
        });
      }
    });
  }

  send(message: MessageInput): void {
    this.worker.send({ command: 'process-message', payload: message });
    this.logger.log('Отправлено сообщение', message);
  }

  peek(pattern: QueuePattern): QueueMessage | void {
    return this.sink.peek(pattern);
  }

  log(pattern: QueuePattern): QueueMessage[] {
    return this.sink.log(pattern);
  }

  subscribe<P>(pattern: QueuePattern, cb: QueueListener<P>): VoidFunction {
    return this.sink.subscribe<P>(pattern, cb);
  }
}
