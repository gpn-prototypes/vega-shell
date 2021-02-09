import React from 'react';
import { act, screen } from '@testing-library/react';

import { getSystemJSMock, render } from '../../testing';
import { SHELL_LOADER_LABEL } from '../Loader';

import { Application } from './Application';

const COMPONENT_ERROR_NAME = 'component-error';

beforeEach(() => {
  global.System = getSystemJSMock(() => <div>test</div>);
});

afterEach(() => {
  delete global.System;
});
/*
  Замокал, потому что в парселе асинхронная обработка ошибок и было сложно написать тесты на это.
  Вынес в отдельный файл, так как jest не дает замокать только один тест
*/
jest.mock('single-spa-react/lib/esm/parcel', () => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const { useMount } = require('@gpn-prototypes/vega-ui');

  return (props: { error: boolean; handleError: VoidFunction }) => {
    useMount(() => {
      if (props.error) {
        props.handleError();
      }
    });

    return null;
  };
});

const componentProps = {
  error: true,
};

describe('Application | обработка ошибок', () => {
  test('корректно обрабатывает ошибку', async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const spy = jest.spyOn(global.System!, 'delete');

    await act(async () => {
      render(<Application name={COMPONENT_ERROR_NAME} {...componentProps} />);
    });

    expect(spy).toBeCalledWith(COMPONENT_ERROR_NAME);
  });

  test('при ошибке пропадает лоадер', async () => {
    await act(async () => {
      render(<Application name={COMPONENT_ERROR_NAME} {...componentProps} />);
    });

    expect(screen.queryByLabelText(SHELL_LOADER_LABEL)).not.toBeInTheDocument();
  });

  test('при ошибке добавляется нотификация', () => {
    const { shell } = render(<Application name={COMPONENT_ERROR_NAME} {...componentProps} />);

    expect(shell.notifications.getAll()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: `Ошибка загрузки модуля «${COMPONENT_ERROR_NAME}»` }),
      ]),
    );
  });
});
