import React from 'react';
import { screen } from '@testing-library/react';
import { MockList } from 'apollo-server';
import faker from 'faker';

import { useProjectsList } from './__generated__/test-project-query';
import { render } from './react-testing-library';
import { waitRequests } from './wait-requests';

const resolver = {
  Project: () => {
    return {
      name: faker.name.title(),
    };
  },
  ProjectListOrError: () => {
    return {
      __typename: 'ProjectList',
      projectList: () => new MockList(5),
      totalItems: () => 5,
    };
  },
};

const errorResolver = {
  Error: () => {
    return {
      code: () => 'PROJECT_NOT_FOUND',
      message: () => 'error',
      details: () => 'details',
    };
  },
  ProjectListOrError: () => {
    return {
      __typename: 'Error',
    };
  },
};

const Component = () => {
  const { data: projectListData } = useProjectsList();

  if (projectListData?.projectList?.__typename === 'ProjectList') {
    return (
      <span data-testid="project-list-length">
        {projectListData.projectList.projectList?.length}
      </span>
    );
  }

  if (projectListData?.projectList?.__typename === 'Error') {
    return <span data-testid="project-list-error">{projectListData.projectList.code}</span>;
  }

  return null;
};

describe('react-testing-library', () => {
  test('отрабатывают моки', async () => {
    render(<Component />, { shell: { customResolvers: resolver }, isAuth: true });

    expect(await screen.findByTestId('project-list-length')).toHaveTextContent('5');
  });

  test('корректно обрабатывается __typename в резолверах', async () => {
    render(<Component />, { shell: { customResolvers: errorResolver }, isAuth: true });

    await waitRequests();

    expect(await screen.getByTestId('project-list-error')).toHaveTextContent('PROJECT_NOT_FOUND');
  });
});
