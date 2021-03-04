import React from 'react';
import fetchMock from 'fetch-mock';

import { mockValidToken } from '../../services/identity/tokenHandlers';
import { BeforeRenderFn, login, render, RenderResultShell, screen, waitFor } from '../../testing';

import { AUTH_SSO_ERROR_NOTIFICATION_KEY, AuthPage } from './AuthPage';

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
    test('авторизует пользователя', async () => {
      fetchMock.mock(`/auth/jwt/obtain`, {
        first_name: 'First',
        last_name: 'Last',
        jwt_for_access: mockValidToken(),
        jwt_for_refresh: mockValidToken(),
      });

      const { shell } = renderComponent();

      expect(shell.identity.isLoggedIn()).not.toBeTruthy();

      login();

      await waitFor(() => {
        expect(shell.identity.isLoggedIn()).toBeTruthy();
      });
    });
  });

  describe('SSO', () => {
    beforeEach(() => {
      localStorage.setItem('useUnstableAuthSSO', 'true');
      fetchMock.mock(`/auth/sso/login`, () => Promise.reject());
    });

    test('авторизует через SSO', async () => {
      fetchMock.restore();
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

    test('обрабатывает ошибку входа через SSO', async () => {
      const { shell } = renderComponent();

      await waitFor(() => {
        expect(shell.notifications.getAll()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: AUTH_SSO_ERROR_NOTIFICATION_KEY, view: 'alert' }),
          ]),
        );
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
          id: AUTH_SSO_ERROR_NOTIFICATION_KEY,
        });

        expect(shell.notifications.getAll()).toHaveLength(1);
      });

      await waitFor(() => {
        expect(result.shell.notifications.getAll()).toHaveLength(0);
      });
    });
  });
});
