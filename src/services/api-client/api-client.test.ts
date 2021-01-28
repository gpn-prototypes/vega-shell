import fetchMock from 'fetch-mock';

import { APIClient, ERROR_MESSAGE_FUNCTIONS } from './api-client';

beforeEach(() => {
  fetchMock.reset();
});

const BASE_URL = 'http://test.path';

describe('APIClient', () => {
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

      const client = new APIClient(BASE_URL);
      const response = await client.auth(userData);

      expect(response).toEqual(responseBody);
    });

    test('обработка стандартной ошибки', async () => {
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

      const client = new APIClient(BASE_URL);
      await expect(client.auth(userData)).rejects.toEqual(responseBody.Error);
    });

    test('обработка не стандартной ошибки', async () => {
      const responseBody = '401: Unauthorized';
      const error = {
        code: 401,
        message: ERROR_MESSAGE_FUNCTIONS.AUTH('Unauthorized'),
      };

      fetchMock.mock(mockOptions, {
        status: 401,
        body: responseBody,
      });

      const client = new APIClient(BASE_URL);
      await expect(client.auth(userData)).rejects.toEqual(error);
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

      const client = new APIClient(BASE_URL);
      const response = await client.authSSO();

      expect(response).toEqual(responseBody);
    });

    test('обработка стандартной ошибки', async () => {
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

      const client = new APIClient(BASE_URL);
      await expect(client.authSSO()).rejects.toEqual(responseBody.Error);
    });

    test('обработка не стандартной ошибки', async () => {
      const responseBody = '401: Unauthorized';
      const error = {
        code: 401,
        message: ERROR_MESSAGE_FUNCTIONS.AUTH('Unauthorized'),
      };

      fetchMock.mock(mockOptions, {
        status: 401,
        body: responseBody,
      });

      const client = new APIClient(BASE_URL);
      await expect(client.authSSO()).rejects.toEqual(error);
    });
  });

  describe('refresh', () => {
    const mockOptions = {
      url: `${BASE_URL}/auth/jwt/refresh`,
      method: 'POST',
    };
    const refreshToken = 'refreshToken';

    test('обработка успешного обновления токена', async () => {
      const responseBody = {
        jwt_for_access: 'accessToken',
        jwt_for_refresh: 'refreshToken',
      };

      fetchMock.mock(mockOptions, {
        status: 200,
        body: JSON.stringify(responseBody),
      });

      const client = new APIClient(BASE_URL);
      const response = await client.refresh(refreshToken);

      expect(response).toEqual(responseBody);
    });

    test('обработка стандартной ошибки', async () => {
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

      const client = new APIClient(BASE_URL);
      await expect(client.refresh(refreshToken)).rejects.toEqual(responseBody.Error);
    });

    test('обработка не стандартной ошибки', async () => {
      const responseBody = '401: Unauthorized';
      const error = {
        code: 401,
        message: ERROR_MESSAGE_FUNCTIONS.DEFAULT('Unauthorized'),
      };

      fetchMock.mock(mockOptions, {
        status: 401,
        body: responseBody,
      });

      const client = new APIClient(BASE_URL);
      await expect(client.refresh(refreshToken)).rejects.toEqual(error);
    });
  });

  describe('destroy', () => {
    const mockOptions = {
      url: `${BASE_URL}/auth/jwt/destroy`,
      method: 'POST',
    };
    const accessToken = 'accessToken';

    test('обработка успешного удаления токена', async () => {
      const responseBody = {
        ok: 'ok',
      };

      fetchMock.mock(mockOptions, {
        status: 200,
        body: JSON.stringify(responseBody),
      });

      const client = new APIClient(BASE_URL);
      const response = await client.destroy(accessToken);

      expect(response).toEqual(responseBody);
    });

    test('обработка стандартной ошибки', async () => {
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

      const client = new APIClient(BASE_URL);
      await expect(client.destroy(accessToken)).rejects.toEqual(responseBody.Error);
    });

    test('обработка не стандартной ошибки', async () => {
      const responseBody = '401: Unauthorized';
      const error = {
        code: 401,
        message: ERROR_MESSAGE_FUNCTIONS.DEFAULT('Unauthorized'),
      };

      fetchMock.mock(mockOptions, {
        status: 401,
        body: responseBody,
      });

      const client = new APIClient(BASE_URL);
      await expect(client.destroy(accessToken)).rejects.toEqual(error);
    });
  });
});
