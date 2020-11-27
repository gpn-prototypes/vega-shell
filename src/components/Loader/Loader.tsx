import React from 'react';
import { Loader, presetGpnDark, Theme, usePortalRender } from '@gpn-prototypes/vega-ui';

import './Loader.css';

export const RootLoader = (): React.ReactElement => {
  const { renderPortalWithTheme } = usePortalRender();

  return renderPortalWithTheme(
    <Theme preset={presetGpnDark}>
      <Loader className="ShellLoader" />
    </Theme>,
    document.body,
  );
};
