import { NotificationCenter } from './notificationCenter';

describe('NotificationCenter', () => {
  describe('createInterface', () => {
    describe('добавление нотификаций', () => {
      let notificationCetner: NotificationCenter;

      beforeEach(() => {
        notificationCetner = new NotificationCenter({});
      });

      it('добавляет нотификации без id', () => {
        const notifications = notificationCetner.createNamespace('testing');

        notifications.add({ body: 'testing' });

        expect(notificationCetner.notifications.notifications.length).toEqual(1);
        expect(notificationCetner.notifications.notifications[0]).toHaveProperty('id');
      });

      it('возвращается созданный id', () => {
        const namespace = 'testing';
        const notifications = notificationCetner.createNamespace(namespace);

        const id = notifications.add({ body: 'testing' });

        expect(notificationCetner.notifications.notifications.length).toEqual(1);
        expect(notificationCetner.notifications.notifications[0].id).toEqual(`${namespace}.${id}`);
      });

      it('в id нотификации присутствует namespace', () => {
        const notifications = notificationCetner.createNamespace('testing');

        notifications.add({ body: 'testing' });

        expect(notificationCetner.notifications.notifications.length).toEqual(1);
        expect(notificationCetner.notifications.notifications[0].id).toContain('testing');
      });
    });
    describe('actions', () => {
      let notificationCetner: NotificationCenter;

      beforeEach(() => {
        notificationCetner = new NotificationCenter({});
      });

      it('работает подписка на action', () => {
        const notifications = notificationCetner.createNamespace('testing');
        const payload = { color: 'blue' };
        const cb = jest.fn();

        notifications.actions.on('testing', cb);

        notifications.add({
          body: 'Тестируем',
          actions: [{ title: 'Проверка', action: 'testing', payload }],
        });

        notifications.actions.dispatch({ action: 'testing', shared: false }, payload);

        expect(cb).toBeCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(payload);
      });
    });
  });
});
