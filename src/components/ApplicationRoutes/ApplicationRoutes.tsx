import React, { useCallback, useReducer, useRef, useState } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Loader, useMount, useOnChange, usePreviousRef } from '@gpn-prototypes/vega-ui';

import { useShell } from '../../app';
import { ServerError } from '../../services/graphql-client';
import { Application } from '../Application';
import { AUTH_ERROR_KEY } from '../AuthForm';
import { AuthPage } from '../AuthPage';
import { ErrorView } from '../Error';
import { Header } from '../Header';

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

export const AUTH_ERROR_MESSAGE =
  'Что-то пошло не так. Для повторного входа в\u00A0систему введите свои e-mail и\u00A0пароль';

const useForceUpdate = () => {
  const [, forceUpdate] = useReducer((s) => s + 1, 0);
  return forceUpdate;
};

const LogoutView = (): React.ReactElement | null => {
  const { identity } = useShell();

  useMount(() => {
    if (identity.isLoggedIn()) {
      identity.logout();
    }
  });

  return <Loader />;
};

export const ApplicationRoutes = (): React.ReactElement => {
  const shell = useShell();
  const { serverError, setServerError } = shell;
  const { bus, identity, notifications, graphqlClient } = shell;

  const lastAuthorizedRoute = useRef<string | null>(null);

  const location = useLocation();

  const forceUpdate = useForceUpdate();

  const isLoggedIn = identity.isLoggedIn();

  const lastAuthMessage = useRef(bus.peek({ channel: 'auth', topic: 'login' }));

  useMount(() => {
    const authUnsub = bus.subscribe<{ loggedIn: boolean }>(
      { channel: 'auth', topic: 'login' },
      () => {
        forceUpdate();
      },
    );

    const lastAuthMessageInMount = bus.peek({ channel: 'auth', topic: 'login' });

    if (lastAuthMessage.current !== lastAuthMessageInMount) {
      forceUpdate();
    }

    const errorUnsub = bus.subscribe<ServerError>(
      { channel: 'error', topic: 'server-error' },
      ({ payload }) => {
        if ([404, 500].includes(payload.code)) {
          setServerError(payload);
        }

        // istanbul ignore else
        if (payload.code === 401) {
          identity.logout({ destroyTokens: false });
          notifications.add({
            key: AUTH_ERROR_KEY,
            status: 'alert',
            message: AUTH_ERROR_MESSAGE,
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
      // istanbul ignore else
      if (serverError !== null) {
        setServerError(null);
      }
    }
  });

  const getLoginRedirectPath = (): string => {
    const query = new URLSearchParams(location.search);
    return query.get('redirectTo') ?? '/projects';
  };

  const getLoginPath = (): string => {
    const basePath = AUTH_PATH;
    const redirectPath = lastAuthorizedRoute.current ?? previousPathname;

    if (previousPathname === AUTH_PATH || previousPathname === null || redirectPath === '/logout') {
      return basePath;
    }

    const path = `${basePath}?redirectTo=${encodeURIComponent(
      lastAuthorizedRoute.current ?? previousPathname,
    )}`;

    lastAuthorizedRoute.current = null;

    return path;
  };

  if (!isLoggedIn && location.pathname !== AUTH_PATH) {
    return <Redirect to={getLoginPath()} />;
  }

  if (serverError !== null) {
    return <ErrorView {...serverError} />;
  }

  if (previousPathname !== '/logout' && !previousPathname?.includes('/login')) {
    lastAuthorizedRoute.current = previousPathname;
  }

  return (
    <Switch>
      {isLoggedIn && <Redirect exact from="/" to="/projects" />}
      <Route path={AUTH_PATH}>
        {isLoggedIn && <Redirect to={getLoginRedirectPath()} />}
        <AuthPage />
      </Route>
      <Route path="/logout">
        <LogoutView />;
      </Route>
      <Route path="/projects">
        <ApolloProvider client={graphqlClient}>
          <Header />
        </ApolloProvider>
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
  );
};
