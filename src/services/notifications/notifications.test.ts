import { MessageBus } from '../message-bus';

import { Notifications } from './notifications';

describe('Notifications', () => {
  describe('обычные нотификации', () => {
    let notifications: Notifications;
    let bus: MessageBus;

    beforeEach(() => {
      bus = new MessageBus();
      notifications = new Notifications({ messageBus: bus });
    });

    describe('добавление нотификаций', () => {
      it('добавляет нотификацию без id', () => {
        const item = { body: 'test' };
        notifications.add(item);

        expect(notifications.getAll().length).toBe(1);
      });

      it('возвращает созданный id нотификации', () => {
        const item = { body: 'test' };
        const id = notifications.add(item);

        expect(notifications.getAll()[0].id).toEqual(id);
      });

      it('добавляет нотификацию с id', () => {
        const item = { id: 'test-id', body: 'test' };
        notifications.add(item);

        expect(notifications.getAll().length).toBe(1);
        expect(notifications.getAll()[0].id).toEqual(item.id);
      });
    });

    it('удаляет нотификацию', () => {
      let items;
      const item = { id: 'test-key', body: 'test' };

      notifications.add(item);

      items = notifications.getAll();

      expect(items.length).toBe(1);

      notifications.remove(item.id);

      items = notifications.getAll();

      expect(items.length).toBe(0);
    });

    it('ищет нотификацию', () => {
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

    describe('подписки', () => {
      describe('change', () => {
        it('слушает подписку на изменение нотификаций', () => {
          const func = jest.fn();

          const unsubscribe = notifications.subscribe('change', func);

          notifications.add({ id: 'key-1', body: 'test' });
          notifications.add({ id: 'key-2', body: 'test' });
          notifications.remove('key-2');

          expect(func).toBeCalledTimes(3);

          unsubscribe();
        });

        it('отменяет подписку на изменение нотификаций', () => {
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
    });

    describe('actions', () => {
      it('слушает подписку на action', () => {
        const func = jest.fn();

        const payload = 'testing payload';
        const action = { title: 'Тестовая', action: 'testing', payload };

        const unsubscribe = notifications.on('testing', func);

        notifications.add({ body: 'test', actions: [action] });

        notifications.dispatch({ action: action.action, shared: false }, action.payload);

        expect(func).toBeCalled();
        expect(func).toBeCalledWith(payload);

        unsubscribe();
      });

      it('отменяет подписку на action', () => {
        const func = jest.fn();

        const payload = 'testing payload';
        const action = { title: 'Тестовая', action: 'testing', payload };

        const unsubscribe = notifications.on('testing', func);

        notifications.add({ body: 'test', actions: [action] });

        notifications.dispatch({ action: action.action, shared: false }, action.payload);
        notifications.dispatch({ action: action.action, shared: false }, action.payload);

        expect(func).toBeCalledTimes(2);

        unsubscribe();

        notifications.dispatch({ action: action.action, shared: false }, action.payload);
        notifications.dispatch({ action: action.action, shared: false }, action.payload);

        expect(func).toBeCalledTimes(2);
      });
    });
  });

  describe('shared нотификации', () => {
    let notifications: Notifications;
    let bus: MessageBus;

    beforeEach(() => {
      bus = new MessageBus();
      notifications = new Notifications({ messageBus: bus });
    });

    it('отправляет событие добавления в shared-worker', () => {
      const sendSpy = jest.spyOn(bus, 'send');

      notifications.add({ body: 'test', shared: true });

      expect(sendSpy).toBeCalledWith(expect.objectContaining({ broadcast: true }));
    });

    it('отправляет событие action в shared-worker', () => {
      const func = jest.spyOn(bus, 'send');

      const payload = 'testing payload';
      const action = { action: 'testing', payload };

      notifications.dispatch({ action: action.action, shared: true }, action.payload);

      expect(func).toBeCalledWith(expect.objectContaining({ broadcast: true }));
    });
  });
});
