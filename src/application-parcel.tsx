import React, { useState } from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { Root, useMount } from '@gpn-prototypes/vega-ui';
import { createBrowserHistory } from 'history';
import { mountRootParcel } from 'single-spa';
import Parcel from 'single-spa-react/lib/esm/parcel';

import { AUTH_PAGE, MAIN_PAGE } from './utils/constants';
import { ShellServerError } from './utils/graphql-client';
import { Identity } from './utils/identity';
import { AuthGuard, ErrorView, RootLoader } from './components';

import './App.css';

const history = createBrowserHistory();

export type ServerErrorListener = (error: ShellServerError) => void;

type Props = {
  addServerErrorListener: (callback: ServerErrorListener) => VoidFunction;
  graphqlClient: ApolloClient<NormalizedCacheObject>;
  identity: Identity;
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

export const ApplicationsParcel = (props: Props): React.ReactElement => {
  const { addServerErrorListener, ...rest } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ShellServerError | null>(null);

  const loadConfig = (url: string): (() => Promise<System.Module>) => async () => {
    setIsLoading(true);
    const config = await System.import(url);
    setIsLoading(false);
    return config;
  };

  const handleServerError = (serverError: ShellServerError): void => {
    setError(serverError);
  };

  useMount(() => {
    const unsub = addServerErrorListener(handleServerError);

    return unsub;
  });

  const handleServiceError = (): void => {
    setError({
      code: 500,
      message: 'service-error',
    });

    if (isLoading) {
      setIsLoading(false);
    }
  };

  const applicationProps = {
    ...rest,
    history,
    handleError: handleServiceError,
    mountParcel: mountRootParcel,
  };

  return (
    <Root defaultTheme="dark" className="AppParcel">
      {error && (
        <ErrorView code={error.code} message={error.message} userMessage={error.userMessage} />
      )}
      {isLoading && <RootLoader />}
      <Router history={history}>
        <AuthGuard isLoggedIn={props.identity.isLoggedIn()} onRouteChanged={() => setError(null)} />
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
