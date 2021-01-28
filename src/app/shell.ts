import type { History } from 'history';
import { createBrowserHistory } from 'history';

import type { GraphQLClient, GraphQLClientConfig } from '../services/graphql-client';
import { createGraphqlClient, ServerError } from '../services/graphql-client';
import { Identity } from '../services/identity';
import { MessageBus } from '../services/message-bus';
import { Notifications } from '../services/notifications';

interface Config {
  baseApiUrl: string;
  fetch?: GraphQLClientConfig['fetch'];
}

export class Shell {
  readonly history: History;

  readonly messageBus: MessageBus;

  readonly notifications: Notifications;

  readonly identity: Identity;

  readonly graphQLClient: GraphQLClient;

  constructor(config: Config) {
    this.history = createBrowserHistory();
    this.messageBus = MessageBus.create();
    this.notifications = new Notifications();

    this.identity = new Identity({
      apiUrl: config.baseApiUrl,
      onAuth: () => {
        this.handleLoggedInChange({ isLoggedIn: true });
      },
      onLogout: () => {
        this.handleLoggedInChange({ isLoggedIn: false });
      },
    });

    this.graphQLClient = createGraphqlClient({
      uri: `${config.baseApiUrl}/graphql`,
      fetch: config.fetch,
      identity: this.identity,
      onError: (error: ServerError) => {
        this.handleGraphQLClientError(error);
      },
    });
  }

  private handleLoggedInChange(data: { isLoggedIn: boolean }): void {
    this.messageBus.send({
      channel: 'auth',
      topic: 'login',
      broadcast: true,
      payload: { loggedIn: data.isLoggedIn },
    });
  }

  private handleGraphQLClientError(error: ServerError): void {
    this.messageBus.send({ channel: 'error', topic: 'server-error', payload: error });
  }

  dispose(): void {
    this.messageBus.dispose();
    this.identity.clear();
  }
}
