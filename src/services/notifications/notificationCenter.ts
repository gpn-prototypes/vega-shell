/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';

import { MessageBus } from '../message-bus';

import { Notification, NotificationProps } from './notification/notification';
import { Notifications, PubSub } from './notifications/notifications';
import { Callback, Topic, Unsubscribe } from './types';

export enum ACTION_DELIMITER {
  user = ':',
  system = '-',
}

export type DispatchData = {
  action: string;
  namespace: string;
  shared: boolean;
  delimiter?: ACTION_DELIMITER;
};
export type DispatchPayload<T> = T;

export type NamespaceItem = Omit<NotificationProps, 'namespace' | 'id'> & { id?: string };
export type NamespaceDispatchData = Omit<DispatchData, 'namespace'>;

type Namespace = {
  add: (item: NamespaceItem) => string;
  remove: (id: string) => void;
  actions: {
    on: (topic: Topic, cb: Callback) => Unsubscribe;
    dispatch<T = any>(data: NamespaceDispatchData, payload?: DispatchPayload<T>): void;
  };
  onClose: (cb: Callback) => Unsubscribe;
};

export class NotificationCenter {
  public bus?: MessageBus;

  public notifications: Notifications;

  public actions: PubSub;

  public subscribe: typeof Notifications.prototype.subscribe;

  public publish: typeof Notifications.prototype.publish;

  constructor({ bus }: { bus?: MessageBus }) {
    this.bus = bus;
    this.notifications = new Notifications();
    this.actions = new PubSub();

    this.subscribe = this.notifications.subscribe.bind(this.notifications);
    this.publish = this.notifications.publish.bind(this.notifications);

    if (this.bus) {
      this.bus.subscribe<{ notification: Notification }>(
        { channel: 'notification-center', topic: 'add' },
        ({ payload }) => {
          const notification = new Notification(payload.notification);

          this.notifications.notifications = [...this.notifications.notifications, notification];

          this.notifications.publish<{ notifications: Notification[] }>('change', {
            notifications: this.notifications.notifications,
          });
        },
      );

      this.bus.subscribe<{ id: string }>(
        { channel: 'notification-center', topic: 'remove' },
        ({ payload }) => {
          this.notifications.notifications = this.notifications.notifications.filter(
            (item) => item.id !== payload.id,
          );

          this.notifications.publish<{ notifications: Notification[] }>('change', {
            notifications: this.notifications.notifications,
          });
        },
      );

      this.bus.subscribe<{ data: DispatchData; payload: DispatchPayload<any> }>(
        { channel: 'notification-center', topic: 'dispatch' },
        ({ payload }) => {
          const { data, payload: p } = payload;

          this.actions.publish(`${data.namespace}${data.delimiter}${data.action}`, p);
        },
      );
    }
  }

  public createNamespace(namespace: string): Namespace {
    return {
      add: (item) => {
        const id = item.id ?? uuidv4();

        this.add({
          ...item,
          id: `${namespace}.${id}`,
          namespace,
        });

        return id;
      },
      remove: (id) => {
        this.remove(`${namespace}.${id}`);
      },
      actions: {
        on: (action, cb) => {
          return this.actions.subscribe(`${namespace}${ACTION_DELIMITER.user}${action}`, cb);
        },
        dispatch: (data, payload) => {
          this.dispatchAction({ ...data, namespace }, payload);
        },
      },
      onClose: (cb) => {
        return this.actions.subscribe(`${namespace}${ACTION_DELIMITER.system}close`, cb);
      },
    };
  }

  public dispatchAction<T>(data: DispatchData, payload?: DispatchPayload<T>): void {
    const { namespace, delimiter = ACTION_DELIMITER.user, action } = data;
    this.actions.publish(`${namespace}${delimiter}${action}`, payload);

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
    this.notifications.add(item);

    if (item.shared && this.bus) {
      this.bus.send({
        channel: 'notification-center',
        topic: 'add',
        payload: {
          notification: item,
        },
      });
    }
  }

  public remove(id: string): void {
    const item = this.notifications.notifications.find((i) => i.id === id);
    this.notifications.remove(id);

    if (item?.shared && this.bus) {
      this.bus.send({
        channel: 'notification-center',
        topic: 'remove',
        payload: {
          id,
        },
      });
    }
  }
}
