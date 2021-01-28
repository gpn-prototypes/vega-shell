import { Notifier } from './notifier';

describe('Notifier', () => {
  let notifier: Notifier<string>;

  beforeEach(() => {
    notifier = new Notifier<string>();
  });

  test('вызываются слушатели', () => {
    const listener = jest.fn();
    notifier.addListener(listener);
    notifier.notify('test');
    expect(listener).toBeCalledWith('test');
  });

  test('слушатели не дублируются', () => {
    const listener = jest.fn();
    notifier.addListener(listener);
    notifier.addListener(listener);
    notifier.notify('test');
    expect(listener).toBeCalledTimes(1);
  });

  test('отрабатывается отписка', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const unsubscribe = notifier.addListener(listener1);
    notifier.addListener(listener2);

    unsubscribe();
    notifier.notify('test');

    expect(listener1).not.toBeCalled();
    expect(listener2).toBeCalled();
  });

  test('повторная отписка не имеет эффекта', () => {
    const listener = jest.fn();
    const unsubscribe = notifier.addListener(listener);

    expect(() => {
      unsubscribe();
      unsubscribe();
      notifier.notify('test');
    }).not.toThrow();

    expect(listener).not.toBeCalled();
  });

  test('очистка всех подписок', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    notifier.addListener(listener1);
    notifier.addListener(listener2);

    notifier.removeAllListeners();
    notifier.notify('test');

    expect(listener1).not.toBeCalled();
    expect(listener2).not.toBeCalled();
  });
});
