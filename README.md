# Vega-shell

## Зависимости

- [Vega Frontend Configs](https://github.com/gpn-prototypes/frontend-configs)

## Браузеры

Две последние мажорные версии браузеров на Chromium (в т.ч. Chrome, Yandex, Edge).

## Начало работы

Для старта вам нужно установить пакеты с помощью `yarn`.

Для запуска в dev-режиме выполните команду `yarn start`.

Для сборки проекта в prod-режиме выполните `yarn build`.

## Службы

- [Identity](src/services/identity/README.md)
- [MessageBus](src/services/message-bus/README.md)
- [CurrentProject](src/services/current-project/README.md)
- [GraphQLClient](src/services/graphql-client/README.md)

## Конкурентный доступ

- [Синхронизация версии проекта](src/services/graphql-client/project-version-syncer/README.md)
