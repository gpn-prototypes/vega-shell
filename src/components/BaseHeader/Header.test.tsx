import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, RenderResult } from '@testing-library/react';

import { BaseHeader } from './BaseHeader';

const navItems = [
  {
    name: 'О проекте',
    isActive: true,
    testId: 'about',
  },
  {
    name: 'Ресурсная база',
    testId: 'rb',
  },
  {
    name: 'Геологические риски',
    testId: 'gr',
  },
];

const menuItems = [
  { name: 'Проекты', url: '', testId: 'projects' },
  { name: 'Обучение', url: '', testId: 'training' },
  { name: 'Помощь', url: '', testId: 'help' },
];

const renderComponent = (): RenderResult =>
  render(
    <Router>
      <BaseHeader>
        <BaseHeader.Menu title="Очень-очень длинное название прое...">
          {menuItems.map((menuItem) => (
            <BaseHeader.Menu.Item key={menuItem.name}>
              {(menuItemProps): React.ReactNode => (
                <a {...menuItemProps} href={menuItem.url}>
                  {menuItem.name}
                </a>
              )}
            </BaseHeader.Menu.Item>
          ))}
          <BaseHeader.Menu.Delimiter />
          <BaseHeader.Menu.Item>
            {(menuItemProps): React.ReactNode => (
              <a {...menuItemProps} href="/">
                Выйти
              </a>
            )}
          </BaseHeader.Menu.Item>
        </BaseHeader.Menu>
        <BaseHeader.Nav navItems={navItems} activeItem={navItems[0]} onChangeItem={jest.fn()} />
      </BaseHeader>
    </Router>,
  );

describe('BaseHeader', () => {
  test('рендерится без ошибок', () => {
    expect(renderComponent).not.toThrow();
  });

  test('рендерится навигация', () => {
    const header = renderComponent();

    expect(header.container.querySelector('.VegaBaseHeader__MenuWrap')).toBeInTheDocument();
    expect(header.getByText('О проекте')).toBeInTheDocument();
  });
});
