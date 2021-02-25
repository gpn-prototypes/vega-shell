import { Notification } from './notification';

const body = 'Lorem ipsum dolor sit amet';

describe('Notification', () => {
  describe('переключение текста', () => {
    let notification: Notification;

    beforeEach(() => {
      notification = new Notification({
        id: 'text',
        body,
        withShowMore: true,
        truncatedLength: 5,
      });
    });

    it('текст обрезается', () => {
      expect(notification.body).toEqual('Lorem...');
    });

    it('переключение текста', () => {
      notification.toggleShowMore();
      expect(notification.body).toEqual('Lorem ipsum dolor sit amet');
      notification.toggleShowMore();
      expect(notification.body).toEqual('Lorem...');
    });
  });
  it('скрытие текста не происходит, если недостаточно символов', () => {
    const notification = new Notification({
      id: 'text',
      body,
      truncatedLength: 50,
    });
    expect(notification.body).toEqual('Lorem ipsum dolor sit amet');
  });
  it('отображается весь текст, если withShowMore=false', () => {
    const text = 'Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet';

    const notification = new Notification({
      id: 'text',
      body: text,
      withShowMore: false,
    });
    expect(notification.body).toEqual(text);
  });
});
