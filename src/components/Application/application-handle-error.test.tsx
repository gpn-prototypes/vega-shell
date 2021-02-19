import React from 'react';
import { act, screen } from '@testing-library/react';

import { getSystemJSMock, render } from '../../testing';
import { SHELL_LOADER_LABEL } from '../Loader';

import { Application } from './Application';

const COMPONENT_ERROR_NAME = 'component-error';

beforeEach(() => {
  global.System = getSystemJSMock({
    [COMPONENT_ERROR_NAME]: () => <div>test</div>,
  });
});

afterEach(() => {
  delete global.System;
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
