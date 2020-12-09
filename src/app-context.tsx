import { createContext, useContext } from 'react';
import { createBrowserHistory, History } from 'history';

import { createGraphqlClient, GraphQLClient, ServerError } from './utils/graphql-client';
import { Identity } from './utils/identity';
import { Notifications } from './utils/notifications';
import { BrowserMessageBus } from './message-bus';

export type ServerErrorListener = (error: ServerError) => void;

export type AppContextProps = {
  history: History;
  identity: Identity;
  graphqlClient: GraphQLClient;
  bus: BrowserMessageBus;
  notifications: Notifications;
};

const identity = new Identity({ apiUrl: '/api' });

export const AppContext = createContext<AppContextProps>({
  history: createBrowserHistory(),
  identity,
  graphqlClient: createGraphqlClient({
    identity,
    uri: '/graphql',
    onError: () => {},
  }),
  bus: BrowserMessageBus.create(),
  notifications: new Notifications(),
});

export const useAppContext = (): AppContextProps => useContext(AppContext);
