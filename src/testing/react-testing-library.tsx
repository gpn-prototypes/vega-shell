import React from 'react';
import { render as defaultRender, RenderOptions, RenderResult } from '@testing-library/react';
import fetch from 'cross-fetch';

import { Shell, ShellProvider } from '../app';

export * from '@testing-library/react';

interface Options extends RenderOptions {
  shell?: {
    baseApiUrl?: string;
  };
}

export const render = (ui: React.ReactElement, options: Options = {}): RenderResult => {
  const { shell: shellOptions = {}, ...rtlOptions } = options;

  const TestProviders: React.FC = ({ children }) => {
    const shell = React.useMemo(
      () => new Shell({ baseApiUrl: shellOptions.baseApiUrl ?? 'https://api.test.url', fetch }),
      [],
    );

    React.useEffect(() => {
      return () => {
        shell.dispose();
      };
    }, [shell]);

    return <ShellProvider shell={shell}>{children}</ShellProvider>;
  };

  return defaultRender(ui, {
    wrapper: TestProviders,
    ...rtlOptions,
  });
};
