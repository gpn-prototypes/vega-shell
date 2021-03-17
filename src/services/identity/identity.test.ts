import fetchMock from 'fetch-mock';

import { Identity, IDENTITY_LS_KEYS, IdentityConfigType } from './identity';

beforeEach(() => {
  fetchMock.reset();
  localStorage.clear();
});

const BASE_URL = 'http://test.path';

jest.mock('./tokenHandlers');

describe('Identity', () => {
  describe('auth', () => {
    const mockOptions = {
      url: `${BASE_URL}/auth/jwt/obtain`,
      method: 'POST',
    };
    const userData = {
      login: 'login',
      password: 'password',
    };

    test('обработка успешной авторизации', async () => {
      const responseBody = {
        first_name: 'firstName',
        last_name: 'lastName',
        jwt_for_access: 'accessToken',
        jwt_for_refresh: 'accessTokem',
      };

      fetchMock.mock(mockOptions, {
        status: 200,
        body: JSON.stringify(responseBody),
      });

      const onAuthCallback = jest.fn();

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        onAuth: onAuthCallback,
      };

      const identity = new Identity(config);
      const response = await identity.auth(userData);

      const accessToken = identity.getAccessToken();
      const refreshToken = identity.getRefreshToken();
      const userName = identity.getUserName();

      expect(response).toEqual(responseBody.jwt_for_access);
      expect(accessToken).toEqual(responseBody.jwt_for_access);
      expect(refreshToken).toEqual(responseBody.jwt_for_refresh);
      expect(userName?.firstName).toEqual(responseBody.first_name);
      expect(userName?.lastName).toEqual(responseBody.last_name);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.ACCESS_TOKEN)).toEqual(
        responseBody.jwt_for_access,
      );
      expect(localStorage.getItem(IDENTITY_LS_KEYS.REFRESH_TOKEN)).toEqual(
        responseBody.jwt_for_refresh,
      );
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_FIRST_NAME)).toEqual(
        responseBody.first_name,
      );
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_LAST_NAME)).toEqual(responseBody.last_name);
      expect(onAuthCallback).toBeCalledTimes(1);
    });

    test('обработка ошибки', async () => {
      const responseBody = {
        Error: {
          code: 'Код ошибки',
          message: 'Описание ошибки',
        },
      };

      fetchMock.mock(mockOptions, {
        status: 401,
        body: JSON.stringify(responseBody),
      });

      const onAuthCallback = jest.fn();

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        onAuth: onAuthCallback,
      };

      const identity = new Identity(config);
      await expect(identity.auth(userData)).rejects.toEqual(responseBody.Error);

      const accessToken = identity.getAccessToken();
      const refreshToken = identity.getRefreshToken();
      const userName = identity.getUserName();

      expect(accessToken).toEqual(null);
      expect(refreshToken).toEqual(null);
      expect(userName).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.ACCESS_TOKEN)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.REFRESH_TOKEN)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_FIRST_NAME)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_LAST_NAME)).toEqual(null);
      expect(onAuthCallback).toBeCalledTimes(0);
    });
  });

  describe('authSSO', () => {
    const mockOptions = {
      url: `${BASE_URL}/auth/sso/login`,
      method: 'GET',
    };

    test('обработка успешной авторизации', async () => {
      const responseBody = {
        first_name: 'firstName',
        last_name: 'lastName',
        jwt_for_access: 'accessToken',
        jwt_for_refresh: 'accessTokem',
      };

      fetchMock.mock(mockOptions, {
        status: 200,
        body: JSON.stringify(responseBody),
      });

      const onAuthCallback = jest.fn();

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        onAuth: onAuthCallback,
      };

      const identity = new Identity(config);
      const response = await identity.authSSO();

      const accessToken = identity.getAccessToken();
      const refreshToken = identity.getRefreshToken();
      const userName = identity.getUserName();

      expect(response).toEqual(responseBody.jwt_for_access);
      expect(accessToken).toEqual(responseBody.jwt_for_access);
      expect(refreshToken).toEqual(responseBody.jwt_for_refresh);
      expect(userName?.firstName).toEqual(responseBody.first_name);
      expect(userName?.lastName).toEqual(responseBody.last_name);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.ACCESS_TOKEN)).toEqual(
        responseBody.jwt_for_access,
      );
      expect(localStorage.getItem(IDENTITY_LS_KEYS.REFRESH_TOKEN)).toEqual(
        responseBody.jwt_for_refresh,
      );
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_FIRST_NAME)).toEqual(
        responseBody.first_name,
      );
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_LAST_NAME)).toEqual(responseBody.last_name);
      expect(onAuthCallback).toBeCalledTimes(1);
    });

    test('обработка ошибки', async () => {
      const responseBody = {
        Error: {
          code: 'Код ошибки',
          message: 'Описание ошибки',
        },
      };

      fetchMock.mock(mockOptions, {
        status: 401,
        body: JSON.stringify(responseBody),
      });

      const onAuthCallback = jest.fn();

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        onAuth: onAuthCallback,
      };

      const identity = new Identity(config);
      await expect(identity.authSSO()).rejects.toEqual(responseBody.Error);

      const accessToken = identity.getAccessToken();
      const refreshToken = identity.getRefreshToken();
      const userName = identity.getUserName();

      expect(accessToken).toEqual(null);
      expect(refreshToken).toEqual(null);
      expect(userName).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.ACCESS_TOKEN)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.REFRESH_TOKEN)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_FIRST_NAME)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_LAST_NAME)).toEqual(null);
      expect(onAuthCallback).toBeCalledTimes(0);
    });
  });

  describe('getToken', () => {
    const mockOptions = {
      url: `${BASE_URL}/auth/jwt/refresh`,
      method: 'POST',
    };
    const validAccessToken = 'validAccessToken';
    const validRefreshToken = 'validRefreshToken';
    const invalidAccessToken = 'invalidAccessToken';
    const invalidRefreshToken = 'invalidRefreshToken';

    test('получение токена при валидном accessToken', async () => {
      const responseBody = {
        jwt_for_access: 'accessToken',
        jwt_for_refresh: 'refreshToken',
      };

      fetchMock.mock(mockOptions, {
        status: 200,
        body: JSON.stringify(responseBody),
      });

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: validAccessToken,
        refreshToken: validAccessToken,
      };

      const identity = new Identity(config);
      const response = await identity.getToken();

      const accessToken = identity.getAccessToken();
      const refreshToken = identity.getRefreshToken();

      expect(response).toEqual(config.accessToken);
      expect(accessToken).toEqual(config.accessToken);
      expect(refreshToken).toEqual(config.refreshToken);
      expect(fetchMock.calls().length).toEqual(0);
    });

    test('обновление токенов при невалидном accessToken', async () => {
      const responseBody = {
        jwt_for_access: 'accessToken',
        jwt_for_refresh: 'refreshToken',
      };

      fetchMock.mock(mockOptions, {
        status: 200,
        body: JSON.stringify(responseBody),
      });

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: invalidAccessToken,
        refreshToken: validAccessToken,
      };

      const identity = new Identity(config);
      const response = await identity.getToken();

      const accessToken = identity.getAccessToken();
      const refreshToken = identity.getRefreshToken();

      expect(response).toEqual(responseBody.jwt_for_access);
      expect(accessToken).toEqual(responseBody.jwt_for_access);
      expect(refreshToken).toEqual(responseBody.jwt_for_refresh);
    });

    test('обработка невалидного refreshToken', async () => {
      const responseBody = {
        jwt_for_access: 'accessToken',
        jwt_for_refresh: 'refreshToken',
      };

      fetchMock.mock(mockOptions, {
        status: 200,
        body: JSON.stringify(responseBody),
      });

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: invalidAccessToken,
        refreshToken: invalidRefreshToken,
      };

      const identity = new Identity(config);
      const response = await identity.getToken();

      const accessToken = identity.getAccessToken();
      const refreshToken = identity.getRefreshToken();

      expect(response).toEqual(null);
      expect(accessToken).toEqual(config.accessToken);
      expect(refreshToken).toEqual(config.refreshToken);
      expect(fetchMock.calls().length).toEqual(0);
    });

    test('обработка очереди запросов', async () => {
      const responseBody = {
        jwt_for_access: 'accessToken',
        jwt_for_refresh: 'refreshToken',
      };

      fetchMock.mock(
        { ...mockOptions, delay: 10 },
        {
          status: 200,
          body: JSON.stringify(responseBody),
        },
      );

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: invalidAccessToken,
        refreshToken: validRefreshToken,
      };

      const identity = new Identity(config);
      const responses = await Promise.all([
        identity.getToken(),
        identity.getToken(),
        identity.getToken(),
      ]);

      responses.forEach((response) => {
        expect(response).toEqual(responseBody.jwt_for_access);
      });

      expect(fetchMock.calls().length).toEqual(1);
    });

    test('обработка ошибки', async () => {
      const responseBody = {
        Error: {
          code: 'Код ошибки',
          message: 'Описание ошибки',
        },
      };

      fetchMock.mock(mockOptions, {
        status: 401,
        body: JSON.stringify(responseBody),
      });

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: invalidAccessToken,
        refreshToken: validRefreshToken,
      };

      const identity = new Identity(config);
      const response = await identity.getToken();

      expect(response).toEqual(null);
    });
  });

  describe('logout', () => {
    const mockOptions = {
      url: `${BASE_URL}/auth/jwt/destroy`,
      method: 'POST',
    };
    const initialAccessToken = 'initialAccessToken';
    const initialRefreshToken = 'initialRefreshToken';

    test('c удалением токенов', async () => {
      const responseBody = {
        ok: 'ok',
      };

      fetchMock.mock(mockOptions, {
        status: 200,
        body: JSON.stringify(responseBody),
      });

      const onLogoutCallback = jest.fn();

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: initialAccessToken,
        refreshToken: initialRefreshToken,
        onLogout: onLogoutCallback,
      };

      const identity = new Identity(config);
      await identity.logout({ destroyTokens: true });

      const accessToken = identity.getAccessToken();
      const refreshToken = identity.getRefreshToken();
      const userName = identity.getUserName();

      expect(accessToken).toEqual(null);
      expect(refreshToken).toEqual(null);
      expect(userName).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.ACCESS_TOKEN)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.REFRESH_TOKEN)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_FIRST_NAME)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_LAST_NAME)).toEqual(null);
      expect(onLogoutCallback).toBeCalledTimes(1);
      expect(fetchMock.calls().length).toEqual(1);
    });

    test('без удаления токенов', async () => {
      const responseBody = {
        ok: 'ok',
      };

      fetchMock.mock(mockOptions, {
        status: 200,
        body: JSON.stringify(responseBody),
      });

      const onLogoutCallback = jest.fn();

      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: initialAccessToken,
        refreshToken: initialRefreshToken,
        onLogout: onLogoutCallback,
      };

      const identity = new Identity(config);
      await identity.logout({ destroyTokens: false });

      const accessToken = identity.getAccessToken();
      const refreshToken = identity.getRefreshToken();
      const userName = identity.getUserName();

      expect(accessToken).toEqual(null);
      expect(refreshToken).toEqual(null);
      expect(userName).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.ACCESS_TOKEN)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.REFRESH_TOKEN)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_FIRST_NAME)).toEqual(null);
      expect(localStorage.getItem(IDENTITY_LS_KEYS.USER_LAST_NAME)).toEqual(null);
      expect(onLogoutCallback).toBeCalledTimes(1);
      expect(fetchMock.calls().length).toEqual(0);
    });
  });

  describe('isLoggedIn', () => {
    const validToken = 'validToken';
    const invalidToken = 'invalidToken';

    test('оба токена валидны', () => {
      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: validToken,
        refreshToken: validToken,
      };

      const identity = new Identity(config);
      const result = identity.isLoggedIn();

      expect(result).toBeTruthy();
    });

    test('accessToken невалидный, refreshToken валидный', () => {
      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: invalidToken,
        refreshToken: validToken,
      };

      const identity = new Identity(config);
      const result = identity.isLoggedIn();

      expect(result).toBeTruthy();
    });

    test('accessToken валидный, refreshToken невалидный', () => {
      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: validToken,
        refreshToken: invalidToken,
      };

      const identity = new Identity(config);
      const result = identity.isLoggedIn();

      expect(result).toBeFalsy();
    });

    test('оба токена невалидны', () => {
      const config: IdentityConfigType = {
        apiUrl: BASE_URL,
        accessToken: invalidToken,
        refreshToken: invalidToken,
      };

      const identity = new Identity(config);
      const result = identity.isLoggedIn();

      expect(result).toBeFalsy();
    });
  });
});
