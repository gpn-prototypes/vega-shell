import React from 'react';
import { act, RenderResult, screen } from '@testing-library/react';

import { getSystemJSMock, render, renderWithServerError } from '../../testing';
import { SHELL_LOADER_LABEL } from '../Loader';

import { Application, ApplicationProps, lazyComponentsCache } from './Application';

jest.unmock('single-spa-react/lib/esm/parcel');

const APP_NAME_1 = 'app-name-1';
const APP_NAME_2 = 'app-name-2';

const TEST_COMPONENT_LABEL_1 = 'test-component-1';
const TEST_COMPONENT_LABEL_2 = 'test-component-2';

const TestComponent = () => {
  return <div aria-label={TEST_COMPONENT_LABEL_1} />;
};

beforeEach(() => {
  lazyComponentsCache.clear();
  global.System = getSystemJSMock({
    [APP_NAME_1]: TestComponent,
    [APP_NAME_2]: () => <div aria-label={TEST_COMPONENT_LABEL_2} />,
  });
});

afterEach(() => {
  delete global.System;
});

export function renderComponent(props: Partial<ApplicationProps> = {}): RenderResult {
  const { name = APP_NAME_1 } = props;
  return render(<Application {...props} name={name} />);
}

describe('Application', () => {
  test('рендерится без ошибок', async () => {
    await act(async () => {
      expect(renderComponent).not.toThrow();
    });
  });

  test('рендерит компонент', async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const spy = jest.spyOn(global.System!, 'import');

    await act(async () => {
      renderComponent();
    });

    const component = screen.queryByLabelText(TEST_COMPONENT_LABEL_1);

    expect(component).toBeInTheDocument();

    expect(spy).toBeCalledWith(APP_NAME_1);
  });

  test('отображается лоадер', async () => {
    await act(async () => {
      renderComponent();
      expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).not.toBeInTheDocument();
  });

  test('если присутствует ошибка от сервера, то компонент не рендерится', async () => {
    await act(async () => {
      renderWithServerError(<Application name={APP_NAME_1} />, { code: 404, message: 'not-found' });
    });

    expect(screen.queryByLabelText(TEST_COMPONENT_LABEL_1)).not.toBeInTheDocument();
  });

  describe('type="react"', () => {
    test('рендерит компонент', async () => {
      renderComponent({ type: 'react' });
      expect(await screen.findByLabelText(TEST_COMPONENT_LABEL_1)).toBeInTheDocument();
    });

    test('отображается лоадер', async () => {
      const { rerender } = renderComponent({ type: 'react' });

      expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).toBeVisible();
      expect(await screen.findByLabelText(TEST_COMPONENT_LABEL_1)).toBeInTheDocument();
      expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).not.toBeInTheDocument();

      rerender(<Application type="react" name={APP_NAME_1} />);

      expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(TEST_COMPONENT_LABEL_1)).toBeInTheDocument();
    });

    test('смена приложения', async () => {
      const { rerender } = renderComponent({ type: 'react', name: APP_NAME_1 });

      expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).toBeVisible();
      expect(await screen.findByLabelText(TEST_COMPONENT_LABEL_1)).toBeInTheDocument();
      expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).not.toBeInTheDocument();

      rerender(<Application type="react" name={APP_NAME_2} />);

      expect(screen.queryByLabelText(TEST_COMPONENT_LABEL_1)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).toBeVisible();
      expect(screen.queryByLabelText(TEST_COMPONENT_LABEL_2)).not.toBeInTheDocument();
      expect(await screen.findByLabelText(TEST_COMPONENT_LABEL_2)).toBeInTheDocument();
    });
  });
});
