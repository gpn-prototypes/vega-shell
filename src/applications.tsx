import React, { useState } from 'react';
import { Redirect, Route, Router, Switch, useLocation } from 'react-router-dom';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { Root, useMount } from '@gpn-prototypes/vega-ui';
import { History } from 'history';
import qs from 'query-string';

import { Identity } from './utils/identity';
import { AppContext, useAppContext } from './app-context';
import { Application, ErrorView } from './components';
import { BrowserMessageBus } from './message-bus';

import './App.css';

type Props = {
  bus: BrowserMessageBus;
  graphqlClient: ApolloClient<NormalizedCacheObject>;
  identity: Identity;
  history: History;
};

const NotFoundView = () => (
  <Route>
    <ErrorView
      code={404}
      message="page-not-found"
      userMessage="Ошибка 404. Страница не найдена. Обратитесь в службу технической поддержки"
    />
  </Route>
);

const AUTH_PATH = '/login';

const ApplicationRoutes = (): React.ReactElement => {
  const context = useAppContext();
  const { bus, identity } = context;

  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(identity.isLoggedIn());

  useMount(() => {
    const unsub = bus.subscribe<{ loggedIn: boolean }>(
      { channel: 'auth', topic: 'login' },
      ({ payload: { loggedIn } }) => {
        setIsLoggedIn(loggedIn);
      },
    );

    return unsub;
  });

  const getLoginPath = (): string => {
    return `${AUTH_PATH}?redirectTo=${encodeURIComponent(location.pathname)}`;
  };

  const getLoginRedirectPath = (): string => {
    const query = qs.parse(location.search) as { redirectTo?: string };
    return query.redirectTo ?? '/projects';
  };

  return (
    <>
      {!isLoggedIn && location.pathname !== AUTH_PATH && <Redirect to={getLoginPath()} />}
      <Switch>
        {isLoggedIn && <Redirect from="/" to="/projects" exact />}
        <Route exact path={AUTH_PATH}>
          {isLoggedIn && <Redirect to={getLoginRedirectPath()} />}
          {/* TODO: https://jira.csssr.io/browse/VEGA-694 */}
          <div>
            <Application name="@vega/auth" />
          </div>
        </Route>
        <Route path="/projects">
          <Application name="@vega/header" wrapWith="header" wrapClassName="header" />
          <main className="main">
            <Switch>
              <Route exact path={['/projects/show/:projectId/rb']}>
                {/* TODO: https://jira.csssr.io/browse/VEGA-694 */}
                <div className="RB-Wrapper">
                  <Application name="@vega/rb" />
                </div>
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

export const Applications = (props: Props): React.ReactElement => {
  return (
    <AppContext.Provider value={props}>
      <Root defaultTheme="dark" className="AppParcel">
        <Router history={props.history}>
          <ApplicationRoutes />
        </Router>
      </Root>
    </AppContext.Provider>
  );
};
