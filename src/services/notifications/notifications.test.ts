import { MessageBus } from '../message-bus';

import { Notifications } from './notifications';

describe('Notifications', () => {
  let notifications: Notifications;
  let bus: MessageBus;

  beforeEach(() => {
    bus = new MessageBus();
    notifications = new Notifications({ messageBus: bus });
  });

  it('нотификация добавляется', () => {
    const item = { id: 'test-key', body: 'test' };
    notifications.add(item);

    expect(notifications.getAll().length).toBe(1);
  });

  it('не добавляется нотификации с одинаковым id', () => {
    const item = { id: 'test-key', body: 'test' };
    notifications.add(item);
    notifications.add(item);

    expect(notifications.getAll().length).toBe(1);
  });

  it('нотификация удаляется', () => {
    let items;
    const item = { id: 'test-key', body: 'test' };

    notifications.add(item);

    items = notifications.getAll();

    expect(items.length).toBe(1);

    notifications.remove(item.id);

    items = notifications.getAll();

    expect(items.length).toBe(0);
  });

  it('поиск нотификации', () => {
    let finded;

    const items = [
      { id: 'test-1', body: 'test' },
      { id: 'test-2', body: 'test' },
    ];

    items.forEach((item) => notifications.add(item));

    finded = notifications.find('test-2');

    expect(finded).toMatchObject(items[1]);

    finded = notifications.find('never');

    expect(finded).toEqual(undefined);
  });

  it('подписка на изменения', () => {
    const func = jest.fn();

    notifications.subscribe('change', func);

    notifications.add({ id: 'key-1', body: 'test' });
    notifications.add({ id: 'key-2', body: 'test' });
    notifications.remove('key-2');

    expect(func).toBeCalledTimes(3);
  });

  it('отмена подписки на изменения', () => {
    const func = jest.fn();

    const unsubscribe = notifications.subscribe('change', func);

    notifications.add({ id: 'key-1', body: 'test' });
    notifications.add({ id: 'key-2', body: 'test' });
    notifications.remove('key-2');

    expect(func).toBeCalledTimes(3);

    unsubscribe();

    notifications.add({ id: 'key-1', body: 'test' });
    notifications.add({ id: 'key-2', body: 'test' });

    expect(func).toBeCalledTimes(3);
  });
});
