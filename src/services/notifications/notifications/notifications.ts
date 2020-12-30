/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { Notification, NotificationProps } from '../notification/notification';
import { Callback, Topic, Unsubscribe } from '../types';

type Listeners = Map<Topic, Set<Callback>>;

export class PubSub {
  public listeners: Listeners;

  constructor() {
    this.listeners = new Map();
  }

  public publish(topic: Topic, payload: any): void {
    if (!this.listeners.has(topic)) return;
    const handlers = this.listeners.get(topic);

    if (handlers) {
      handlers.forEach((cb) => cb(payload));
    }
  }

  public subscribe(topic: Topic, cb: Callback): Unsubscribe {
    const set = this.listeners.get(topic) ?? new Set();
    set?.add(cb);

    this.listeners.set(topic, set);

    return (): void => {
      set.delete(cb);
    };
  }
}

export class Notifications {
  public notifications: Notification[];

  public listeners: PubSub;

  constructor() {
    this.notifications = [];
    this.listeners = new PubSub();
  }

  public add(item: NotificationProps): void {
    const notification = new Notification(item);

    this.notifications = [...this.notifications, notification];

    this.publish<{ notifications: Array<Notification> }>('change', {
      notifications: this.notifications,
    });
  }

  public remove(id: string): void {
    this.notifications = this.notifications.filter((i) => i.id !== id);

    this.publish<{ notifications: Array<Notification> }>('change', {
      notifications: this.notifications,
    });
  }

  public publish<T = any>(topic: string, payload: T): void {
    this.listeners.publish(`notifications:${topic}`, payload);
  }

  public subscribe(topic: Topic, cb: Callback): Unsubscribe {
    return this.listeners.subscribe(`notifications:${topic}`, cb);
  }
}
