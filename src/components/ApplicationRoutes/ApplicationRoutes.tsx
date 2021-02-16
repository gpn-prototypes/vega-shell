import React, { useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
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

  const location = useLocation();

  const [_, setIsLoggedIn] = useState(identity.isLoggedIn());

  const isLoggedIn = identity.isLoggedIn();

  useMount(() => {
    const authUnsub = bus.subscribe<{ loggedIn: boolean }>(
      { channel: 'auth', topic: 'login' },
      ({ payload: { loggedIn } }) => {
        console.log('here 2')
        setIsLoggedIn(loggedIn);
      },
    );

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

  console.log(_, isLoggedIn)

  const getLoginPath = (): string => {
    const basePath = AUTH_PATH;
    if (previousPathname === '/logout' || previousPathname === null) {
      return basePath;
    }
    return `${basePath}?redirectTo=${encodeURIComponent(previousPathname)}`;
  };

  console.log('render', isLoggedIn);

  const redirectToAuth =
    (!isLoggedIn && location.pathname !== AUTH_PATH) || location.pathname === '/logout';

  return (
    <>
      {serverError && <ErrorView {...serverError} />}
      {redirectToAuth && <Redirect to={getLoginPath()} />}
      <Switch>
        {isLoggedIn && <Redirect from="/" to="/projects" exact />}
        <Route exact path={AUTH_PATH}>
          {isLoggedIn && <Redirect to={getLoginRedirectPath()} />}
          <AuthPage />
        </Route>
        <Route exact path="/logout">
          <LogoutView />
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
    </>
  );
};
