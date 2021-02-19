import React from 'react';
import {
  render as defaultRender,
  RenderOptions,
  RenderResult as RTLRenderResult,
} from '@testing-library/react';

import { Shell, ShellProvider } from '../app';
import { LS_KEYS } from '../services/identity';
import { mockValidToken } from '../services/identity/tokenHandlers';

import { addCleanupTask } from './cleanup';

export * from '@testing-library/react';

interface RenderContext {
  shell: Shell;
}

interface ShellOptions {
  baseApiUrl?: string;
}

export interface Options extends RenderOptions {
  route?: string;
  isAuth?: boolean;
  shell?: ShellOptions;
  beforeRender?: (context: RenderContext) => void;
}

export type RenderResult = RTLRenderResult & { shell: Shell };

export const render = (ui: React.ReactElement, options: Options = {}): RenderResult => {
  const { shell: shellOptions, beforeRender, isAuth = false, route = '/', ...rtlOptions } = options;

  window.history.pushState({}, 'Test page', route);

  const shell = new Shell({
    baseApiUrl: shellOptions?.baseApiUrl ?? '',
  });

  if (beforeRender !== undefined) {
    beforeRender({ shell });
  }

  if (isAuth) {
    localStorage.setItem(LS_KEYS.LS_ACCESS_TOKEN_KEY, mockValidToken());
    localStorage.setItem(LS_KEYS.LS_REFRESH_TOKEN_KEY, mockValidToken());

    addCleanupTask(() => {
      localStorage.removeItem(LS_KEYS.LS_ACCESS_TOKEN_KEY);
      localStorage.removeItem(LS_KEYS.LS_REFRESH_TOKEN_KEY);
    });
  }

  addCleanupTask(() => {
    shell.dispose();
  });

  const TestProviders: React.FC = ({ children }) => {
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
