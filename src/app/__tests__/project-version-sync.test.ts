import { gql } from '@apollo/client';
import faker from 'faker';

import { configureShell, SchemaResolvers } from '../../testing';

function createShell(resolvers?: SchemaResolvers) {
  return configureShell({ isAuth: true, resolvers });
}

describe('актуализация версии проекта', () => {
  const ProjectNameQuery = gql`
    query ProjectName($vid: UUID!) {
      project(vid: $vid) {
        ... on Project {
          vid
          name
          version
        }
      }
    }
  `;

  const ProjectVersionQuery = gql`
    query ProjectVersion($vid: UUID!) {
      project(vid: $vid) {
        ... on Project {
          vid
          version
        }
      }
    }
  `;
  test('запросы привязанные к проекту перезапрашиваются, если версия проекта обновилась', async () => {
    const vid = faker.random.uuid();
    const serverProject = {
      vid,
      version: 1,
    };

    const shell = createShell({
      ProjectOrError(_, variables) {
        if (variables.vid === serverProject.vid) {
          return { __typename: 'Project' };
        }

        return { __typename: 'Error' };
      },
      Project(_, variables) {
        return {
          __typename: 'Project',
          vid: variables.vid,
          version: serverProject.version,
        };
      },
    });

    await shell.currentProject.checkout(vid);
    await shell.graphQLClient.query({
      query: ProjectNameQuery,
      variables: { vid },
    });

    serverProject.version += 1;

    await shell.graphQLClient.query({
      query: ProjectVersionQuery,
      variables: { vid },
      fetchPolicy: 'network-only',
    });

    const cachedProjectName = shell.graphQLClient.cache.readQuery({
      query: ProjectNameQuery,
      variables: { vid },
    });

    expect(cachedProjectName).toStrictEqual(
      expect.objectContaining({
        project: expect.objectContaining({ vid, version: 2 }),
      }),
    );
  });

  test('перезапрашиваются данные проекта после выполнения мутации проекта', async () => {
    const vid = faker.random.uuid();
    const serverProject = {
      vid,
      description: '',
      version: 1,
    };

    const shell = createShell({
      ProjectDiffOrError(_, variables) {
        if (variables.vid === vid) {
          return { __typename: 'Project' };
        }

        return { __typename: 'Error' };
      },

      UpdateProject(_, variables) {
        if (variables.data.version !== serverProject.version) {
          return {
            result: { __typename: 'ProjectDiffError' },
          };
        }

        Object.assign(serverProject, variables.data);

        serverProject.version += 1;

        return {
          result: {
            __typename: 'Project',
            ...serverProject,
          },
        };
      },

      ProjectOrError(_, variables) {
        if (variables.vid === vid) {
          return { __typename: 'Project' };
        }

        return { __typename: 'Error' };
      },
      Project() {
        return {
          __typename: 'Project',
          name: faker.name.title(),
          vid: serverProject.vid,
          version: serverProject.version,
        };
      },
    });

    const UpdateProjectDescription = gql`
      mutation UpdateProjectDescription($vid: UUID!, $description: String!, $version: Int!) {
        updateProject(vid: $vid, data: { description: $description, version: $version }) {
          result {
            ... on Project {
              vid
              description
              version
            }
          }
        }
      }
    `;

    await shell.currentProject.checkout(vid);
    await shell.graphQLClient.query({
      query: ProjectNameQuery,
      variables: { vid },
    });

    await shell.graphQLClient.mutate({
      mutation: UpdateProjectDescription,
      variables: { vid, version: 1, description: 'Test' },
    });

    const cachedProjectName = shell.graphQLClient.cache.readQuery({
      query: ProjectNameQuery,
      variables: { vid },
    });

    expect(cachedProjectName).toStrictEqual(
      expect.objectContaining({
        project: expect.objectContaining({ vid, version: 2 }),
      }),
    );
  });

  test('при смене проекта данные для предыдущего проекта очищаются', async () => {
    const vid = faker.random.uuid();

    const project = {
      vid,
      version: 1,
    };

    const shell = createShell({
      ProjectOrError() {
        return { __typename: 'Project' };
      },
      Project(_, variables) {
        return {
          __typename: 'Project',
          vid: variables.vid,
          version: variables.vid === project.vid ? project.version : faker.random.number(1000),
        };
      },
    });

    const ProjectDescriptionQuery = gql`
      query ProjectDescription($vid: UUID!) {
        project(vid: $vid) {
          ... on Project {
            vid
            description
            version
          }
        }
      }
    `;

    await shell.currentProject.checkout(vid);

    await shell.graphQLClient.query({
      query: ProjectNameQuery,
      variables: { vid },
    });

    // без await, чтобы эмулировать смену проекта ВО ВРЕМЯ запроса
    shell.graphQLClient.query({
      query: ProjectDescriptionQuery,
      variables: { vid },
    });

    const anotherVid = faker.random.uuid();
    await shell.currentProject.checkout(anotherVid);

    project.version += 1;

    await shell.graphQLClient.query({
      query: ProjectNameQuery,
      variables: { vid: anotherVid },
      fetchPolicy: 'network-only',
    });

    const cachedProjectName = shell.graphQLClient.cache.readQuery({
      query: ProjectNameQuery,
      variables: { vid },
    });

    expect(cachedProjectName).toBe(null);
  });

  test('если указан no-cache, то данные не попадают в кэш после запроса, и не перезапрашиваются', async () => {
    const vid = faker.random.uuid();
    let version = 1;

    const shell = createShell({
      ProjectOrError() {
        return { __typename: 'Project' };
      },
      Project(_, variables) {
        return {
          __typename: 'Project',
          vid: variables.vid,
          version: variables.vid === vid ? version : faker.random.number(100),
        };
      },
    });

    await shell.currentProject.checkout(vid);

    await shell.graphQLClient.query({
      query: ProjectNameQuery,
      variables: { vid },
      fetchPolicy: 'no-cache',
    });

    version += 1;

    await shell.graphQLClient.query({
      query: ProjectVersionQuery,
      variables: { vid },
    });

    const cachedProjectName = shell.graphQLClient.cache.readQuery({
      query: ProjectNameQuery,
      variables: { vid },
    });

    expect(cachedProjectName).toBe(null);
  });

  test('если данные были удалены из кэша, то они больше не перезапрашиваются', async () => {
    const vid = faker.random.uuid();
    let version = 1;

    const shell = createShell({
      ProjectOrError() {
        return { __typename: 'Project' };
      },
      Project(_, variables) {
        return {
          __typename: 'Project',
          vid: variables.vid,
          version: variables.vid === vid ? version : faker.random.number(100),
        };
      },
    });

    await shell.currentProject.checkout(vid);

    await shell.graphQLClient.query({
      query: ProjectNameQuery,
      variables: { vid },
    });

    const readFromCache = () =>
      shell.graphQLClient.cache.readQuery({
        query: ProjectNameQuery,
        variables: { vid },
      });

    expect(readFromCache()).not.toBe(null);

    shell.graphQLClient.cache.evict({
      id: shell.graphQLClient.cache.identify({ __typename: 'Project', vid }),
    });

    expect(readFromCache()).toBe(null);

    version += 1;

    await shell.graphQLClient.query({
      query: ProjectVersionQuery,
      variables: { vid },
    });

    expect(readFromCache()).toBe(null);
  });

  test('падает с ошибкой, если превышен лимит попыток синхронизации', async () => {
    const vid = faker.random.uuid();
    const serverProject = {
      vid,
      version: 1,
    };

    const shell = createShell({
      ProjectOrError(_, variables) {
        if (variables.vid === serverProject.vid) {
          return { __typename: 'Project' };
        }

        return { __typename: 'Error' };
      },
      Project(_, variables) {
        const result = {
          __typename: 'Project',
          vid: variables.vid,
          version: serverProject.version,
        };

        serverProject.version += 1;
        return result;
      },
    });

    await shell.currentProject.checkout(vid);
    await shell.graphQLClient.query({
      query: ProjectNameQuery,
      variables: { vid },
    });

    try {
      await shell.graphQLClient.query({
        query: ProjectVersionQuery,
        variables: { vid },
        fetchPolicy: 'network-only',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    expect.hasAssertions();
  });
});
