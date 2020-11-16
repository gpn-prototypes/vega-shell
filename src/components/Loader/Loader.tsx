import React from 'react';
import ReactDOM from 'react-dom';
import { Loader, presetGpnDark, Theme } from '@gpn-prototypes/vega-ui';
import singleSpaReact from 'single-spa-react';

import './Loader.css';

const Root = () => {
  return ReactDOM.createPortal(
    <Theme preset={presetGpnDark}>
      <Loader className="ShellLoader" />
    </Theme>,
    document.body,
  );
};

export const loaderLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  suppressComponentDidCatchWarning: true,
});
