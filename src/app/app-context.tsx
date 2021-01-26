import React, { createContext, useContext } from 'react';
import { History } from 'history';

import { GraphQLClient, ServerError } from '../services/graphql-client';
import { Identity } from '../services/identity';
import { MessageBus } from '../services/message-bus';
import { Notifications } from '../services/notifications';

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

export const AppContext = createContext<AppContextProps | null>(null);

export const AppProvider: React.FC<AppContextProps> = (props) => {
  const { children, ...value } = props;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextProps => {
  const ctx = useContext(AppContext);

  if (ctx === null) {
    throw new Error('useAppContext called outside from AppProvider');
  }

  return ctx;
};
