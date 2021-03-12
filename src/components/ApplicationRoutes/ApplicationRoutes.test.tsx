import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { v4 as uuid } from 'uuid';

import { mockValidToken } from '../../services/identity/tokenHandlers';
import { login, Options, render, RenderResultShell } from '../../testing';

import { ApplicationRoutes, AUTH_ERROR_MESSAGE } from './ApplicationRoutes';

jest.mock('../Application', () => ({
  Application: (props: { name: string }): React.ReactElement => {
    return <span>{props.name}</span>;
  },
}));

beforeEach(() => {
  fetchMock.reset();
  localStorage.clear();
});

function renderComponent(params?: Options): RenderResultShell {
  return render(<ApplicationRoutes />, params);
}

function createProjectRoute(vid: string): string {
  return `/projects/show/${vid}`;
}

describe('ApplicationRoutes', () => {
  test('рендерится без ошибок', () => {
    expect(renderComponent).not.toThrow();
  });

  describe('авторизация', () => {
    test('при авторизации по умолчанию происходит редирект на страницу проектов', async () => {
      fetchMock.mock(`/auth/jwt/obtain`, {
        first_name: 'First',
        last_name: 'Last',
        jwt_for_access: mockValidToken(),
        jwt_for_refresh: mockValidToken(),
      });

      const { shell } = renderComponent({ isAuth: false, route: '/login' });

      login();

      await waitFor(() => {
        expect(shell.history.location.pathname).toBe('/projects');
      });
    });

    test('корректно работает авторизация через SSO', async () => {
      localStorage.setItem('useUnstableAuthSSO', 'true');

      fetchMock.mock(`/auth/sso/login`, {
        first_name: 'First',
        last_name: 'Last',
        jwt_for_access: mockValidToken(),
        jwt_for_refresh: mockValidToken(),
      });

      const { shell } = renderComponent({ isAuth: false, route: '/login' });

      await waitFor(() => {
        expect(shell.history.location.pathname).toBe('/projects');
      });

      localStorage.clear();
    });

    test('при авторизации при наличии redirectTo происходит редирект на redirectTo', async () => {
      fetchMock.mock(`/auth/jwt/obtain`, {
        first_name: 'First',
        last_name: 'Last',
        jwt_for_access: mockValidToken(),
        jwt_for_refresh: mockValidToken(),
      });

      const { shell } = renderComponent({
        isAuth: false,
        route: `/login?redirectTo=${encodeURIComponent('/projects/show/projectId')}`,
      });

      login();

      await waitFor(() => {
        expect(shell.history.location.pathname).toBe('/projects/show/projectId');
      });
    });
    test('при очистке токенов и попытке перейти на другую страницу происходит переход на страницу авторизации', async () => {
      const { shell } = renderComponent({ isAuth: true, route: '/projects' });

      window.localStorage.clear();

      act(() => {
        shell.history.push(createProjectRoute(uuid()));
      });

      expect(screen.getByLabelText('Авторизация')).toBeInTheDocument();
    });

    test('при разавторизации происходит переход на страницу авторизации', () => {
      const { shell } = renderComponent({ isAuth: true, route: '/projects' });

      act(() => {
        shell.identity.logout({ destroyTokens: false });
      });

      expect(screen.getByLabelText('Авторизация')).toBeInTheDocument();
    });

    test('если пользователь авторизан, то происходит редирект на страницу проектов', () => {
      renderComponent({ isAuth: true, route: '/login' });

      expect(window.location.pathname).toBe('/projects');
      expect(screen.getByText('@vega/sp')).toBeInTheDocument();
    });
  });

  describe('состояние ошибки', () => {
    test('при ошибке от сервера с кодом 500 рендерит экран ошибки', async () => {
      fetchMock.mock('/graphql', { status: 500 });

      renderComponent({ route: createProjectRoute(uuid()), isAuth: true });

      await act(async () => {
        await fetchMock.flush();
      });

      expect(fetchMock.done('/graphql')).toBe(true);

      expect(await screen.findByText(/500/)).toBeInTheDocument();
    });

    test('при ошибке с кодом 401 создается уведомление', async () => {
      fetchMock.mock('/graphql', { status: 401 });

      const { shell } = renderComponent({ isAuth: true, route: createProjectRoute(uuid()) });

      await act(async () => {
        await fetchMock.flush();
      });

      expect(shell.notifications.getAll()).toEqual(
        expect.arrayContaining([expect.objectContaining({ body: AUTH_ERROR_MESSAGE })]),
      );
    });

    test('при ошибке с кодом 401 происходит разлогин пользователя', async () => {
      fetchMock.mock('/graphql', { status: 401 });

      renderComponent();

      await act(async () => {
        await fetchMock.flush();
      });

      expect(window.location.pathname).toBe('/login');
      expect(screen.getByLabelText('Авторизация')).toBeInTheDocument();
    });

    test('ошибка от сервера пропадает при смене роута', async () => {
      fetchMock.mock('/graphql', { status: 500 });

      const { shell } = renderComponent({ isAuth: true, route: createProjectRoute(uuid()) });

      await act(async () => {
        await fetchMock.flush();
      });

      expect(fetchMock.done('/graphql')).toBe(true);

      expect(document.body).toHaveTextContent(/500/);

      shell.history.push('/projects');

      await waitFor(() => expect(document.body).not.toHaveTextContent(/500/));
    });
  });

  test('показыает 404 страницу, если url не совпадает ни с одним из роутов', async () => {
    renderComponent({ isAuth: true, route: '/unknown-test-page' });
    expect(screen.getByText(/404/)).toBeInTheDocument();
  });

  describe('страницы проекта', () => {
    let vid: string;

    beforeEach(() => {
      vid = uuid();
    });

    const createSuccessMock = (id: string) => ({
      data: {
        project: {
          __typename: 'Project',
          vid: id,
        },
      },
    });

    const createNotFoundMock = () => ({
      data: {
        project: {
          __typename: 'Error',
          code: 'PROJECT_NOT_FOUND',
        },
      },
    });

    const createErrorMock = () => ({
      data: {
        project: {
          __typename: 'Error',
          code: 'TEST_ERROR_CODE',
        },
      },
    });

    test('показывает лоадер', async () => {
      fetchMock.mock('/graphql', createSuccessMock(vid));

      renderComponent({ isAuth: true, route: createProjectRoute(vid) });

      expect(screen.getByLabelText('Загрузка приложения')).toBeVisible();

      await act(async () => {
        await fetchMock.flush();
      });

      expect(screen.queryByLabelText('Загрузка приложения')).not.toBeInTheDocument();
    });

    test('показыает 404 страницу, если проект не найден', async () => {
      fetchMock.mock('/graphql', createNotFoundMock);

      renderComponent({ isAuth: true, route: createProjectRoute(vid) });

      await act(async () => {
        await fetchMock.flush();
      });

      expect(fetchMock.done('/graphql')).toBe(true);
      expect(screen.getByText(/404/)).toBeInTheDocument();
    });

    test('показыает 404 страницу, если url не совпадает ни с одним из приложений', async () => {
      fetchMock.mock('/graphql', createSuccessMock(vid));

      renderComponent({ isAuth: true, route: `${createProjectRoute(vid)}/unknown-test-page` });

      await act(async () => {
        await fetchMock.flush();
      });

      expect(screen.getByText(/404/)).toBeInTheDocument();
    });

    test('показыает 404 страницу при ошибке запроса проекта', async () => {
      fetchMock.mock('/graphql', createErrorMock);

      renderComponent({ isAuth: true, route: createProjectRoute(vid) });

      await act(async () => {
        await fetchMock.flush();
      });

      expect(screen.getByText(/404/)).toBeInTheDocument();
    });

    describe('роуты приложений', () => {
      test.each([
        ['@vega/sp', ''],
        ['@vega/rb', 'rb'],
        ['@vega/lc', 'lc'],
        ['@vega/fem', 'fem'],
      ])('отображается страница для модуля %p', async (name, path) => {
        fetchMock.mock('/graphql', createSuccessMock);

        renderComponent({
          isAuth: true,
          route: `${createProjectRoute(vid)}/${path}`,
        });

        await act(async () => {
          await fetchMock.flush();
        });

        expect(screen.getByText(name)).toBeInTheDocument();
      });
    });
  });
});
