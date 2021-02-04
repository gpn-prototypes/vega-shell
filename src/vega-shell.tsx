import React from 'react';
import ReactDOM from 'react-dom';
import { start } from 'single-spa';

import { getAppConfig } from '../app-config';

import { App } from './app/App';
import { Shell, ShellProvider } from './app';

const config = getAppConfig();
const shell = new Shell({ baseApiUrl: config.baseApiUrl });

ReactDOM.render(
  <ShellProvider shell={shell}>
    <App />
  </ShellProvider>,
  document.getElementById('root'),
);

start();
