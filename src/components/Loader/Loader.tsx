import React from 'react';
import { Loader, usePortalRender } from '@gpn-prototypes/vega-ui';

import './Loader.css';

export const RootLoader = (): React.ReactElement => {
  const { renderPortalWithTheme } = usePortalRender();

  return renderPortalWithTheme(<Loader className="ShellLoader" />, document.body);
};
