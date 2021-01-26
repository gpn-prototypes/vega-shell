import React from 'react';
import { Router } from 'react-router-dom';
import { Root } from '@gpn-prototypes/vega-ui';

import { ApplicationRoutes, Snackbar } from '../components';
import { ServerError } from '../services/graphql-client';

import { AppContext, AppContextProps } from './app-context';

import './App.css';

type Props = Omit<AppContextProps, 'serverError' | 'setServerError'>;

export const Applications = (props: Props): React.ReactElement => {
  const [serverError, setServerError] = React.useState<ServerError | null>(null);

  return (
    <AppContext.Provider value={{ ...props, serverError, setServerError }}>
      <Root defaultTheme="dark" className="AppParcel">
        <Router history={props.history}>
          <ApplicationRoutes />
        </Router>
        <Snackbar />
      </Root>
    </AppContext.Provider>
  );
};
