# Identity

Управление авторизацией

## Особенности работы

Токены (access token, refresh token) и имя пользователя (first name, last name) в процессе работы сохраняются в localStorage

| Значение      | Ключ            |
| ------------- | --------------- |
| access token  | access-token    |
| refresh token | refresh-token   |
| first name    | user-first-name |
| last name     | user-last-name  |

## Зависимости

isTokenValid - утилита определяет валидность токена
APIClient - сервис для управления запросами

## API

### Параметры конструктора

```ts
type IdentityConfigType = {
  apiUrl: string;
  accessToken?: string;
  refreshToken?: string;
  onAuth?: () => void;
  onLogout?: () => void;
};
```

- apiUrl - базовая часть URL адреса для отправлки запроса. Например, если полный адрес метода авторизации выглядит следующим образом `http://mk-csssr-vega-builder.code013.org/auth/jwt/obtain`, то в качестве значения apiUrl необходимо указать `http://mk-csssr-vega-builder.code013.org`
- accessToken, refreshToken - начальное значение токенов, используется для тестирования
- onAuth - функция вызовится при успешной авторизации через методы .auth или .authSSO
- onLogout - функция вызовится в методе .logout

### Методы

auth - выполняет авторизацию пользователя с помощью предоставленного логина и пароля. При успешной авторизации вызывает функцию onAuth переданную в конструктор и возвращет полученный access token

```ts
//
public auth = async (userData: UserDataType): Promise<string>
//

type UserDataType = {
  login: string;
  password: string;
};
```

authSSO - выполняет авторизацию через SSO. При успешной авторизации вызывает функцию onAuth переданную в конструктор и возвращет полученный access token

```ts
//
public authSSO = async (): Promise<string>
//
```

getToken - универсальный метод для получения access token. Логика работы отображена в следующей таблице

| Access token | Refresh token | Действие                                             |
| ------------ | ------------- | ---------------------------------------------------- |
| Валидный     | Не важно      | Возвращает access token                              |
| Не валидный  | Валидный      | Получает новую пару токенов, возвращает access token |
| Не валидный  | Не валидный   | Возвращает null                                      |

```ts
//
public getToken = async (): Promise<string | null>
//
```

logout - вызывает метод для уничтожения пары токенов на сервере (управляется параметром destroyTokens), удаляет записи о текенах и об имени текущего пользователя в localStorage, вызывает функцию onLogout переданную в конструктор

```ts
//
public logout = ({ destroyTokens } = { destroyTokens: true }): void
//
```

isLoggedIn - возвращает true, если пользователя можно считать залогиненым и false в обратом случае. Логика работы отображена в следующей таблице

| Access token | Refresh token | Результат |
| ------------ | ------------- | --------- |
| Не валидный  | Не валидный   | false     |
| Не валидный  | Валидный      | true      |
| Валидный     | Не валидный   | false     |
| Валидный     | Валидный      | true      |

```ts
//
public isLoggedIn(): boolean
//
```

getAccessToken - возвращает значение access token из localStorage

```ts
//
public getAccessToken = (): string | null
//
```

getRefreshToken - возвращает значение refresh token из localStorage

```ts
//
public getRefreshToken = (): string | null
//
```

getUserName - возвращает имя текущего пользователя из localStorage

```ts
//
public getUserName = (): { firstName: string; lastName: string } | null
//
```

clear - удаляет записи о текенах и об имени текущего пользователя в localStorage

```ts
//
public clear = (): void
//
```
