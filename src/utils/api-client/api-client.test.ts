import fetchMock from 'fetch-mock';

import { APIClient } from './api-client';

beforeEach(() => {
  fetchMock.reset();
});

describe('APIClient', () => {
  test.skip('возвращается token при auth', async () => {
    const AUTH_URL = 'http://localhost/auth';
    const TOKEN = { token: 'token' };
    const AUTH_REQUEST = {
      login: 'foo',
      password: 'bar',
    };

    fetchMock.mock(AUTH_URL, {
      status: 200,
      body: TOKEN,
    });

    const client = new APIClient(AUTH_URL);
    const token = await client.auth(AUTH_REQUEST);
    expect(token).toEqual(TOKEN);
  });

  test.skip('возвращается errors при неверных данных', async () => {
    const AUTH_URL = 'http://localhost/auth';
    const ERROR = { Error: { code: 'INVALID_JSON' } };
    const AUTH_REQUEST = {
      login: 'foo',
      password: 'bar',
    };

    fetchMock.mock(AUTH_URL, {
      status: 401,
      body: {
        Error: ERROR,
      },
    });

    const client = new APIClient(AUTH_URL);
    await expect(client.auth(AUTH_REQUEST)).rejects.toEqual(ERROR);
  });
});
