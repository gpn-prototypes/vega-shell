# MessageBus

Обмен сообщениями между модулями в рамках браузерной сессии (вкладки, iframe)

## API

### Типы

[`QueuePattern`](#qp)

| property        | type   | description                                                                                              |
| --------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| [channel](#qpc) | string | Канал сообщений. Используется для группировки сообщений по контексту. Например: `auth`, `project` и т.д. |
| [topic](#qpt)   | string | Заголовок сообщения. Используется для более точного обозначения смысла сообщения.                        |

`Message<T = any>`

| property         | type    | description                                                             |
| ---------------- | ------- | ----------------------------------------------------------------------- |
| channel          | string  | [QueuePattern.channel](#qpc)                                            |
| topic            | string  | [QueuePattern.topic](#qpt)                                              |
| payload          | `T`     | Содержимое сообщения                                                    |
| params.self      | boolean | Сообщение было отправлено из того же MessageBus, в котором оно получено |
| params.broadcast | boolean | Сообщение было отправлено из другой вкладки                             |
| params.from.bid  | UUID    | id экземпляра MessageBus                                                |
| params.from.sid  | UUID    | id экземпляра MessageBusSession                                         |

### `send<T>(message: MessageInput<T>): void`

Отправка сообщения

#### Params

`message`

| param     | type    | required | default   |
| --------- | ------- | -------- | --------- |
| channel   | string  | true     | -         |
| topic     | string  | true     | -         |
| payload   | `T`     | false    | undefined |
| self      | boolean | false    | true      |
| broadcast | boolean | false    | false     |

### `subscribe<T>(pattern: QueuePattern, callback: (message: Message<T>>) => void): Unsubscribe`

Подписка на сообщения по заданному шаблону

### `peek<T>(pattern: QueuePattern): Message<T> | void`

Вывод последнего сообщения, полученного по заданному шаблону

### `log<T>(pattern: QueuePattern): Message<T>[] | void`

Вывод списка из последних 10 сообщений

## Примеры

### Отправка сообщения внутри одной вкладки

```ts
// tab 1
const messageBus = new MessageBus();

messageBus.subscribe({ channel: 'test', topic: 'self' }, () => {
  console.log('message received');
});

messageBus.send({ channel: 'test', topic: 'self', self: true, broadcast: false });

// tab 2
const messageBus = new MessageBus();

messageBus.subscribe({ channel: 'test', topic: 'self' }, () => {
  console.log('message received');
});

/**
 * tab 1
 * console.log: message received
 */
```

### Отправка сообщения во все экземпляры во всех вкладках

```ts
// tab 1
const messageBus = new MessageBus();

const pattern = ;

messageBus.subscribe({ channel: 'test', topic: 'share' }, () => {
  console.log('message received');
});


// tab 2
const messageBus = new MessageBus();

messageBus.subscribe({ channel: 'test', topic: 'share' }, () => {
  console.log('message received');
});

// отправляем сообщение из второй вкладки
messageBus.send({ channel: 'test', topic: 'share', self: true, broadcast: true });

/**
 * tab 2
 * console.log:  message received
 *
 * tab 1
 * console.log:  message received
 */
```

### Отправка сообщения только в экземпляры в других вкладках

```ts
// tab 1
const messageBus = new MessageBus();

messageBus.subscribe({ channel: 'test', topic: 'share' }, () => {
  console.log('message received');
});

// tab 2
const messageBus = new MessageBus();

messageBus.subscribe({ channel: 'test', topic: 'share' }, () => {
  console.log('message received');
});

// отправляем сообщение из второй вкладки
messageBus.send({ ...pattern, self: false, broadcast: true });

/**
 * tab 1
 * console.log:  message received
 */
```

### Отправка сообщения во экземпляры во всех вкладках, кроме собственного

```ts
// tab 1
const messageBus = new MessageBus();

messageBus.subscribe({ channel: 'test', topic: 'share' }, () => {
  console.log('message received');
});

// tab 2
const messageBusOne = new MessageBus();
const messageBusTwo = new MessageBus();

const pattern = { channel: 'test', topic: 'share' };

messageBusOne.subscribe(pattern, () => {
  console.log('message received in messageBusOne');
});

messageBusTwo.subscribe(pattern, () => {
  console.log('message received in messageBusTwo');
});

messageBusTwo.send({ ...pattern, self: false, broadcast: true });

/**
 * tab 1
 * console.log:  message received
 *
 * tab 2
 * console.log:  message received in messageBusOne
 */
```

### Использование с `React`

```ts
React.useEffect(() => {
  // subscribe возвращает функцию отписки
  return messageBus.subscribe({ channel: 'foo', topic: 'bar' }, ({ payload }) => {
    setState(payload);
  });
});
```
