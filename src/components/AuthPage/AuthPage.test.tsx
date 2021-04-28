import React from 'react';
import fetchMock from 'fetch-mock';

import { mockValidToken } from '../../services/identity/tokenHandlers';
import { BeforeRenderFn, login, render, RenderResultShell, screen, waitFor } from '../../testing';

import { AuthPage, LOGIN_SSO_ERROR_NOTIFICATION_KEY } from './AuthPage';

function renderComponent(beforeRender?: BeforeRenderFn): RenderResultShell {
  return render(<AuthPage />, {
    beforeRender,
  });
}

afterEach(() => {
  localStorage.clear();
  fetchMock.restore();
});

describe('AuthPage', () => {
  test('рендерится без ошибок', () => {
    expect(renderComponent).not.toThrow();
  });

  describe('авторизация по логину и паролю', () => {
    test('успешная авторизация', async () => {
      fetchMock.mock(`/auth/jwt/obtain`, {
        first_name: 'First',
        last_name: 'Last',
        jwt_for_access: mockValidToken(),
        jwt_for_refresh: mockValidToken(),
      });

      const { shell } = renderComponent();

      expect(shell.identity.isLoggedIn()).toBeFalsy();

      login();

      await waitFor(() => {
        expect(shell.identity.isLoggedIn()).toBeTruthy();
      });
    });

    test('обработка ошибки', async () => {
      fetchMock.mock(
        { url: `/auth/jwt/obtain`, method: 'POST' },
        {
          status: 401,
          body: JSON.stringify({
            Error: {
              code: 'Ошибка',
              message: 'Описание ошибки',
            },
          }),
        },
      );

      const { shell } = renderComponent();

      expect(shell.identity.isLoggedIn()).toBeFalsy();

      login();

      await waitFor(() => {
        expect(shell.identity.isLoggedIn()).toBeFalsy();
      });
    });

    test('обработка ошибки PERMISSION_DENIED', async () => {
      fetchMock.mock(
        { url: `/auth/jwt/obtain`, method: 'POST' },
        {
          status: 403,
          body: JSON.stringify({
            Error: {
              code: 'PERMISSION_DENIED',
              message: 'permission_denied',
            },
          }),
        },
      );

      const { shell } = renderComponent();

      expect(shell.identity.isLoggedIn()).toBeFalsy();

      login();

      await waitFor(() => {
        expect(shell.history.location.pathname).toBe('/permission_denied');
      });
    });
  });

  describe('авторизация через SSO', () => {
    beforeEach(() => {
      localStorage.setItem('useUnstableAuthSSO', 'true');
    });

    test('успешная авторизация', async () => {
      fetchMock.mock(`/auth/sso/login`, {
        first_name: 'First',
        last_name: 'Last',
        jwt_for_access: mockValidToken(),
        jwt_for_refresh: mockValidToken(),
      });

      const { shell } = renderComponent();

      await waitFor(() => {
        expect(shell.identity.isLoggedIn()).toBeTruthy();
      });
    });

    test('обработка ошибки', async () => {
      fetchMock.mock(
        { url: `/auth/sso/login`, method: 'GET' },
        {
          status: 401,
          body: JSON.stringify({
            Error: {
              code: 'Ошибка',
              message: 'Описание ошибки',
            },
          }),
        },
      );

      const { shell } = renderComponent();

      await waitFor(() => {
        expect(shell.notifications.getAll()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: LOGIN_SSO_ERROR_NOTIFICATION_KEY, view: 'alert' }),
          ]),
        );
      });
    });

    test('обработка ошибки PERMISSION_DENIED', async () => {
      fetchMock.mock(
        { url: `/auth/sso/login`, method: 'GET' },
        {
          status: 403,
          body: JSON.stringify({
            Error: {
              code: 'PERMISSION_DENIED',
              message: 'permission_denied',
            },
          }),
        },
      );

      const { shell } = renderComponent();

      await waitFor(() => {
        expect(shell.history.location.pathname).toBe('/permission_denied');
      });
    });

    test('корректно рендерит лоадер', async () => {
      renderComponent();

      expect(screen.queryByLabelText('Загрузка')).toBeInTheDocument();
      expect(screen.queryByLabelText('Авторизация')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByLabelText('Загрузка')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Авторизация')).toBeInTheDocument();
      });
    });

    test('удаляет нотификацию об ошибке перед запросом', async () => {
      const result = renderComponent(({ shell }) => {
        shell.notifications.add({
          view: 'alert',
          body: 'testing',
          id: LOGIN_SSO_ERROR_NOTIFICATION_KEY,
        });

        expect(shell.notifications.getAll()).toHaveLength(1);
      });

      await waitFor(() => {
        expect(result.shell.notifications.getAll()).toHaveLength(0);
      });
    });
  });
});
