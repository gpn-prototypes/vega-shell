import * as Types from '../../__generated__/types';

import { DocumentNode } from 'graphql';
import * as Apollo from '@apollo/client';
export type ProjectsListVariables = Types.Exact<{ [key: string]: never; }>;


export type ProjectsList = (
  { __typename: 'Query' }
  & { projectList?: Types.Maybe<(
    { __typename: 'ProjectList' }
    & { projectList?: Types.Maybe<Array<Types.Maybe<(
      { __typename: 'Project' }
      & Pick<Types.Project, 'vid' | 'name'>
    )>>> }
  ) | (
    { __typename: 'Error' }
    & Pick<Types.Error, 'code' | 'message' | 'details'>
  )> }
);


export const ProjectsListDocument: DocumentNode = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectsList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectList"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"details"}}]}}]}}]}}]};

/**
 * __useProjectsList__
 *
 * To run a query within a React component, call `useProjectsList` and pass it any options that fit your needs.
 * When your component renders, `useProjectsList` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectsList({
 *   variables: {
 *   },
 * });
 */
export function useProjectsList(baseOptions?: Apollo.QueryHookOptions<ProjectsList, ProjectsListVariables>) {
        return Apollo.useQuery<ProjectsList, ProjectsListVariables>(ProjectsListDocument, baseOptions);
      }
export function useProjectsListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectsList, ProjectsListVariables>) {
          return Apollo.useLazyQuery<ProjectsList, ProjectsListVariables>(ProjectsListDocument, baseOptions);
        }
export type ProjectsListHookResult = ReturnType<typeof useProjectsList>;
export type ProjectsListLazyQueryHookResult = ReturnType<typeof useProjectsListLazyQuery>;
export type ProjectsListQueryResult = Apollo.QueryResult<ProjectsList, ProjectsListVariables>;