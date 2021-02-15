import React from 'react';
import { useMount } from '@gpn-prototypes/vega-ui';
import { act, RenderResult, screen } from '@testing-library/react';

import { useShell } from '../../app';
import { getSystemJSMock, render } from '../../testing';
import { SHELL_LOADER_LABEL } from '../Loader';

import { Application, ApplicationProps } from './Application';

jest.unmock('single-spa-react/lib/esm/parcel');
const APP_NAME = 'app-name';

const TEST_COMPONENT_LABEL = 'test-component';

const TestComponent = () => {
  return <div aria-label={TEST_COMPONENT_LABEL} />;
};

beforeEach(() => {
  global.System = getSystemJSMock(TestComponent);
});

afterEach(() => {
  delete global.System;
});

export function renderComponent(props: Partial<ApplicationProps> = {}): RenderResult {
  return render(<Application name={APP_NAME} {...props} />);
}

describe('Application', () => {
  test('рендерится без ошибок', async () => {
    await act(async () => {
      expect(renderComponent).not.toThrow();
    });
  });

  test('рендерит компонент', async () => {
    const spy = jest.spyOn(global.System!, 'import');

    await act(async () => {
      renderComponent();
    });

    const component = screen.queryByLabelText(TEST_COMPONENT_LABEL);

    expect(component).toBeInTheDocument();

    expect(spy).toBeCalledWith(APP_NAME);
  });

  test('отображается лоадер', async () => {
    await act(async () => {
      renderComponent();
      expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).not.toBeInTheDocument();
  });

  test('если serverError не равно null, то компонент не рендерится', async () => {
    const Component = () => {
      const shell = useShell();

      useMount(() => {
        shell.setServerError({
          code: 404,
          message: 'not-found',
        });
      });

      return <Application name={APP_NAME} />;
    };

    await act(async () => {
      render(<Component />);
    });

    expect(screen.queryByLabelText(TEST_COMPONENT_LABEL)).not.toBeInTheDocument();
  });
});
