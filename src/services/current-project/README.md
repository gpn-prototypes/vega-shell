# CurrentProject

Сервис для работы с текущим проектом

## API

`enum Code`

| code       | description                                  |
| ---------- | -------------------------------------------- |
| Idle       | Начальное состояние. Проект не выбран        |
| InProgress | Попытка выбора проекта через `checkout(vid)` |
| Done       | Проект успешно установлен                    |
| NotFound   | Проект не найден                             |
| Error      | Неизвестная ошибка при выборе проекта        |

### `status(): CheckoutStatus`

Возвращает текущий статус переключения проекта

| code       | values             |
| ---------- | ------------------ |
| Idle       | `-`                |
| InProgress | `vid: string`      |
| NotFound   | `vid: string`      |
| Error      | `vid: string`      |
| Done       | `project: Project` |

```ts
const status = currentProject.status();

if (status.code === currentProject.codes.Idle) {
  // ...
}
```

### `checkout(vid: string): Promise<CheckoutStatus>`

Установка текущего проекта.

> Используется только в обвязке при переходе в проект

### `get(): Project | null`

Получение текущего проекта

> Для приложений, которые работают только с проектом, всегда возвращается `Project`. Обвязка делает `checkout(vid)` до того, как отрисует приложение.

Любое изменение статуса регистрируется в [MessageBus](../message-bus/README.md)
по шаблону `{ channel: 'project', topic: 'status' }`
