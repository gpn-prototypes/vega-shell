import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { start } from 'single-spa';

import { getAppConfig } from '../app-config';

import { Applications } from './app/Applications';
import { createGraphqlClient, ServerError } from './services/graphql-client';
import { Identity } from './services/identity';
import { MessageBus } from './services/message-bus';
import { Notifications } from './services/notifications';

const bus = MessageBus.create();

const history = createBrowserHistory();

const handleLoggedInChange = (data: { isLoggedIn: boolean }) => {
  bus.send({
    channel: 'auth',
    topic: 'login',
    broadcast: true,
    payload: { loggedIn: data.isLoggedIn },
  });
};

const handleGraphqlClientError = (err: ServerError): void => {
  bus.send({ channel: 'error', topic: 'server-error', payload: err });
};

const { baseApiUrl } = getAppConfig();
const identity = new Identity({
  apiUrl: baseApiUrl,
  onAuth: () => handleLoggedInChange({ isLoggedIn: true }),
  onLogout: () => handleLoggedInChange({ isLoggedIn: false }),
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
