import React from 'react';
import { useLocation } from 'react-router-dom';

import { cn } from './cn-menu';
import { CurrentUserInfo } from './CurrentUserInfo';
import { MenuDelimiter } from './MenuDelimiter';
import { MenuDropdown } from './MenuDropdown';
import { MenuItem } from './MenuItem';
import { MenuProvider } from './MenuProvider';

import './Menu.css';

interface Props {
  className: string;
}

export const testId = {
  logout: 'Header:button:logout',
  menuItemProject: 'Header:link:project',
  menuItemTraining: 'Header:link:training',
  menuItemHelp: 'Header:link:help',
};

const items = [
  { name: 'Проекты', url: '/projects', testId: testId.menuItemProject },
  { name: 'Обучение', disabled: true, testId: testId.menuItemTraining },
  { name: 'Помощь', disabled: true, testId: testId.menuItemHelp },
];

export const Menu: React.FC<Props> = (props) => {
  const { className } = props;
  const location = useLocation();

  return (
    <MenuProvider>
      <div className={cn.mix(className)}>
        <MenuDropdown>
          <CurrentUserInfo />
          <MenuDelimiter />
          {items.map((item) => {
            if (item.url === location.pathname) {
              return null;
            }

            return (
              <MenuItem
                key={item.name}
                url={item.url}
                disabled={item.disabled}
                data-testid={item.testId}
              >
                {item.name}
              </MenuItem>
            );
          })}
          <MenuDelimiter />
          <MenuItem url="/logout" data-testid={testId.logout}>
            Выйти
          </MenuItem>
        </MenuDropdown>
      </div>
    </MenuProvider>
  );
};
