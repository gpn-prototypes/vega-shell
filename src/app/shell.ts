import { ApolloLink } from '@apollo/client';
import type { History } from 'history';
import { createBrowserHistory } from 'history';

import {
  CurrentProject,
  FindProjectResult,
  FindProjectResultCode,
} from '../services/current-project';
import type { GraphQLClient, GraphQLClientConfig } from '../services/graphql-client';
import { createGraphqlClient, ServerError } from '../services/graphql-client';
import { Identity } from '../services/identity';
import { MessageBus } from '../services/message-bus';
import { Notifications } from '../services/notifications';

import {
  FindProject,
  FindProjectDocument,
  FindProjectVariables,
} from './__generated__/find-project';

interface Config {
  baseApiUrl: string;
  fetch?: GraphQLClientConfig['fetch'];
  link?: ApolloLink;
}

export class Shell {
  readonly history: History;

  readonly messageBus: MessageBus;

  readonly notifications: Notifications;

  readonly identity: Identity;

  readonly graphQLClient: GraphQLClient;

  readonly currentProject: CurrentProject;

  constructor(config: Config) {
    this.history = createBrowserHistory();
    this.messageBus = MessageBus.create();
    this.notifications = new Notifications({ messageBus: this.messageBus });

    this.identity = new Identity({
      apiUrl: config.baseApiUrl,
      onAuth: () => {
        this.handleLoggedInChange({ isLoggedIn: true });
      },
      onLogout: () => {
        this.handleLoggedInChange({ isLoggedIn: false });
        this.graphQLClient.clearStore();
      },
    });

    this.currentProject = new CurrentProject({
      findProject: (vid) => {
        return this.findProject(vid);
      },
      onStatusChange: (status) => {
        this.messageBus.send({
          channel: 'project',
          topic: 'status',
          payload: status,
          self: true,
          broadcast: false,
        });
      },
    });

    this.graphQLClient = createGraphqlClient({
      uri: `${config.baseApiUrl}/graphql`,
      fetch: config.fetch,
      identity: this.identity,
      link: config.link,
      currentProject: this.currentProject,
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

  private async findProject(vid: string): Promise<FindProjectResult> {
    const result = await this.graphQLClient.query<FindProject, FindProjectVariables>({
      query: FindProjectDocument,
      variables: {
        vid,
      },
    });

    const { data } = result;

    if (data.project?.__typename === 'Project') {
      const project = {
        vid: data.project.vid as string,
        version: data.project.version as number,
      };

      return { code: FindProjectResultCode.Success, project };
    }

    if (data.project?.__typename === 'Error' && data.project.code === 'PROJECT_NOT_FOUND') {
      return { code: FindProjectResultCode.NotFound };
    }

    return { code: FindProjectResultCode.Error };
  }

  dispose(): void {
    this.messageBus.dispose();
    this.identity.clear();
    this.currentProject.release();
    this.graphQLClient.clearStore();
    this.graphQLClient.stop();
  }
}
