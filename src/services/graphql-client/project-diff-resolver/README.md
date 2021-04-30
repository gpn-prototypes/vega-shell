# Решение конфликтов версий

Механизм обработки ошибок конфликта версий проекта.

- [Решение конфликтов версий](#решение-конфликтов-версий)
  - [Мотивация](#мотивация)
  - [Описание работы](#описание-работы)
    - [Подготовка мутации](#подготовка-мутации)
    - [Алгоритм](#алгоритм)
  - [Стратегии решения конфликтов](#стратегии-решения-конфликтов)
    - [replace](#replace)
    - [smart](#smart)
  - [Пример своего способа решения конфликтов](#пример-своего-способа-решения-конфликтов)
  - [Детальное решение конфликтов](#детальное-решение-конфликтов)
    - [Резолверы по матчерам](#резолверы-по-матчерам)
    - [Варианты решений](#варианты-решений)
      - [Рекурсивная стратегия](#рекурсивная-стратегия)
      - [Резолверы по типу поля](#резолверы-по-типу-поля)

## Мотивация

Любое изменение проекта автоматически поднимет его версию.
При многопользовательской работе над одним проектом возможны случаи,
когда локальные изменения базируются на неактуальной, с точки зрения сервера,
версии проекта. В таком случае, при попытке сохранить изменения,
сервер ответит с ошибкой о конфликте версий. В ошибке содержится актуальная версия проекта.
Для того чтобы сохранить изменения, на клиенте необходимо решить конфликты между локальной
и серверной версиями проекта. Поэтому на клиенте необходим системный механизм, который будет
обрабатывать такие ошибки и предоставлять разработчикам интерфейс
для указания инструкций по решению конфликта.

## Описание работы

При отправке мутации на сервер обвязка отслеживает результат выполнения.
Если в ответе есть ошибка конфликта версий, то она запускает механизм решения конфликта.

### Подготовка мутации

Разработчик при создании мутации в ее контексте должен указать:

- `typename` возможной ошибки
- как в случае ошибки получить актуальные значения вносимых изменений (т.е. отобразить проект от сервера в тот формат, в которым мы пытаемся отправить изменения)
- как в случае ошибки получить локальные изменений
- как из переменных мутации получить данные о проекте
- как внести изменения с решенным конфликтов в переменные мутации

### Алгоритм

1. Принимаем операции с `mutation` в запросе
1. Пытаемся отправить операцию
1. После ответа определяем, есть ли в ответе ошибка конфликта версий
1. Если есть ошибка, то запускаем процедуру решения конфликтов
   1. Проверям, что количество попыток не превышено. Если превышено, то завершаем процедуру с ошибкой
   1. С помощью инструкций, переданных в контексте, решаем конфликт
   1. Обновляем исходную операцию
   1. Возвращаемся к шагу 2

Есть возможность отправки нескольких мутаций сразу.
Тогда при решении конфликта из повторной операции будут удаляться успешные мутации.

## Стратегии решения конфликтов

В механизме реализованы две стратегии решения конфликтов: `replace` и `smart`

### replace

Стратегия простой замены.
Не важно где именно случился конфликт. Мы просто говорим, что наша версия правильная.

```ts
client.mutate({
  query: SomeMutation,
  variables: {
    someOtherVar: {},
    projectInput: { ... },
    version: 1,
  }
  context: {
    projectDiffResolving: {
      errorTypename: 'ProjectDiffError', // или ProjectInnerDiffError для проектного graphql
      maxAttempts: 10, // кол-во попыток. По умолчанию 20
      mergeStrategy: {
        default: 'replace',
      },
      projectAccessor: {
        // по умолчанию используется identity
        fromVariables: (variables) => ({
          version: variables.version,
          projectInput: variables.projectInput
        }),
        // по умолчанию используется shallow merge
        toVariables: (variables, patched) => ({ ...variables, ...patched }),
        fromDiffError: (data) => ({
          // при 'replace' локальную версию можно не указывать,
          // потому что она в этом случае не используется
          local: {},
          remote: {
            // достаточно указать только версию
            version: getVersionFromRemoteProject(data),
          },
        }),
      },
    },
  },
});
```

> функция `getVersionFromRemoveProject` указана для примера, ее реализация отличается
> в зависимости от схемы ответа

### smart

Стратегия автоматического решения конфликтов.
Основана на [jsondiffpatch](https://benjamine.github.io/jsondiffpatch/demo/index.html).

При конфликте версий вычисляет `diff` локальных изменений от исходной версии.
Затем применяет этот `diff` к полученной версии от сервера.

```ts
client.mutate({
  query: SomeMutation,
  context: {
    projectDiffResolving: {
      errorTypename: 'ProjectDiffError',
      maxAttempts: 20,
      mergeStrategy: {
        default: 'smart',
      },
      projectAccessor: {
        fromDiffError: (data /* ответ сервера на мутацию */) => ({
          local: {
            // отображение локальной неизмененной версии
            // в тип, используемый в переменных
          },
          remote: {
            // отображение актуальной версии от сервера
            // в тип, используемый в переменных

            // это поле обязательно
            version: getVersionFromRemoteProject(data),
          },
        }),
      },
    },
  },
});
```

## Пример своего способа решения конфликтов

Пока удобного интерфейса для решения конфликтов не реализовано,
но как временное решение можно сделать так

```ts
async function saveProject() {
  let patched = null;

  await client.mutate({
    query: SomeMutation,
    context: {
      projectDiffResolving: {
        mergeStrategy: {
          default: 'replace',
        },
        projectAccessor: {
          toVariables: (variables) => {
            return { ...variables, ...patched };
          },
          fromDiffError: (data) => {
            const local = localToVariables(getUnchangedLocal());
            const remote = remoteToVariables(data.remoteProject);

            patched = resolveConflicts(remote, local);

            return {
              local,
              remote,
            };
          },
        },
      },
    },
  });
}
```

## Детальное решение конфликтов

Для `mergeStrategy` была реализована версия с розолверами по матчерам

### Резолверы по матчерам

```ts
type Matcher<T = any> = (data: any) => T;
type Resolver<T = any> = (local: T, remote: T) => T;
type MatchedResolver = [Matcher | string, Resolver];

type MergeStrategy = {
  default: 'replace' | 'smart';
  resolvers: MatchedResolver[];
};

const mergeStrategy: MergeStrategy = {
  default: 'smart',
  resolvers: [
    // resolver для вложенного поля
    ['foo.bar.baz', (local, remote, diff) => local],
    // resolver для элементов массива
    ['some.nested.array[*]', (local, remote, diff) => local],
  ],
};
```

### Варианты решений

Рассматривались несколько вариантов реализации `mergeStrategy`

#### Рекурсивная стратегия

```ts
type FieldResovler<T = any> = (local: T, remote: T, diff) => T;

type MergeStrategy = {
  default: 'smart' | 'replace';
  fields: {
    [key: field]: FieldResolver | MergeStrategy;
  };
};

const mergeStrategy: MergeStrategy = {
  default: 'smart', // стратегия для всех полей, кроме указанных
  fields: {
    someField: (local, remote, diff) => {
      return someCondition(diff) ? local : remote;
    },
    someAnotherField: {
      default: 'smart',
      fields: {
        nestedField: (local, remote, diff) => remote,
      },
    },
  },
};
```

#### Резолверы по типу поля

```ts
/**
 * @param local - локальная версия данных
 * @param remote - версия данных от сервера
 * @param parent - родительский элемент, на основе которого можно определить значение данных
 * @param SKIP - токен, который можно вернуть, если нужно использовать стратегию по умолчанию. Это должен быть ссылочный тип, иначе невозможно будет отличить от данных для замены
 */

type Resolver<T = any> = (local: T, remote: T, parent, SKIP) => T | SKIP;

type ResolverType = 'array' | 'object' | 'primitive'; // primitive - это number, string, boolean, null

type ResolversMap = Record<ResolverType, Resolver>;

type MergeStrategy = {
  default: 'replace' | 'smart';
  resolvers: ResolverMap;
};

const mergeStrategy: MergeStrategy = {
  default: 'smart',
  resolvers: {
    array: (local, remote, parent) => local,
    primitive: (local, remote, parent, SKIP) => {
      return isSomeDomainObject(parent) ? local : SKIP;
    },
  },
};
```
