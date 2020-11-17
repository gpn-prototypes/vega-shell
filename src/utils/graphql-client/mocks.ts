import { ApolloError, gql } from '@apollo/client';

export const queries = {
  GET_PROJECT: gql`
    query GetProject {
      project(vid: "a3333333-b111-c111-d111-e00000000009") {
        ... on Project {
          name
        }

        ... on Error {
          details
          payload
          message
          code
        }
      }
    }
  `,
};

const internalServerError = new ApolloError({
  graphQLErrors: [],
  networkError: {
    statusCode: 500,
    name: 'Server Error',
    message: 'Internal Server Error',
  },
});

export const projectNotFoundError = {
  data: {
    project: {
      details: null,
      payload: null,
      message: 'Проект не найден',
      code: 'PROJECT_NOT_FOUND',
      __typename: 'Error',
    },
  },
};

export const mocks = {
  projectNotFoundError,
  internalServerError,
};
