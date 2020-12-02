import React from 'react';
import { Router } from 'react-router-dom';
import { Root } from '@gpn-prototypes/vega-ui';

import { AppContext, AppContextProps } from './app-context';
import { ApplicationRoutes } from './components';

import './App.css';

type Props = AppContextProps;

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
