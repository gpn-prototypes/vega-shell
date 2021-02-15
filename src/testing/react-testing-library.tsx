import React from 'react';
import { useUnmount } from '@gpn-prototypes/vega-ui';
import {
  render as defaultRender,
  RenderOptions,
  RenderResult as RTLRenderResult,
} from '@testing-library/react';
import fetch from 'cross-fetch';

import { Shell, ShellProvider } from '../app';
import { LS_KEYS } from '../services/identity';
import { mockValidToken } from '../services/identity/tokenHandlers';

export * from '@testing-library/react';

export interface Options extends RenderOptions {
  shell?: {
    baseApiUrl?: string;
  };
  isAuth?: boolean;
  beforeRender?: (context: { shell: Shell }) => void;
}

export type RenderResult = RTLRenderResult & { shell: Shell };

export const render = (ui: React.ReactElement, options: Options = {}): RenderResult => {
  const { shell: shellOptions, beforeRender, isAuth = false, ...rtlOptions } = options;

  const shell = new Shell({
    baseApiUrl: shellOptions?.baseApiUrl ?? 'https://api.test.url',
    fetch,
  });

  if (beforeRender !== undefined) {
    beforeRender({ shell });
  }

  if (isAuth) {
    localStorage.setItem(LS_KEYS.LS_ACCESS_TOKEN_KEY, mockValidToken());
    localStorage.setItem(LS_KEYS.LS_REFRESH_TOKEN_KEY, mockValidToken());
  }

  const TestProviders: React.FC = ({ children }) => {
    useUnmount(() => {
      shell.dispose();
    });

    return <ShellProvider shell={shell}>{children}</ShellProvider>;
  };

  return {
    shell,
    ...defaultRender(ui, {
      wrapper: TestProviders,
      ...rtlOptions,
    }),
  };
};
