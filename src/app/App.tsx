import React from 'react';
import { Root } from '@gpn-prototypes/vega-ui';

import { ApplicationRoutes, Snackbar } from '../components';

import './App.css';

export const App = (): React.ReactElement => {
  return (
    <Root defaultTheme="dark" className="AppParcel">
      <ApplicationRoutes />
      <Snackbar />
    </Root>
  );
};
