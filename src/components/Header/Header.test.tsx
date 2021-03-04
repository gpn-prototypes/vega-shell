import React from 'react';
import userEvent from '@testing-library/user-event';
import faker from 'faker';
import { v4 as uuid } from 'uuid';

import {
  act,
  render,
  RenderResultShell,
  renderWithServerError,
  screen,
  waitRequests,
} from '../../testing';
import { BaseHeaderMenu } from '../BaseHeader/BaseHeaderMenu';

import { Header } from './Header';
import { HeaderView, LS_USER_FIRST_NAME_KEY, LS_USER_LAST_NAME_KEY } from './HeaderView';

const vid = uuid();

let name: string;

beforeEach(() => {
  name = faker.name.title();
});

const resolver = {
  ProjectOrError: () => {
    return {
      __typename: 'Project',
      name,
      vid,
    };
  },
};

type RenderOptions = {
  initialRoute?: string;
};

function renderComponent(options: RenderOptions = {}): RenderResultShell {
  return render(<Header />, {
    shell: { customResolvers: resolver },
    isAuth: true,
    route: options.initialRoute ?? `/projects/show/${vid}`,
  });
}

describe('Header', () => {
  test('рендерится без ошибок', async () => {
    await act(async () => {
      expect(renderComponent).not.toThrow();
    });
  });

  describe('Проектный хедер', () => {
    test('отображается название проекта', async () => {
      await act(async () => {
        renderComponent();
      });

      await waitRequests();

      expect(await screen.findByTestId(BaseHeaderMenu.testId.title)).toHaveTextContent(name);
    });

    test('не отображает название проекта при загрузке', async () => {
      renderComponent();

      expect(screen.queryByTestId(BaseHeaderMenu.testId.title)).not.toBeInTheDocument();

      await waitRequests();

      expect(screen.queryByTestId(BaseHeaderMenu.testId.title)).toBeInTheDocument();
    });

    test('управляет переходом по вкладкам', async () => {
      const { shell } = renderComponent();

      await waitRequests();

      const tabList = screen.getAllByRole('tab');

      userEvent.click(tabList[1]);

      expect(shell.history.location.pathname).toBe(`/projects/show/${vid}/rb`);

      const menuButton = screen.getByLabelText('Меню');

      userEvent.click(menuButton);

      const menuElement = await screen.findByText('Проекты');

      userEvent.click(menuElement);

      expect(shell.history.location.pathname).toBe('/projects');
    });
  });

  describe('Общий хедер', () => {
    test('не отображается при наличии ошибки', async () => {
      renderWithServerError(<Header />, { code: 500, message: 'server-error' });

      await waitRequests();

      expect(screen.queryByTestId(HeaderView.testId.root)).not.toBeInTheDocument();
    });

    test('отображает имя и фамилию пользователя', async () => {
      localStorage.setItem(LS_USER_LAST_NAME_KEY, 'Last');
      localStorage.setItem(LS_USER_FIRST_NAME_KEY, 'First');
      renderComponent();

      await waitRequests();

      const menuButton = screen.getByLabelText('Меню');

      userEvent.click(menuButton);

      expect(await screen.findByTestId(HeaderView.testId.username)).toHaveTextContent('First Last');

      localStorage.clear();
    });

    test('выход из системы', async () => {
      const { shell } = renderComponent();

      await waitRequests();

      const menuButton = screen.getByLabelText('Меню');

      userEvent.click(menuButton);

      const logoutButton = await screen.findByLabelText('Выйти');

      userEvent.click(logoutButton);

      expect(shell.history.location.pathname).toBe('/logout');
    });
  });
});
