/* eslint-disable @typescript-eslint/no-explicit-any */
import { Item } from '@consta/uikit/SnackBar';

type Topics = 'change';
type Callback = (payload: any) => void;

type Handlers = Map<Topics, Set<Callback>>;

interface Unsubscribe {
  (): void;
}

export class Notifications {
  private items: Item[];

  private handlers: Handlers;

  constructor() {
    this.items = [];
    this.handlers = new Map();
  }

  public getAll(): Item[] {
    return this.items;
  }

  private publish(topic: Topics, payload: any): void {
    if (!this.handlers.has(topic)) return;
    const handlers = this.handlers.get(topic);

    if (handlers) {
      handlers.forEach((cb) => cb(payload));
    }
  }

  public subscribe(topic: Topics, cb: Callback): Unsubscribe {
    const set = this.handlers.get(topic) ?? new Set();
    set.add(cb);

    this.handlers.set(topic, set);

    return (): void => {
      set.delete(cb);
    };
  }

  public add(item: Item): void {
    this.items = [...this.items, item];

    this.publish('change', { items: this.items });
  }

  public find(key: string | number): Item | undefined {
    return this.items.find((item) => item.key === key);
  }

  public remove(key: string | number): void {
    this.items = this.items.filter((item) => item.key !== key);

    this.publish('change', { items: this.items });
  }
}
