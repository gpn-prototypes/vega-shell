import React, { useState } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { useMount, useOnChange, usePreviousRef } from '@gpn-prototypes/vega-ui';

import { useAppContext } from '../../app-context';
import { ServerError } from '../../services/graphql-client';
import { Application } from '../Application';
import { ErrorView } from '../Error';

const AUTH_PATH = '/login';

const NotFoundView = () => (
  <Route>
    <ErrorView
      code={404}
      message="page-not-found"
      userMessage="Ошибка 404. Страница не найдена. Обратитесь в службу технической поддержки"
    />
  </Route>
);

export const ApplicationRoutes = (): React.ReactElement => {
  const context = useAppContext();
  const { serverError, setServerError } = context;
  const { bus, identity, notifications } = context;

  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(identity.isLoggedIn());

  useMount(() => {
    const authUnsub = bus.subscribe<{ loggedIn: boolean }>(
      { channel: 'auth', topic: 'login' },
      ({ payload: { loggedIn } }) => {
        setIsLoggedIn(loggedIn);
      },
    );

    const errorUnsub = bus.subscribe<ServerError>(
      { channel: 'error', topic: 'server-error' },
      ({ payload }) => {
        if ([404, 500].includes(payload.code)) {
          setServerError(payload);
        }

        if (payload.code === 401) {
          identity.logout({ destroyTokens: false });
          notifications.add({
            key: `auth-error`,
            status: 'alert',
            message:
              'Что-то пошло не так. Для повторного входа в\u00A0систему введите свои e-mail и\u00A0пароль',
            onClose(item) {
              notifications.remove(item.key);
            },
          });
        }
      },
    );

    return () => {
      authUnsub();
      errorUnsub();
    };
  });

  const previousPathname = usePreviousRef(location.pathname).current;

  useOnChange(location.pathname, () => {
    if (previousPathname !== null && previousPathname !== location.pathname) {
      if (serverError !== null) {
        setServerError(null);
      }
    }
    if (identity.isLoggedIn() !== isLoggedIn) {
      setIsLoggedIn(identity.isLoggedIn());
    }
  });

  const getLoginPath = (): string => {
    return `${AUTH_PATH}?redirectTo=${encodeURIComponent(location.pathname)}`;
  };

  const getLoginRedirectPath = (): string => {
    const query = new URLSearchParams(location.search);
    return query.get('redirectTo') ?? '/projects';
  };

  return (
    <>
      {serverError && <ErrorView {...serverError} />}
      {!isLoggedIn && location.pathname !== AUTH_PATH && <Redirect to={getLoginPath()} />}
      <Switch>
        {isLoggedIn && <Redirect from="/" to="/projects" exact />}
        <Route exact path={AUTH_PATH}>
          {isLoggedIn && <Redirect to={getLoginRedirectPath()} />}
          <Application name="@vega/auth" />
        </Route>
        <Route path="/projects">
          <Application name="@vega/header" wrapWith="header" wrapClassName="header" />
          <main className="main">
            <Switch>
              <Route exact path={['/projects/show/:projectId/rb']}>
                <Application name="@vega/rb" />
              </Route>
              <Route exact path={['/projects/show/:projectId/lc']}>
                <Application name="@vega/lc" />
              </Route>
              <Route
                exact
                path={[
                  '/projects/show/:projectId/fem',
                  '/projects/show/:projectId/fem/OPEX',
                  '/projects/show/:projectId/fem/CAPEX',
                ]}
              >
                <Application name="@vega/fem" />
              </Route>
              <Route exact path={['/projects', '/projects/create', '/projects/show/:projectId']}>
                <Application name="@vega/sp" />
              </Route>
              <NotFoundView />
            </Switch>
          </main>
        </Route>
        <NotFoundView />
      </Switch>
    </>
  );
};
