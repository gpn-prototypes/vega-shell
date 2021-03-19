/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';

import { MessageBus } from '../message-bus';

import { Notification, NotificationProps } from './notification';

type Callback<T> = (payload: T) => void;

export type DispatchData = {
  action: string;
  shared: boolean;
};

export type DispatchPayload<T> = T;

type AddNotificationProps = { id?: string } & Omit<NotificationProps, 'id'>;
type AddNotificationCallback = ({ id }: { id: string }) => NotificationProps;

/**
 * Нотификации
 */
export class Notifications {
  public messageBus: MessageBus;

  private items: Notification[];

  constructor({ messageBus }: { messageBus: MessageBus }) {
    this.items = [];
    this.messageBus = messageBus;

    this.messageBus.subscribe<{ item: Notification }>(
      { channel: 'notifications', topic: 'add:notification' },
      ({ payload }) => {
        const notification = new Notification(payload.item);

        this.items = [...this.items, notification];

        this.publish('change', {
          items: this.items,
        });
      },
    );

    this.messageBus.subscribe<{ data: DispatchData; payload: DispatchPayload<any> }>(
      { channel: 'notifications', topic: 'dispatch:action' },
      ({ payload }) => {
        const { data, payload: p } = payload;

        this.publish(`action:${data.action}`, p);
      },
    );
  }

  public getAll(): Notification[] {
    return this.items;
  }

  public publish<T = any>(topic: string, payload: T): void {
    this.messageBus.send({
      channel: 'notifications',
      topic,
      payload,
    });
  }

  public subscribe<T = any>(topic: string, cb: Callback<T>): VoidFunction {
    return this.messageBus.subscribe<any>({ channel: 'notifications', topic }, (message) => {
      cb(message.payload);
    });
  }

  public on<T = any>(action: string, cb: Callback<T>): VoidFunction {
    return this.messageBus.subscribe<any>(
      { channel: 'notifications', topic: `action:${action}` },
      (message) => {
        cb(message.payload);
      },
    );
  }

  public add(props: AddNotificationProps | AddNotificationCallback): void {
    const uid = uuidv4();

    const isNotificationExists = typeof props !== 'function' && props.id && this.find(props.id);

    if (isNotificationExists) {
      return;
    }

    const notificationProps =
      typeof props === 'function' ? props({ id: uid }) : { ...props, id: props.id ?? uid };

    const item = new Notification(notificationProps);

    this.items = [item, ...this.items];

    this.publish('change', { items: this.items });

    if (item.shared) {
      this.messageBus.send({
        channel: 'notifications',
        topic: 'add:notification',
        self: false,
        broadcast: true,
        payload: {
          item,
        },
      });
    }
  }

  public dispatch<T>(data: DispatchData, payload?: DispatchPayload<T>): void {
    const { action } = data;
    this.publish(`action:${action}`, payload);

    if (data.shared) {
      this.messageBus.send({
        channel: 'notifications',
        topic: 'dispatch:action',
        broadcast: true,
        self: false,
        payload: {
          data,
          payload,
        },
      });
    }
  }

  public find(id: string): Notification | undefined {
    return this.items.find((item) => item.id === id);
  }

  public remove(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);

    this.publish('change', { items: this.items });
  }
}
