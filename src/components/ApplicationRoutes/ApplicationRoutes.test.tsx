import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';

import { useShell } from '../../app';
import { getSystemJSMock, Options as RenderOptions, render, RenderResult } from '../../testing';
import { ErrorLabels } from '../Error';

import { ApplicationRoutes, AUTH_ERROR_MESSAGE } from './ApplicationRoutes';

type RenderParams = {
  pathname: string;
  beforeRender?: RenderOptions['beforeRender'];
  isAuth?: boolean;
};

beforeEach(() => {
  global.System = getSystemJSMock(() => <div>test</div>);
});

afterEach(() => {
  localStorage.clear();
  delete global.System;
});

function renderComponent(params: RenderParams = { pathname: '/', isAuth: true }): RenderResult {
  return render(<ApplicationRoutes />, {
    beforeRender: ({ shell }) => {
      shell.history.push(params.pathname);
      if (params.beforeRender !== undefined) {
        params.beforeRender({ shell });
      }
    },
    isAuth: params.isAuth,
  });
}

const sendAuthError = (shell: RenderResult['shell']): void => {
  act(() => {
    shell.messageBus.send({
      channel: 'error',
      topic: 'server-error',
      payload: { code: 401, message: 'server-error' },
    });
  });
};

describe('ApplicationRoutes', () => {
  test('рендерится без ошибок', () => {
    expect(renderComponent).not.toThrow();
  });

  describe('Авторизация', () => {
    test('при очистке токенов и попытке перейти на другую страницу происходит переход на страницу авторизации', () => {
      const { shell } = renderComponent();

      shell.identity.clear();

      shell.history.push('/project/projectId/show');

      expect(shell.history.location.pathname).toBe('/login');
    });

    test('при разавторизации происходит переход на страницу авторизации', () => {
      const { shell } = renderComponent();

      act(() => {
        shell.identity.logout({ destroyTokens: false });
      });

      expect(shell.history.location.pathname).toBe('/login');
    });

    test('если пользователь авторизан, то происходит редирект на страницу проектов', () => {
      const { shell } = renderComponent();

      expect(shell.history.location.pathname).toBe('/projects');
    });
  });

  describe('состояние ошибки', () => {
    test.each([404, 500])('при ошибке от сервера с кодом %s рендерит экран ошибки', (code) => {
      const { shell } = renderComponent();

      act(() => {
        shell.messageBus.send({
          channel: 'error',
          topic: 'server-error',
          payload: { code, message: 'server-error' },
        });
      });

      expect(screen.queryByLabelText(ErrorLabels.body)).toBeInTheDocument();
    });

    test('при ошибке с кодом 401 создается уведомление', () => {
      const { shell } = renderComponent();

      sendAuthError(shell);

      expect(shell.notifications.getAll()).toEqual(
        expect.arrayContaining([expect.objectContaining({ message: AUTH_ERROR_MESSAGE })]),
      );
    });

    test('при ошибке с кодом 401 происходит разлогин пользователя', () => {
      const { shell } = renderComponent();

      sendAuthError(shell);

      expect(shell.identity.isLoggedIn()).not.toBeTruthy();
    });

    test('ошибка от сервера пропадает при смене роута', async () => {
      // Сделал отдельную обертку, так как в useOnChange при пуше роутера код заходил раньше чем в обработку сообщение от messageBus
      const Component = () => {
        const componentShell = useShell();

        React.useEffect(() => {
          componentShell.setServerError({
            code: 500,
            message: 'error',
          });
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return <ApplicationRoutes />;
      };

      await act(async () => {
        render(<Component />, {
          beforeRender: ({ shell: testingShell }) => {
            testingShell.history.push('/projects');
          },
          isAuth: true,
        });
      });

      expect(screen.queryByLabelText(ErrorLabels.body)).toBeInTheDocument();

      await act(async () => {
        window.history.pushState({}, 'Project show page', '/projects/show/projectId');
      });

      await waitFor(() =>
        expect(screen.queryByLabelText(ErrorLabels.body)).not.toBeInTheDocument(),
      );
    });
  });
});
