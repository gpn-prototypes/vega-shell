/* eslint-disable @typescript-eslint/no-explicit-any */
export type UUID = string;

export interface Message<P = any> {
  channel: string;
  topic: string;
  payload: P;
  params: MessageParams;
}

interface MessageParams {
  broadcast: boolean;
  self: boolean;
  from: { sid: UUID; bid: UUID };
}

export interface MessageInput<P = any> {
  channel: string;
  topic: string;
  payload?: P;
  broadcast?: boolean;
  self?: boolean;
}

export interface Unsubscribe {
  (): void;
}

export interface QueueListener<P = any> {
  (message: Message<P>): void;
}

export interface QueuePattern {
  channel: string;
  topic: string;
}

type Command<Name extends string, D = void> = D extends void
  ? { command: Name }
  : { command: Name; data: D };

export type WorkerInput<M = unknown> = Command<'process-message', M> | Command<'close'>;

export interface WorkerMessageEvent extends MessageEvent {
  data: Message;
}

export interface WorkerInputMessageEvent<M = unknown> extends MessageEvent {
  data: WorkerInput<M>;
}

interface WorkerEvent<T extends string, D = any> {
  type: T;
  detail: D;
}

export type WorkerOutput<M = unknown> = WorkerEvent<'message', M>;

export interface WorkerOutputMessageEvent<M = unknown> extends MessageEvent {
  data: WorkerOutput<M>;
}
