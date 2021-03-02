import React from 'react';
import {
  render as defaultRender,
  RenderOptions,
  RenderResult as RTLRenderResult,
} from '@testing-library/react';
import { IMocks } from 'apollo-server';

import { Shell, ShellProvider } from '../app';

import { configureShell } from './configure-shell';

export * from '@testing-library/react';

interface RenderContext {
  shell: Shell;
}

interface ShellOptions {
  baseApiUrl?: string;
  customResolvers?: IMocks;
}
export type BeforeRenderFn = (context: RenderContext) => void;

export interface Options extends RenderOptions {
  route?: string;
  isAuth?: boolean;
  shell?: ShellOptions;
  beforeRender?: BeforeRenderFn;
}

export type RenderResultShell = RTLRenderResult & { shell: Shell };

export const render = (ui: React.ReactElement, options: Options = {}): RenderResultShell => {
  const { shell: shellOptions, beforeRender, isAuth = false, route = '/', ...rtlOptions } = options;

  window.history.pushState({}, 'Test page', route);

  const shell = configureShell({
    baseApiUrl: shellOptions?.baseApiUrl,
    resolvers: shellOptions?.customResolvers,
    isAuth,
  });

  if (beforeRender !== undefined) {
    beforeRender({ shell });
  }

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
