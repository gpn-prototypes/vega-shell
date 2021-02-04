import { renderHook } from '@testing-library/react-hooks';

import { useShell } from './shell-context';

describe('useShell', () => {
  test('выдает ошибку, если хук вызыван вне ShellProvider', () => {
    const { result } = renderHook(() => useShell());
    expect(result.error).toBeDefined();
  });
});
