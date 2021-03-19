# Уведомления

## Зависимости

- [SnackBar (Consta)](https://consta-uikit.vercel.app/?path=/docs/components-snackbar--playground)
- MessageBus (Vega-Shell)

## Принцип работы

Для всего проекта Vega создается единственный экземпляр `Notifications`. Треки получают этот экземпляр через `props`
из `shell-context` в компоненте `Application`. Как следствие, все нотификации всех треков попадают в одно общее хранилище.
В качестве UI компонента для отображения уведомлений используется `SnackBar` из `Consta`.

В проекте используется своя обёртка над `SnackBar` в `src/components/SnackBar`. В ней происходит трансформация
экземпляров `Notification` в `Item` из `SnackBar`. Если внезапно API `SnackBar` поменяется, то поменять придется только в этом месте.
Там же настраивается ограничение вывода уведомлений в проекте. Сейчас отображается по два уведомления, все остальные скрыты до тех пор,
пока не закроются предыдущие.

## API

Ниже представлен основной API для работы с уведомлениями.

### Добавление/Удаление/Поиск

```ts
/**
 * Виды уведомлений
 */

type View = 'normal' | 'system' | 'success' | 'warning' | 'alert';

/**
 * Экшен закрытия
 *
 * @property action - Название экшена.
 * @property payload - Полезная нагрузка, которая придёт в подписчик.
 */

type OnCloseAction = { action: string; payload: any };

/**
 * Экшен уведомления
 *
 * @property title - Текст в кнопке.
 * @property action - Название экшена.
 * @property shared - Нужно ли отправлять событие экшена в другие вкладки.
 * @property payload - Полезная нагрузка, которая придёт в подписчик.
 */

type Action = {
  title: string;
  action: string;
  shared?: boolean;
  payload?: any;
};

/**
 * Свойства уведомления
 *
 * @property id - Идентификатор уведомления. Если не передать, то присваивается уникальный.
 * @property body - Сообщение, которое увидит пользователь.
 * @property view - Вид нотификации.
 * @property closable - Может ли уведомление закрываться. По умолчанию true.
 * @property shared - Нужно ли отправлять уведомление в другие вкладки. По умолчанию false.
 * @property actions - Массив экшенов.
 * @property actions - Экшен закрытия.
 * @property icon - Название иконки из Consta.
 * @property withShowMore - Нужно ли отрезать длинный текст и показывать кнопку Свернуть/Показать. По умолчанию true.
 * @property truncatedLength - Максимальная длина текста, при которой показывается кнопка Свернуть/Показать. По умолчанию 81 символ.
 * @property autoClose - Время до автоматического закрытия уведомления. По умолчанию undefined.
 */

type NotificationProps = {
  id?: string;
  body: string;
  view?: View;
  closable?: boolean;
  shared?: boolean;
  actions?: Action[];
  onCloseAction?: OnCloseAction;
  icon?: string;
  withShowMore?: boolean;
  truncatedLength?: number;
  autoClose?: number;
};

const notification: NotificationProps = {
  body: 'Hello World!',
  status: 'warning',
};

/**
 * Метод добавления уведомления
 *
 * @param notification - Свойства, необходимые для создания экземпляра Notification
 * @returns id уведомления
 */

Notifications.add(notification);

/**
 * Метод удаления уведомления
 *
 * @param id - Id удаляемого уведомления
 */

Notifications.remove('my-id');

/**
 * Метод поиска уведомления
 *
 * @param id - Id уведомления
 * @returns найденное уведомление или undefined
 */

Notifications.find('my-id');
```

### Подписки на события

```ts
/**
 * Метод подписки на событие
 *
 * Виды событий:
 * - change. Срабатывает при добавлении/удалении нотификации
 *
 * @param topic - название события
 * @param callback
 *
 * @returns функцию отписки
 */

const usubChange = Notifications.subscribe('change', (payload) => {
  console.log(payload);
});

/**
 * Метод подписки на экшен
 *
 * Виды событий:
 * - change. Срабатывает при добавлении/удалении нотификации
 *
 * @param topic - название события
 * @param callback
 *
 * @returns функцию отписки
 */

const usubAction = Notifications.on('my-super-action', (payload) => {
  console.log(payload);
});
```

## Примеры использования

### Базовый

```js
export const MyComponent = () => {
  const { notifications } = useApp(); // Получаем Notifications из контекста приложения

  return (
    <button
      type="button"
      onClick={() => {
        notifications.add({ body: 'Мое первое уведомление', view: 'normal' });
      }}
    >
      Добавить уведомления
    </button>
  );
};
```

Замечание: чтобы отправить уведомления в другие вкладки браузера, необходимо передать `shared: true`.

### С пользовательским экшеном

```js
export const MyComponent = () => {
  const { notifications } = useApp();

  React.useEffect(() => {
    const unsub = notifications.on('my-super-action', (payload) => {
      console.log(`Привет! мой цвет ${payload}`); // Привет! мой цвет красный
    });

    return unsub; // Важно отписаться при анмаунте.
  }, [notifications]);

  return (
    <button
      type="button"
      onClick={() => {
        notifications.add({
          body: 'Изменим цвет',
          view: 'normal',
          actions: [{ title: 'Поменять цвет', action: 'my-super-action', payload: 'красный' }],
        });
      }}
    >
      Добавить уведомления
    </button>
  );
};
```

### С экшеном закрытия

```js
export const MyComponent = () => {
  const { notifications } = useApp();

  React.useEffect(() => {
    const unsub = notifications.on('close-my-notification', () => {
      // Что-то делаем. Может перезапрос какой отправим.
    });

    return unsub; // Важно отписаться при анмаунте.
  }, [notifications]);

  return (
    <button
      type="button"
      onClick={() => {
        notifications.add({
          body: 'Изменим цвет',
          view: 'normal',
          onCloseAction: { action: 'close-my-notification' },
        });
      }}
    >
      Добавить уведомления
    </button>
  );
};
```

Замечание: чтобы отправить экшен в другие вкладки браузера, необходимо передать в action `shared: true`.
