import * as Types from '../../../__generated__/types';

import { DocumentNode } from 'graphql';
import * as Apollo from '@apollo/client';
export type GetProjectNameVariables = Types.Exact<{
  vid: Types.Scalars['UUID'];
}>;


export type GetProjectName = (
  { __typename: 'Query' }
  & { project?: Types.Maybe<(
    { __typename: 'Project' }
    & Pick<Types.Project, 'vid' | 'name'>
  ) | (
    { __typename: 'Error' }
    & Pick<Types.Error, 'code' | 'message' | 'details' | 'payload'>
  )> }
);


export const GetProjectNameDocument: DocumentNode = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProjectName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"vid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"vid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"vid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}}]}}]}}]}}]};

/**
 * __useGetProjectName__
 *
 * To run a query within a React component, call `useGetProjectName` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectName` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectName({
 *   variables: {
 *      vid: // value for 'vid'
 *   },
 * });
 */
export function useGetProjectName(baseOptions: Apollo.QueryHookOptions<GetProjectName, GetProjectNameVariables>) {
        return Apollo.useQuery<GetProjectName, GetProjectNameVariables>(GetProjectNameDocument, baseOptions);
      }
export function useGetProjectNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectName, GetProjectNameVariables>) {
          return Apollo.useLazyQuery<GetProjectName, GetProjectNameVariables>(GetProjectNameDocument, baseOptions);
        }
export type GetProjectNameHookResult = ReturnType<typeof useGetProjectName>;
export type GetProjectNameLazyQueryHookResult = ReturnType<typeof useGetProjectNameLazyQuery>;
export type GetProjectNameQueryResult = Apollo.QueryResult<GetProjectName, GetProjectNameVariables>;