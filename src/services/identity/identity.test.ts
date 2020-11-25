import fetchMock from 'fetch-mock';

import { Identity, IdentityConfigType } from './identity';

beforeEach(() => {
  fetchMock.reset();
});

describe('Identity', () => {
  test.skip('происходит авторизация', async () => {
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

    const CONFIG: IdentityConfigType = {
      apiUrl: AUTH_URL,
    };

    const identity = new Identity(CONFIG);
    await identity.auth(AUTH_REQUEST);
    expect(identity.getToken()).toEqual(TOKEN.token);
  });

  test.skip('возвращается токен', async () => {
    const AUTH_URL = 'http://localhost/auth';
    const TOKEN = { token: 'token' };

    fetchMock.mock(AUTH_URL, {
      status: 200,
      body: TOKEN,
    });

    const CONFIG: IdentityConfigType = {
      apiUrl: AUTH_URL,
      accessToken: 'token2',
    };

    const identity = new Identity(CONFIG);
    expect(identity.getToken()).toEqual(CONFIG.accessToken);
  });

  test.skip('токен удаляется', async () => {
    const AUTH_URL = 'http://localhost/auth';
    const TOKEN = { token: 'token' };

    fetchMock.mock(AUTH_URL, {
      status: 200,
      body: TOKEN,
    });

    const CONFIG: IdentityConfigType = {
      apiUrl: AUTH_URL,
      accessToken: 'token2',
    };

    const identity = new Identity(CONFIG);
    expect(identity.getToken()).toEqual(CONFIG.accessToken);
    identity.logout();
    expect(identity.getToken()).toEqual(null);
  });

  test.skip('токен обновляется', async () => {
    const AUTH_URL = 'http://localhost/auth';
    const TOKEN = { token: 'token' };

    fetchMock.mock(AUTH_URL, {
      status: 200,
      body: TOKEN,
    });

    const CONFIG: IdentityConfigType = {
      apiUrl: AUTH_URL,
      accessToken: 'token2',
    };

    const identity = new Identity(CONFIG);
    expect(identity.getToken()).toEqual(CONFIG.accessToken);
    // identity.updateToken('token3');
    expect(identity.getToken()).toEqual('token3');
  });

  test.todo('тесты на tokenHandlers.ts');
});
