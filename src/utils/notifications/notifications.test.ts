import { Notifications } from './notifications';

describe('Notifications', () => {
  let notifications: Notifications;

  beforeEach(() => {
    notifications = new Notifications();
  });

  it('нотификация добавляется', () => {
    const item = { key: 'test-key', message: 'test' };
    notifications.add(item);

    expect(notifications.getAll().length).toBe(1);
  });

  it('нотификация удаляется', () => {
    let items;
    const item = { key: 'test-key', message: 'test' };

    notifications.add(item);

    items = notifications.getAll();

    expect(items.length).toBe(1);

    notifications.remove(item.key);

    items = notifications.getAll();

    expect(items.length).toBe(0);
  });

  it('поиск нотификации', () => {
    let finded;

    const items = [
      { key: 'test-1', message: 'test' },
      { key: 'test-2', message: 'test' },
    ];

    items.forEach((item) => notifications.add(item));

    finded = notifications.find('test-2');

    expect(finded).toEqual(items[1]);

    finded = notifications.find('never');

    expect(finded).toEqual(undefined);
  });

  it('подписка на изменения', () => {
    const func = jest.fn();

    notifications.subscribe('change', func);

    notifications.add({ key: 'key-1', message: 'test' });
    notifications.add({ key: 'key-2', message: 'test' });
    notifications.remove('key-2');

    expect(func).toBeCalledTimes(3);
  });

  it('отмена подписки на изменения', () => {
    const func = jest.fn();

    const unsubscribe = notifications.subscribe('change', func);

    notifications.add({ key: 'key-1', message: 'test' });
    notifications.add({ key: 'key-2', message: 'test' });
    notifications.remove('key-2');

    expect(func).toBeCalledTimes(3);

    unsubscribe();

    notifications.add({ key: 'key-1', message: 'test' });
    notifications.add({ key: 'key-2', message: 'test' });

    expect(func).toBeCalledTimes(3);
  });
});
