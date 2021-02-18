import React from 'react';
import { act } from 'react-dom/test-utils';
import { BrowserRouter as Router } from 'react-router-dom';
import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react';

import { BaseHeaderMenu } from './BaseHeaderMenu';

type BaseHeaderNavTestProps = React.ComponentProps<typeof BaseHeaderMenu>;

const menuItems = [
  { name: 'Пункт 1', url: 'url1', testId: 'item 1' },
  { name: 'Пункт 2', url: 'url2', onClick: jest.fn(), testId: 'item 2' },
];

const defaultProps = {
  title: 'Проект',
};

const renderComponent = (
  props: Omit<BaseHeaderNavTestProps, 'children'> = defaultProps,
): RenderResult =>
  render(
    <Router>
      <BaseHeaderMenu {...props}>
        {menuItems.map((mi) => (
          <BaseHeaderMenu.Item key={mi.name}>
            {(itemProps): React.ReactNode => (
              <a onClick={itemProps.closeMenu} href={mi.url}>
                {mi.name}
              </a>
            )}
          </BaseHeaderMenu.Item>
        ))}
      </BaseHeaderMenu>
    </Router>,
  );

const getMenuList = (): HTMLElement => screen.getByRole('menu');

function openDropdown(menu: RenderResult): void {
  const menuTrigger = menu.getByLabelText('Меню');

  act(() => {
    if (menuTrigger !== null) {
      fireEvent.click(menuTrigger);
    }
  });
}

describe('BaseHeaderMenu', () => {
  test('рендерится без ошибок', () => {
    expect(renderComponent).not.toThrow();
  });

  test('открывается меню', async () => {
    const menu = renderComponent();

    openDropdown(menu);
    await waitFor(() => {
      expect(getMenuList()).toBeInTheDocument();
    });
  });

  test('закрывается меню при клике вне меню', async () => {
    const menu = renderComponent({ ...defaultProps });
    openDropdown(menu);

    await waitFor(() => {
      expect(getMenuList()).toBeInTheDocument();
    });

    fireEvent.click(menu.getByText('Проект'));

    await waitFor(() => {
      expect(menu.container.querySelector('[role="menu"]')).toBe(null);
    });
  });

  test('при смене pathname dropdown закрывается', async () => {
    const menu = renderComponent({ pathname: '/test', title: 'test' });

    openDropdown(menu);

    await waitFor(() => {
      expect(getMenuList()).toBeInTheDocument();
    });

    menu.rerender(
      <BaseHeaderMenu pathname="/new-test" title="test">
        <div>test</div>
      </BaseHeaderMenu>,
    );

    await waitFor(() => {
      expect(menu.container.querySelector('.VegaMenu')).not.toBeTruthy();
    });
  });
});
