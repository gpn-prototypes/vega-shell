import { act } from './react-testing-library';

// https://trojanowski.dev/apollo-hooks-testing-without-act-warnings/
export async function waitRequests(ms = 0): Promise<void> {
  await act(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
}
