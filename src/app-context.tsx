import { createContext, useContext } from 'react';
import { createBrowserHistory, History } from 'history';

import { createGraphqlClient, GraphQLClient, ServerError } from './services/graphql-client';
import { Identity } from './services/identity';
import { MessageBus } from './services/message-bus';
import { Notifications } from './services/notifications';

export type ServerErrorListener = (error: ServerError) => void;

export type AppContextProps = {
  history: History;
  identity: Identity;
  graphqlClient: GraphQLClient;
  bus: MessageBus;
  notifications: Notifications;
  serverError: ServerError | null;
  setServerError: (serverError: ServerError | null) => void;
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
  bus: MessageBus.create(),
  notifications: new Notifications(),
  serverError: null,
  setServerError: () => {},
});

export const useAppContext = (): AppContextProps => useContext(AppContext);
