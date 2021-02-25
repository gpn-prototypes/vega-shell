import { DocumentNode, gql, Operation, OperationVariables } from '@apollo/client';
import { createOperation as apolloCreateOperation } from '@apollo/client/link/utils';
import { v4 as uuid } from 'uuid';

import { CommonEndpointStrategy } from './common-endpoint-strategy';
import { createEndpointStrategy } from './create-endpoint-strategy';
import { ProjectEndpointStrategy } from './project-endpoint-strategy';

function createProject() {
  return {
    vid: uuid(),
    version: 1,
  };
}

function createContext() {
  return {
    trackOperation: jest.fn(),
    onProjectOff: jest.fn(),
    onCurrentProjectUpdate: jest.fn(),
    currentProject: {
      get: jest.fn(),
    },
  };
}

function createOperation(params: {
  query: DocumentNode;
  variables?: OperationVariables;
  context?: any;
}): Operation {
  return apolloCreateOperation(params?.context, {
    ...params,
  });
}

describe('createEndpointStrategy', () => {
  function create(uri: string) {
    const project = createProject();
    const query = gql`
      query TestQuery($vid: UUID!) {
        project(vid: $vid) {
          vid
          version
        }
      }
    `;

    return createEndpointStrategy(uri, {
      initialProject: project,
      context: createContext(),
      operation: createOperation({ query, variables: { vid: project.vid } }),
    });
  }

  test('создает CommonEndpointStrategy', () => {
    expect(create('/graphql')).toBeInstanceOf(CommonEndpointStrategy);
    expect(create('graphql')).toBeInstanceOf(CommonEndpointStrategy);
    expect(create('/graphql/')).toBeInstanceOf(CommonEndpointStrategy);
    expect(create('/graphql?some=query')).toBeInstanceOf(CommonEndpointStrategy);
    expect(create('http://example.com/graphql?some=query')).toBeInstanceOf(CommonEndpointStrategy);
  });

  test('создает ProjectEndpointStrategy', () => {
    expect(create(`graphql/${uuid()}`)).toBeInstanceOf(ProjectEndpointStrategy);
    expect(create(`/graphql/${uuid()}`)).toBeInstanceOf(ProjectEndpointStrategy);
    expect(create(`/graphql/${uuid()}`)).toBeInstanceOf(ProjectEndpointStrategy);
    expect(create(`/graphql/${uuid()}?some=query`)).toBeInstanceOf(ProjectEndpointStrategy);
    expect(create(`http://example.com/graphql/${uuid()}`)).toBeInstanceOf(ProjectEndpointStrategy);
  });
});

describe('CommonEndpointStrategy', () => {
  let project: any;
  let context: ReturnType<typeof createContext>;

  beforeEach(() => {
    project = createProject();
    context = createContext();
  });

  const projectQuery = gql`
    query TestQuery($vid: UUID!) {
      project(vid: $vid) {
        vid
        version
      }
    }
  `;

  test('запоминает operation, если в ответе были найдены данные о текущем проекте', () => {
    const operation = createOperation({ query: projectQuery, variables: { vid: project.vid } });

    context.currentProject.get.mockReturnValue(project);

    const strategy = new CommonEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({ __typename: 'Query', project: { ...project, __typename: 'Project' } });

    expect(context.trackOperation).toHaveBeenCalledTimes(1);
  });

  test('не запоминает operation, если в ответе не были найдены данные о текущем проекте', () => {
    const anotherProject = createProject();
    const operation = createOperation({
      query: projectQuery,
      variables: { vid: anotherProject.vid },
    });

    context.currentProject.get.mockReturnValue(project);

    const strategy = new CommonEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({
      __typename: 'Query',
      project: { ...anotherProject, __typename: 'Project' },
    });

    expect(context.trackOperation).not.toHaveBeenCalled();
  });

  test('не запоминает operation, если в ответе не было данных', () => {
    const anotherProject = createProject();
    const operation = createOperation({
      query: projectQuery,
      variables: { vid: anotherProject.vid },
    });

    context.currentProject.get.mockReturnValue(project);

    const strategy = new CommonEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData(null);

    expect(context.trackOperation).not.toHaveBeenCalled();
  });

  test('вызывается callback на обновление версии, если найдена новая версия проекта', () => {
    const operation = createOperation({ query: projectQuery, variables: { vid: project.vid } });

    context.currentProject.get.mockReturnValue(project);

    const strategy = new CommonEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({
      __typename: 'Query',
      project: { ...project, version: project.version + 1, __typename: 'Project' },
    });

    expect(context.onCurrentProjectUpdate).toHaveBeenCalledTimes(1);
  });

  test('вызывается callback на отмену действий по проекту, если на момент обработки ответа проект не активен', () => {
    const operation = createOperation({ query: projectQuery, variables: { vid: project.vid } });

    context.currentProject.get.mockReturnValue(null);

    const strategy = new CommonEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({
      __typename: 'Query',
      project: { ...project, __typename: 'Project' },
    });

    expect(context.onProjectOff).toHaveBeenCalledTimes(1);
  });
});

describe('ProjectEndpointStrategy', () => {
  let project: any;
  let context: ReturnType<typeof createContext>;

  beforeEach(() => {
    project = createProject();
    context = createContext();
  });

  const projectQuery = gql`
    query TestQuery {
      project {
        version
      }
    }
  `;

  const projectMutation = gql`
    mutation TestMutation {
      version
    }
  `;

  test('запоминает operation с query, если в ответе были найдены данные о текущем проекте', () => {
    const operation = createOperation({ query: projectQuery });

    context.currentProject.get.mockReturnValue(project);

    const strategy = new ProjectEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({ version: project.version, __typename: 'Query' });

    expect(context.trackOperation).toHaveBeenCalledTimes(1);
  });

  test('не запоминает operation с mutation, если в ответе были найдены данные о текущем проекте', () => {
    const operation = createOperation({ query: projectMutation });

    context.currentProject.get.mockReturnValue(project);

    const strategy = new ProjectEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({ version: project.version, __typename: 'Mutation' });

    expect(context.trackOperation).toHaveBeenCalledTimes(0);
  });

  test('не запоминает operation с query, если в ответе не были найдены данные о текущем проекте', () => {
    const operation = createOperation({ query: projectQuery });

    context.currentProject.get.mockReturnValue(project);

    const strategy = new ProjectEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({ __typename: 'Query', project: { __typename: 'ProjectInner' } });

    expect(context.trackOperation).not.toHaveBeenCalled();
  });

  test('не запоминает operation с mutation, если в ответе не были найдены данные о текущем проекте', () => {
    const anotherProject = createProject();
    const operation = createOperation({
      query: projectMutation,
      variables: { vid: anotherProject.vid },
    });

    context.currentProject.get.mockReturnValue(project);

    const strategy = new ProjectEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({ __typename: 'Mutation' });

    expect(context.trackOperation).not.toHaveBeenCalled();
  });

  test('вызывается callback на обновление версии для operation с query, если найдена новая версия проекта', () => {
    const operation = createOperation({ query: projectQuery, variables: { vid: project.vid } });

    context.currentProject.get.mockReturnValue(project);

    const strategy = new ProjectEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({
      __typename: 'Query',
      version: project.version + 1,
      project: { ...project, version: project.version + 1, __typename: 'ProjectInner' },
    });

    expect(context.onCurrentProjectUpdate).toHaveBeenCalledTimes(1);
  });

  test('вызывается callback на обновление версии для operation с mutation, если найдена новая версия проекта', () => {
    const operation = createOperation({ query: projectMutation, variables: { vid: project.vid } });

    context.currentProject.get.mockReturnValue(project);

    const strategy = new ProjectEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({
      __typename: 'Mutation',
      version: project.version + 1,
    });

    expect(context.onCurrentProjectUpdate).toHaveBeenCalledTimes(1);
  });

  test('вызывается callback на отмену действий по проекту, если на момент обработки ответа проект не активен', () => {
    const operation = createOperation({ query: projectQuery });

    context.currentProject.get.mockReturnValue(null);

    const strategy = new CommonEndpointStrategy({
      initialProject: project,
      operation,
      context,
    });

    strategy.processData({
      __typename: 'Query',
      project: { version: project.version, __typename: 'ProjectInner' },
    });

    expect(context.onProjectOff).toHaveBeenCalledTimes(1);
  });
});
