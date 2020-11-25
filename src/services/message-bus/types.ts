/* eslint-disable @typescript-eslint/no-explicit-any */
export type ClientUID = string;

export interface Message<P = any> {
  channel: string;
  topic: string;
  payload?: P;
}
interface MessageParams {
  self: boolean;
}

export type MessageInput<P = any> = Message<P> & Partial<MessageParams>;

export interface Unsubscribe {
  (): void;
}

export interface QueueMessage<P = any> {
  payload: P;
  params: MessageParams;
}

export interface QueueListener<P = any> {
  (message: QueueMessage<P>): void;
}

export interface QueuePattern {
  channel: string;
  topic: string;
}

export interface Producer {
  send(message: MessageInput): void;
}

export interface Consumer {
  subscribe<P = any>(pattern: QueuePattern, listener: QueueListener<P>): Unsubscribe;
}

export interface MessageBus extends Producer, Consumer {
  log(pattern: QueuePattern): QueueMessage[];
  peek(pattern: QueuePattern): QueueMessage | void;
}

type Command<N extends string, P = void> = (P extends void
  ? { command: N }
  : { command: N; payload: P }) & {
  responseWithStatus?: boolean;
};

export type WorkerInput =
  | Command<'process-message', MessageInput>
  | Command<'setup-socket', { uri: string; cid: string }>
  | Command<'close'>;

export interface WorkerMessageEvent extends MessageEvent {
  data: Message;
}

export interface WorkerInputMessageEvent extends MessageEvent {
  data: WorkerInput;
}

interface WorkerEvent<T extends string, P = any, M = any> {
  type: T;
  payload: P;
  meta: M;
}

export type WorkerOutput =
  | WorkerEvent<'message', Message, MessageParams>
  | WorkerEvent<'reply', any, WorkerInput>;

export interface WorkerOutputMessageEvent extends MessageEvent {
  data: WorkerOutput;
}

export interface WorkerExtendableEvent extends ExtendableEvent {
  data: WorkerInput;
}
