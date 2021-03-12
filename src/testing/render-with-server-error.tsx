import React from 'react';
import { useMount } from '@gpn-prototypes/vega-ui';

import { useShell } from '../app';
import { ServerError } from '../services/graphql-client';

import { Options, render, RenderResultShell } from './react-testing-library';

// Временное решение до объединения контекста с шеллом
export function renderWithServerError(
  ui: React.ReactElement,
  serverError: ServerError | null,
  options: Options = {},
): RenderResultShell {
  const Component = () => {
    const shell = useShell();

    useMount(() => {
      shell.setServerError(serverError);
    });

    return ui;
  };

  return render(<Component />, options);
}
