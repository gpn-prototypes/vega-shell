import { createContext, useContext } from 'react';
import { createBrowserHistory, History } from 'history';

import { createGraphqlClient, GraphQLClient, ServerError } from './utils/graphql-client';
import { Identity } from './utils/identity';
import { BrowserMessageBus } from './message-bus';

export type ServerErrorListener = (error: ServerError) => void;

export type AppContextProps = {
  history: History;
  identity: Identity;
  graphqlClient: GraphQLClient;
  bus: BrowserMessageBus;
};

const defaultIdentity = new Identity({ apiUrl: '/api' });

export const AppContext = createContext<AppContextProps>({
  history: createBrowserHistory(),
  identity: defaultIdentity,
  graphqlClient: createGraphqlClient({
    identity: defaultIdentity,
    uri: '/graphql',
    onError: () => {},
  }),
  bus: BrowserMessageBus.create(),
});

export const useAppContext = (): AppContextProps => useContext(AppContext);
