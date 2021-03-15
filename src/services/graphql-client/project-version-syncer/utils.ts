import { DocumentNode, visit } from 'graphql';

export { normalizeUri } from '../utils';

export function hasOnlyQueryOperation(query: DocumentNode): boolean {
  let onlyQuery = true;

  visit(query, {
    OperationDefinition: {
      enter(node) {
        if (node.operation !== 'query') {
          onlyQuery = false;
        }
      },
    },
  });

  return onlyQuery;
}

type BreakTraverse = null;
type Traverser = (
  key: string,
  value: unknown,
  obj: Record<string, unknown>,
  parent?: Record<string, unknown>,
) => BreakTraverse | void;

export function traverse(data: Record<string, unknown>, fn: Traverser): void {
  let done = false;
  function walk(current: Record<string, unknown>, parent?: Record<string, unknown>): void {
    // for check __typename first
    const sortedByKey = Object.entries(current).sort(
      ([a], [b]) => a.charCodeAt(0) - b.charCodeAt(0),
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of sortedByKey) {
      if (done) {
        break;
      }

      if (typeof value === 'object' && value !== null) {
        walk(value as Record<string, unknown>, current);
      } else if (fn(key, value, current, parent) === null) {
        done = true;
        break;
      }
    }
  }

  walk(data, undefined);
}
