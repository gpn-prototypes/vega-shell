import React from 'react';

import { render, RenderResult, screen } from '../../testing';

import { HeaderView, HeaderViewProps } from './HeaderView';

const defaultProps: HeaderViewProps = {
  onChangeActive: jest.fn(),
  pathname: '/projects',
};

const renderComponent = (props: Partial<HeaderViewProps> = {}): RenderResult => {
  const headerViewProps = { ...defaultProps, ...props };
  return render(<HeaderView {...headerViewProps} />);
};

function findTrigger(): HTMLElement {
  return screen.getByLabelText('Триггер для выпадающего меню шапки');
}

function findTabs(): HTMLElement | null {
  return screen.queryByLabelText('Навигация шапки');
}

function findMenu(): HTMLElement | null {
  return screen.queryByRole('menubar');
}

describe('HeaderView', () => {
  describe('Title', () => {
    test('на странице /projects в заголовке отображается "Проекты"', () => {
      renderComponent();

      const trigger = findTrigger();

      expect(trigger).toHaveTextContent('Проекты');
    });

    test('на странице /projects/create в заголовке отображается "Создание проекта"', () => {
      renderComponent({ pathname: '/projects/create' });

      const trigger = findTrigger();

      expect(trigger).toHaveTextContent('Создание проекта');
    });

    test('при передаче projectName на странице редактирования проекта в заголовке отображается projectName', () => {
      renderComponent({ pathname: '/projects/show/:projectId', projectName: 'test-name' });

      const trigger = findTrigger();

      expect(trigger).toHaveTextContent('test-name');
    });
  });

  describe('Tabs', () => {
    test('табы отображаются на странице редактирования проекта', () => {
      renderComponent({ pathname: '/projects/show/:projectId', projectName: 'test-name' });

      expect(findTabs()).toBeInTheDocument();
    });

    test('выставляется активный таб', () => {
      renderComponent({ pathname: '/projects/show/:projectId/rb' });

      const tabsList = screen.queryAllByRole('tab');

      expect(tabsList[1]).toHaveClass('TabsTab_checked');
    });
  });

  describe('Menu', () => {
    test('рендерит меню, если isLoading равен false', () => {
      renderComponent({ isLoading: false });

      expect(findMenu()).toBeInTheDocument();
    });

    test('не рендерит меню, если isLoading равен true', () => {
      renderComponent({ isLoading: true });

      expect(findMenu()).not.toBeInTheDocument();
    });
  });
});
