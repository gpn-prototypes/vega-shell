import React, { createContext, useContext } from 'react';
import { Router } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import type { History } from 'history';

import type { CurrentProject } from '../services/current-project';
import type { GraphQLClient, ServerError } from '../services/graphql-client';
import type { Identity } from '../services/identity';
import type { MessageBus } from '../services/message-bus';
import type { Notifications } from '../services/notifications';

import type { Shell } from './shell';

export type ServerErrorListener = (error: ServerError) => void;

export type ShellProps = {
  shell: Shell;
};

interface ShellAPI {
  history: History;
  identity: Identity;
  graphqlClient: GraphQLClient;
  bus: MessageBus;
  notifications: Notifications;
  currentProject: CurrentProject;
  serverError: ServerError | null;
  setServerError: (serverError: ServerError | null) => void;
}

export const ShellContext = createContext<ShellAPI | null>(null);

export const ShellProvider: React.FC<ShellProps> = (props) => {
  const { children, shell } = props;

  const [serverError, setServerError] = React.useState<ServerError | null>(null);

  const value = React.useMemo<ShellAPI>(
    () => ({
      history: shell.history,
      identity: shell.identity,
      notifications: shell.notifications,
      bus: shell.messageBus,
      graphqlClient: shell.graphQLClient,
      currentProject: shell.currentProject,
      serverError,
      setServerError,
    }),
    [shell, serverError, setServerError],
  );

  return (
    <ShellContext.Provider value={value}>
      <Router history={shell.history}>{children}</Router>
    </ShellContext.Provider>
  );
};

export const useShell = (): ShellAPI => {
  const shell = useContext(ShellContext);

  if (shell === null) {
    throw new Error('useShell called outside from ShellProvider');
  }

  return shell;
};
