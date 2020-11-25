import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { start } from 'single-spa';

import { getAppConfig } from '../app-config';

import { createGraphqlClient, ServerError } from './services/graphql-client';
import { Identity } from './services/identity';
import { BrowserMessageBus } from './services/message-bus';
import { Notifications } from './services/notifications';
import { Applications } from './Applications';

const bus = BrowserMessageBus.create();

const history = createBrowserHistory();

const authMessage = { channel: 'auth', topic: 'login', self: true };

const handleLoggedInChange = (data: { isLoggedIn: boolean }) => {
  bus.send({ ...authMessage, payload: { loggedIn: data.isLoggedIn } });
};

const handleGraphqlClientError = (err: ServerError): void => {
  bus.send({ channel: 'error', topic: 'server-error', payload: err, self: true });
};

const { baseApiUrl } = getAppConfig();
const identity = new Identity({
  apiUrl: baseApiUrl,
  cbOnAuth: () => handleLoggedInChange({ isLoggedIn: true }),
  cbOnLogout: () => handleLoggedInChange({ isLoggedIn: false }),
});
const graphqlClient = createGraphqlClient({
  uri: `${baseApiUrl}/graphql`,
  identity,
  onError: handleGraphqlClientError,
});

const notifications = new Notifications();

ReactDOM.render(
  <Applications
    notifications={notifications}
    history={history}
    bus={bus}
    graphqlClient={graphqlClient}
    identity={identity}
  />,
  document.getElementById('root'),
);

start();
