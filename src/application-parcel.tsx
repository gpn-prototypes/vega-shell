import React, { useState } from 'react';
import { Redirect, Route, Router, Switch, useHistory, useLocation } from 'react-router-dom';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { Root, useOnChange, usePreviousRef } from '@gpn-prototypes/vega-ui';
import { createBrowserHistory } from 'history';
import { mountRootParcel } from 'single-spa';
import { Lifecycles } from 'single-spa-react';
import Parcel from 'single-spa-react/lib/esm/parcel';

import { Identity } from './utils/identity';
import { Error, ErrorView, RootLoader } from './components';
import { BrowserMessageBus } from './message-bus';

import './App.css';

const history = createBrowserHistory();

const MAIN_PAGE = '/projects';
const AUTH_PAGE = '/login';

type Props = {
  graphqlClient: ApolloClient<NormalizedCacheObject>;
  identity: Identity;
  bus: BrowserMessageBus;
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

export const AppGuard = (props: Omit<Props, 'graphqlClient'>): React.ReactElement | null => {
  const { identity, bus } = props;

  const location = useLocation();

  const isLoggedIn = identity.isLoggedIn();

  const isAuthPage = location.pathname.includes(AUTH_PAGE);

  useOnChange(location.pathname, () => {
    bus.send({ topic: 'server-error', channel: 'error', payload: null, self: true });
  });

  if ((isAuthPage || location.pathname === '/') && isLoggedIn) {
    return <Redirect to={MAIN_PAGE} />;
  }

  if (!isAuthPage && !isLoggedIn) {
    return <Redirect to={AUTH_PAGE} />;
  }

  return null;
};

export const ApplicationsParcel = (props: Props): React.ReactElement => {
  const [isLoading, setIsLoading] = useState(false);

  const loadConfig = (url: string): (() => Promise<System.Module>) => async () => {
    setIsLoading(true);
    const config = await System.import(url);
    setIsLoading(false);
    return config;
  };

  const handleError = (): void => {
    props.bus.send({
      channel: 'error',
      topic: 'server-error',
      payload: { code: 500, message: 'service-error' },
      self: true,
    });

    if (isLoading) {
      setIsLoading(false);
    }
  };

  const applicationProps = {
    ...props,
    history,
    handleError,
    mountParcel: mountRootParcel,
  };

  return (
    <Root defaultTheme="dark" className="AppParcel">
      <Error bus={props.bus} />
      {isLoading && <RootLoader />}
      <Router history={history}>
        <AppGuard identity={props.identity} bus={props.bus} />
        <Switch>
          <Route exact path={AUTH_PAGE}>
            <div>
              <Parcel config={loadConfig('@vega/auth')} {...applicationProps} />
            </div>
          </Route>
          <Route path={MAIN_PAGE}>
            <Parcel
              config={loadConfig('@vega/header')}
              wrapWith="header"
              wrapClassName="header"
              {...applicationProps}
            />
            <main className="main">
              <Switch>
                <Route exact path={['/projects/show/:projectId/rb']}>
                  <div className="RB-Wrapper">
                    <Parcel config={loadConfig('@vega/rb')} {...applicationProps} />
                  </div>
                </Route>
                <Route exact path={['/projects', '/projects/create', '/projects/show/:projectId']}>
                  <Parcel config={loadConfig('@vega/sp')} {...applicationProps} />
                </Route>
                <NotFoundView />
              </Switch>
            </main>
          </Route>
          <NotFoundView />
        </Switch>
      </Router>
    </Root>
  );
};
