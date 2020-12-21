import { NotificationCenter } from './notificationCenter';

describe('NotificationCenter', () => {
  describe('createInterface', () => {
    describe('добавление нотификаций', () => {
      let notificationCetner: NotificationCenter;

      beforeEach(() => {
        notificationCetner = new NotificationCenter({});
      });

      it('добавляет нотификации без id', () => {
        const notifications = notificationCetner.createInterface('testing');

        notifications.add({ body: 'testing' });

        expect(notificationCetner.notifications.length).toEqual(1);
        expect(notificationCetner.notifications[0]).toHaveProperty('id');
      });

      it('в id нотификации присутствует namespace', () => {
        const notifications = notificationCetner.createInterface('testing');

        notifications.add({ body: 'testing' });

        expect(notificationCetner.notifications.length).toEqual(1);
        expect(notificationCetner.notifications[0].id).toContain('testing');
      });
    });
    describe('actions', () => {
      let notificationCetner: NotificationCenter;

      beforeEach(() => {
        notificationCetner = new NotificationCenter({});
      });

      it('работает подписка на action', () => {
        const notifications = notificationCetner.createInterface('testing');
        const cb = jest.fn();

        notifications.actions.on('testing', cb);

        notifications.add({
          body: 'Тестируем',
          actions: [{ title: 'Проверка', action: 'testing' }],
        });

        notifications.actions.dispatch({ action: 'testing', shared: false });

        expect(cb).toBeCalledTimes(1);
      });
    });
  });
});
