// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact, { Lifecycles } from 'single-spa-react';

export type SystemJS = {
  resolve: (name: string) => string;
  delete: VoidFunction;
  import: (name: string) => Promise<System.Module> | Lifecycles;
};

interface ImportMap {
  [alias: string]: React.FC<unknown>;
}

export const getSystemJSMock = (importMap: ImportMap): SystemJS => {
  return {
    resolve: (name: string) => name,
    delete: jest.fn(),
    import: (name: string) => {
      const Component = importMap[name];

      if (Component === undefined) {
        return Promise.reject(new Error('Module not found'));
      }

      const module = {
        default: Component,
        ...singleSpaReact({
          rootComponent: Component,
          suppressComponentDidCatchWarning: true,
          React,
          ReactDOM,
        }),
      };

      return Promise.resolve(module);
    },
  };
};
