# Vega-shell

## Зависимости

- [Vega Frontend Configs](https://github.com/gpn-prototypes/frontend-configs)

## Браузеры

Две последние мажорные версии браузеров на Chromium (в т.ч. Chrome, Yandex, Edge).

## Начало работы

Для старта вам нужно установить пакеты с помощью `yarn`.

Для запуска в dev-режиме выполните команду `yarn start`.

Для сборки проекта в prod-режиме выполните `yarn build`.

По умолчанию флаг disableSSO проставлен false (нужно для прод режима). Для работы с авторизацией (login, logout) прописываем disableSSO true в localStorage браузера.

## Службы

- [Identity](src/services/identity/README.md)
- [Notifications](src/services/notifications/README.md)
- [MessageBus](src/services/message-bus/README.md)
- [CurrentProject](src/services/current-project/README.md)
- [GraphQLClient](src/services/graphql-client/README.md)

## Конкурентный доступ

- [Синхронизация версии проекта](src/services/graphql-client/project-version-syncer/README.md)
- [Решение конфликтов версий](src/services/graphql-client/project-diff-resolver/README.md)
