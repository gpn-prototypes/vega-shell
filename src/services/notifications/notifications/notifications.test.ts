import { NotificationProps } from '../notification/notification';

import { Notifications, PubSub } from './notifications';

describe('Notifications', () => {
  it('происходит добавление', () => {
    const notifications = new Notifications();

    const notification: NotificationProps = { id: 'blue', body: 'Random text', view: 'success' };

    notifications.add(notification);

    expect(notifications.notifications.length).toEqual(1);
  });

  it('происходит удаление', () => {
    const notifications = new Notifications();

    const notification: NotificationProps = { id: 'blue', body: 'Random text', view: 'success' };

    notifications.add(notification);

    expect(notifications.notifications.length).toEqual(1);

    notifications.remove(notification.id);

    expect(notifications.notifications.length).toEqual(0);
  });

  it('работает подписка/отписка на изменения', () => {
    const notifications = new Notifications();
    const items = [];

    const cb = jest.fn((payload) => {
      items.push(payload.notifications);
    });

    const unsub = notifications.subscribe('change', cb);

    const notification: NotificationProps = { id: 'blue', body: 'Random text', view: 'success' };

    notifications.add(notification);

    expect(cb).toBeCalledTimes(1);
    expect(items.length).toEqual(1);

    unsub();

    notifications.add({ ...notification, id: 'red' });
    notifications.remove('red');

    expect(items.length).toEqual(1);
    expect(cb).toBeCalledTimes(1);
  });
});

describe('PubSub', () => {
  it('работают события', () => {
    const listeners = new PubSub();
    let data;

    const cb = jest.fn((payload) => {
      data = payload;
    });

    const unsub1 = listeners.subscribe('testing', cb);

    listeners.publish('testing', { color: 'blue' });

    expect(cb).toBeCalledTimes(1);
    expect(data).toEqual({ color: 'blue' });

    unsub1();

    listeners.publish('testing', { color: 'red' });

    expect(cb).toBeCalledTimes(1);
    expect(data).toEqual({ color: 'blue' });
  });

  it('пустые сеты после отписки', () => {
    const listeners = new PubSub();

    const unsub1 = listeners.subscribe('testing', () => {});
    const unsub2 = listeners.subscribe('testing', () => {});
    const unsub3 = listeners.subscribe('testing-1', () => {});

    expect(listeners.listeners.get('testing')?.size).toEqual(2);
    expect(listeners.listeners.get('testing-1')?.size).toEqual(1);

    unsub1();
    unsub2();
    unsub3();

    expect(listeners.listeners.get('testing')?.size).toEqual(0);
    expect(listeners.listeners.get('testing-1')?.size).toEqual(0);
  });
});
