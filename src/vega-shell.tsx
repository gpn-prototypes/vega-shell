import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import * as singleSpa from 'single-spa';

import { getAppConfig } from '../app-config';

import { createGraphqlClient, ServerError } from './utils/graphql-client';
import { Identity } from './utils/identity';
import { Applications } from './applications';
import { BrowserMessageBus } from './message-bus';

const HOME_PAGE = '/projects';
const bus = BrowserMessageBus.create();

const history = createBrowserHistory();

const authMessage = { channel: 'auth', topic: 'login', self: true };

const sendMessageOnAuth = () => {
  bus.send({ ...authMessage, payload: { loggedIn: true } });
};

const sendMessageOnLogout = () => {
  bus.send({ ...authMessage, payload: { loggedIn: false } });
};

bus.subscribe({ channel: 'auth', topic: 'logged-in' }, () => {
  // const url = new URL(window.location.href).searchParams.get('redirect-to') ?? HOME_PAGE;
  // singleSpa.navigateToUrl(url.toString());
});

const handleGraphqlClientError = (err: ServerError): void => {
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

ReactDOM.render(
  <Applications history={history} bus={bus} graphqlClient={graphqlClient} identity={identity} />,
  document.getElementById('root'),
);
