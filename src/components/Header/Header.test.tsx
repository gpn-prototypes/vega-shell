import React from 'react';
import userEvent from '@testing-library/user-event';
import faker from 'faker';
import { v4 as uuid } from 'uuid';

import {
  act,
  Options,
  render,
  RenderResultShell,
  renderWithServerError,
  screen,
  waitRequests,
} from '../../testing';

import { Header } from './Header';

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

describe('Header', () => {
  describe('Проектный хедер', () => {
    function renderComponent(options: Options = {}): RenderResultShell {
      return render(<Header />, {
        shell: { customResolvers: resolver },
        isAuth: true,
        route: `/projects/show/${vid}`,
        ...options,
      });
    }

    test('отображается название проекта', async () => {
      const { shell } = renderComponent();

      await act(async () => {
        const checkout = shell.currentProject.checkout(vid);
        expect(await screen.findByLabelText('Загрузка имени проекта')).toBeInTheDocument();
        await checkout;
      });

      expect(screen.getByText(name)).toBeInTheDocument();
    });

    test('отображаются разделы проекта', async () => {
      const { shell } = renderComponent();

      await act(async () => {
        await shell.currentProject.checkout(vid);
      });

      expect(screen.getByLabelText('Разделы проекта')).toBeInTheDocument();
      expect(screen.getByText('О проекте')).toBeInTheDocument();
      expect(screen.getByText('Ресурсная база')).toBeInTheDocument();
      expect(screen.getByText('Логика проекта')).toBeInTheDocument();
      expect(screen.getByText('Экономика проекта')).toBeInTheDocument();
    });

    test('управляет переходом по вкладкам', async () => {
      const { shell } = renderComponent();

      await act(async () => {
        await shell.currentProject.checkout(vid);
      });

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
    function renderComponent(options: Options = {}): RenderResultShell {
      return render(<Header />, {
        shell: { customResolvers: resolver },
        isAuth: true,
        route: '/projects',
        ...options,
      });
    }

    async function openMenu() {
      const menuButton = screen.getByRole('button', { name: 'Меню' });

      userEvent.click(menuButton);

      await act(async () => {
        // без этого появлятеся ворнинг на act
      });
    }

    test('не отображается при наличии ошибки', async () => {
      renderWithServerError(<Header />, { code: 500, message: 'server-error' });

      await waitRequests();

      expect(screen.queryByRole('header')).not.toBeInTheDocument();
    });

    test('меню закрывается при клике вне меню', async () => {
      renderComponent();

      await openMenu();

      expect(screen.queryByRole('menu')).toBeVisible();

      userEvent.click(document.body);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    test('отображает имя и фамилию пользователя', async () => {
      renderComponent({ user: { firstName: 'First', lastName: 'Last' } });

      await waitRequests();
      await openMenu();

      expect(screen.queryByText('First Last')).toBeInTheDocument();
    });

    test('выход из системы', async () => {
      const { shell } = renderComponent();

      await waitRequests();

      await openMenu();

      const logoutButton = screen.getByText('Выйти');

      userEvent.click(logoutButton);

      expect(shell.history.location.pathname).toBe('/logout');
    });

    test('на странице списка проектов в заголовке отображается "Проекты"', () => {
      renderComponent({ route: '/projects' });

      expect(screen.getByRole('heading')).toHaveTextContent('Проекты');
    });

    test('на странице создания проекта в заголовке отображается "Создание проекта"', () => {
      renderComponent({ route: '/projects/create' });

      expect(screen.getByRole('heading')).toHaveTextContent('Создание проекта');
    });
  });
});
