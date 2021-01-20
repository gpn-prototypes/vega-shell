interface Unsubscribe {
  (): void;
}

interface Listener<Message> {
  (message: Message): void;
}

export class Notifier<Message> {
  listeners: Set<Listener<Message>> = new Set();

  notify(message: Message): void {
    this.listeners.forEach((listener) => {
      listener(message);
    });
  }

  addListener(listener: Listener<Message>): Unsubscribe {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}
