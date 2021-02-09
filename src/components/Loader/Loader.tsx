import React from 'react';
import { Loader, usePortalRender } from '@gpn-prototypes/vega-ui';

import './Loader.css';

export const SHELL_LOADER_TEST_ID = 'shell-loader';
export const SHELL_LOADER_LABEL = 'Загрузка приложения';

export const RootLoader = (): React.ReactElement => {
  const { renderPortalWithTheme } = usePortalRender();

  return renderPortalWithTheme(
    <Loader
      data-testid={SHELL_LOADER_TEST_ID}
      aria-label={SHELL_LOADER_LABEL}
      className="ShellLoader"
    />,
    document.body,
  );
};
