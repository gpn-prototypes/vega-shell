import React from 'react';
import { Tabs } from '@gpn-prototypes/vega-ui';
import cn from 'bem-cn';

import { cnBaseHeader } from '../cn-base-header';
import { NavItemType } from '../types';

export const cnTabsTab = cn('TabsTab');

type BaseHeaderNavProps = {
  navItems: NavItemType[];
  activeItem?: NavItemType;
  onChangeItem: (item: NavItemType) => void;
};

const testId = {
  nav: 'BaseHeader:Nav',
} as const;

type BaseHeaderNavType = React.FC<BaseHeaderNavProps> & {
  testId: typeof testId;
};

export const BaseHeaderNav: BaseHeaderNavType = (props) => {
  const { navItems, activeItem, onChangeItem } = props;

  const handleChangeItem = (item: NavItemType | null): void => {
    // istanbul ignore else
    if (item !== null) {
      onChangeItem(item);
    }
  };

  return (
    <nav aria-label="Навигация шапки" className={cnBaseHeader('Nav')} data-testid={testId.nav}>
      <Tabs<NavItemType>
        view="clear"
        size="s"
        items={navItems}
        value={activeItem}
        getLabel={(item): string => item.name}
        onChange={({ value }): void => handleChangeItem(value)}
        renderItem={({ key, ref, onChange, label, item, className }) => (
          <button
            role="tab"
            key={key}
            ref={ref}
            type="button"
            onClick={onChange}
            className={cnTabsTab({ checked: item.name === activeItem?.name })
              .mix(className)
              .toString()}
            data-testid={item.testId}
          >
            {label}
          </button>
        )}
      />
    </nav>
  );
};

BaseHeaderNav.testId = testId;
