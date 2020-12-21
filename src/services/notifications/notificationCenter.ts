/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';

import { MessageBus } from '../message-bus/types';

import { Notification, NotificationProps } from './notification/notification';
import { Notifications } from './notifications/notifications';
import { Callback, Topic, Unsubscribe } from './types';

type NotificationInterface = {
  add: (item: Omit<NotificationProps, 'namespace' | 'id'> & { id?: string }) => void;
  remove: (id: string) => void;
  actions: {
    on: (topic: Topic, cb: Callback) => Unsubscribe;
    dispatch: (data: { action: string; shared: boolean }, payload?: any) => void;
  };
  triggerChange: () => void;
};

export class NotificationCenter extends Notifications {
  public bus?: MessageBus;

  constructor({ bus }: { bus?: MessageBus }) {
    super();
    this.bus = bus;

    if (this.bus) {
      this.bus.subscribe({ channel: 'notification-center', topic: 'add' }, (payload) => {
        const notification = new Notification(payload.payload);

        this.notifications = [...this.notifications, notification];

        this.listeners.publish('notifications:change', { notifications: this.notifications });
      });

      this.bus.subscribe({ channel: 'notification-center', topic: 'remove' }, (payload) => {
        this.notifications = this.notifications.filter((item) => item.id !== payload.payload);

        this.listeners.publish('notifications:change', { notifications: this.notifications });
      });

      this.bus.subscribe({ channel: 'notification-center', topic: 'dispatch' }, (payload) => {
        const { data, payload: p } = payload.payload;

        this.listeners.publish(`actions:${data.namespace}:${data.action}`, p);
      });
    }
  }

  public createInterface(namespace: string): NotificationInterface {
    return {
      add: (item) => {
        const id = item.id ?? uuidv4();

        this.add({
          ...item,
          id: `${namespace}.${id}`,
          namespace,
        });
      },
      remove: (id) => {
        this.remove(`${namespace}.${id}`);
      },
      actions: {
        on: (action, cb) => {
          return this.listeners.subscribe(`actions:${namespace}:${action}`, cb);
        },
        dispatch: (data, payload) => {
          this.dispatchAction({ ...data, namespace }, payload);
        },
      },
      triggerChange: () => {
        this.triggerChange();
      },
    };
  }

  public dispatchAction(
    data: { action: string; namespace: string; shared: boolean },
    payload?: unknown,
  ): void {
    this.listeners.publish(`actions:${data.namespace}:${data.action}`, payload);

    if (data.shared && this.bus) {
      this.bus.send({
        channel: 'notification-center',
        topic: 'dispatch',
        payload: {
          data,
          payload,
        },
      });
    }
  }

  public add(item: NotificationProps): void {
    super.add(item);

    if (item.shared && this.bus) {
      this.bus.send({
        channel: 'notification-center',
        topic: 'add',
        payload: item,
      });
    }
  }

  public remove(id: string): void {
    const item = this.notifications.find((i) => i.id === id);
    super.remove(id);

    if (item?.shared && this.bus) {
      this.bus.send({
        channel: 'notification-center',
        topic: 'remove',
        payload: id,
      });
    }
  }
}
