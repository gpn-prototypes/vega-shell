import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact, { Lifecycles } from 'single-spa-react';

export type SystemJS = {
  resolve: (name: string) => string;
  delete: VoidFunction;
  import: (name: string) => Promise<System.Module> | Lifecycles;
};

export const getSystemJSMock = (Component: React.FC<unknown>): SystemJS => {
  return {
    resolve: (name: string) => name,
    delete: jest.fn(),
    import: () => {
      return singleSpaReact({
        rootComponent: Component,
        React,
        ReactDOM,
      });
    },
  };
};
