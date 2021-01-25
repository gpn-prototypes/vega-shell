import React from 'react';
import { fireEvent, render, RenderResult } from '@testing-library/react';

import { BaseHeaderNav } from './BaseHeaderNav';

type BaseHeaderNavTestProps = React.ComponentProps<typeof BaseHeaderNav>;

const renderComponent = (props: Omit<BaseHeaderNavTestProps, 'children'>): RenderResult =>
  render(<BaseHeaderNav {...props} />);

describe('BaseHeader', () => {
  const navItems = [
    {
      name: 'Пайплайн',
      isActive: true,
      testId: 'main',
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

  test('рендерится без ошибок', async () => {
    const nav = renderComponent({ navItems, onChangeItem: jest.fn() });
    const tabs = await nav.findAllByRole('tab');
    expect(tabs.length).toBe(3);
  });

  test('вызывается onChangeItem', () => {
    const onChangeItem = jest.fn();
    const nav = renderComponent({ navItems, onChangeItem });

    fireEvent.click(nav.getByText('Геологические риски'));

    expect(onChangeItem).toBeCalled();
  });
});
