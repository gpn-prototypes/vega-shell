import React from 'react';
import ReactDOM from 'react-dom';
import * as singleSpa from 'single-spa';

import { getAppConfig } from '../app-config';

import { createGraphqlClient, ShellServerError } from './utils/graphql-client';
import { Identity } from './utils/identity';
import { ApplicationsParcel, ServerErrorListener } from './application-parcel';
import { BrowserMessageBus } from './message-bus';

const HOME_PAGE = '/projects';
const bus = BrowserMessageBus.create();

const sendMessageOnAuth = () => {
  bus.send({ channel: 'auth', topic: 'logged-in', self: true });
};

const sendMessageOnLogout = () => {
  bus.send({ channel: 'auth', topic: 'logged-out', self: true });
};

bus.subscribe({ channel: 'auth', topic: 'logged-in' }, () => {
  const url = new URL(window.location.href).searchParams.get('redirect-to') ?? HOME_PAGE;
  singleSpa.navigateToUrl(url.toString());
});

bus.subscribe({ channel: 'auth', topic: 'logged-out' }, () => {
  const url = new URL(window.location.href);
  url.searchParams.set('redirect-to', url.toString().replace(url.origin, ''));
  url.pathname = '/login';

  singleSpa.navigateToUrl(url.toString());
});

const handleGraphqlClientError = (err: ShellServerError): void => {
  bus.send({ channel: 'error', topic: 'server-error', payload: err, self: true });
};

const { baseApiUrl } = getAppConfig();
const identity = new Identity({
  apiUrl: `${baseApiUrl}/login`,
  cbOnAuth: sendMessageOnAuth,
  cbOnLogout: sendMessageOnLogout,
});
const graphqlClient = createGraphqlClient({
  uri: `${baseApiUrl}/graphql`,
  identity,
  onError: handleGraphqlClientError,
});

const addServerErrorListener = (callback: ServerErrorListener): VoidFunction => {
  return bus.subscribe<ShellServerError>(
    { channel: 'error', topic: 'server-error' },
    ({ payload: error }) => {
      callback(error);
    },
  );
};

ReactDOM.render(
  <ApplicationsParcel
    addServerErrorListener={addServerErrorListener}
    graphqlClient={graphqlClient}
    identity={identity}
  />,
  document.getElementById('root'),
);
