import React from 'react';
import { useUnmount } from '@gpn-prototypes/vega-ui';
import { render as defaultRender, RenderOptions, RenderResult } from '@testing-library/react';
import fetch from 'cross-fetch';

import { Shell, ShellProvider } from '../app';

export * from '@testing-library/react';

interface Options extends RenderOptions {
  shell?: {
    baseApiUrl?: string;
  };
}

export type ShellRenderResult = RenderResult & { shell: Shell };

export const render = (ui: React.ReactElement, options: Options = {}): ShellRenderResult => {
  const { shell: shellOptions = {}, ...rtlOptions } = options;

  const shell = new Shell({
    baseApiUrl: shellOptions.baseApiUrl ?? 'https://api.test.url',
    fetch,
  });

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
