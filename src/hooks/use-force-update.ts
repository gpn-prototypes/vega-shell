import { useReducer } from 'react';

export function useForceUpdate(): VoidFunction {
  const [, forceUpdate] = useReducer((s) => s + 1, 0);
  return forceUpdate;
}
