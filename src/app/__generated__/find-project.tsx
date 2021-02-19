import * as Types from '../../__generated__/types';

import { DocumentNode } from 'graphql';
import * as Apollo from '@apollo/client';
export type FindProjectVariables = Types.Exact<{
  vid: Types.Scalars['UUID'];
}>;


export type FindProject = (
  { __typename: 'Query' }
  & { project?: Types.Maybe<(
    { __typename: 'Project' }
    & Pick<Types.Project, 'vid' | 'version'>
  ) | (
    { __typename: 'Error' }
    & Pick<Types.Error, 'code'>
  ) | (
    { __typename: 'ValidationError' }
    & Pick<Types.ValidationError, 'code'>
  )> }
);


export const FindProjectDocument: DocumentNode = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"vid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"vid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"vid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Project"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vid"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ErrorInterface"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]};

/**
 * __useFindProject__
 *
 * To run a query within a React component, call `useFindProject` and pass it any options that fit your needs.
 * When your component renders, `useFindProject` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindProject({
 *   variables: {
 *      vid: // value for 'vid'
 *   },
 * });
 */
export function useFindProject(baseOptions: Apollo.QueryHookOptions<FindProject, FindProjectVariables>) {
        return Apollo.useQuery<FindProject, FindProjectVariables>(FindProjectDocument, baseOptions);
      }
export function useFindProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindProject, FindProjectVariables>) {
          return Apollo.useLazyQuery<FindProject, FindProjectVariables>(FindProjectDocument, baseOptions);
        }
export type FindProjectHookResult = ReturnType<typeof useFindProject>;
export type FindProjectLazyQueryHookResult = ReturnType<typeof useFindProjectLazyQuery>;
export type FindProjectQueryResult = Apollo.QueryResult<FindProject, FindProjectVariables>;