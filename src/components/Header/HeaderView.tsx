import React, { useMemo, useState } from 'react';
import { Link, matchPath } from 'react-router-dom';
import { Badge, Text, useMount } from '@gpn-prototypes/vega-ui';
import cn from 'bem-cn';

import { useShell } from '../../app';
import { BaseHeader } from '../BaseHeader';

import defaultAvatar from './default-avatar.svg';
import { NavLinkType } from './types';

export type HeaderViewProps = {
  isLoading?: boolean;
  projectName?: string | null;
  pathname: string;
  onChangeActive: (item: NavLinkType) => void;
};

const cnHeader = cn('Header');

const LS_USER_FIRST_NAME_KEY = 'user-first-name';
const LS_USER_LAST_NAME_KEY = 'user-last-name';

const testId = {
  userInfo: 'Header:block:userInfo',
  username: 'Header:text:username',
  logout: 'Header:button:logout',
  menuItemProject: 'Header:link:project',
  menuItemTraining: 'Header:link:training',
  menuItemHelp: 'Header:link:help',
  about: 'Header:nav:about',
  rb: 'Header:nav:rb',
  lc: 'Header:nav:lc',
  fem: 'Header:nav:fem',
};

export const HeaderView = (props: HeaderViewProps): React.ReactElement => {
  const { isLoading, projectName, pathname, onChangeActive } = props;
  const { identity } = useShell();

  const [userName, setUserName] = useState<string | null>(null);

  useMount(() => {
    const userFirstName = localStorage.getItem(LS_USER_FIRST_NAME_KEY);
    const userLastName = localStorage.getItem(LS_USER_LAST_NAME_KEY);

    if (userFirstName && userLastName) {
      setUserName(`${userFirstName} ${userLastName}`);
    }
  });

  const renderAvatar = () => {
    if (userName) {
      return (
        <>
          <div data-testid={testId.userInfo} className={cnHeader('Avatar')}>
            <img src={defaultAvatar} alt="avatar" className={cnHeader('Avatar-img')} />
            <Text
              data-testid={testId.username}
              size="xs"
              className={cnHeader('Avatar-name').toString()}
            >
              {userName}
            </Text>
          </div>
          <BaseHeader.Menu.Delimiter />
        </>
      );
    }

    return null;
  };

  const navItems: NavLinkType[] = [
    { name: 'О проекте', url: '/projects/show/:projectId', testId: testId.about },
    { name: 'Ресурсная база', url: '/projects/show/:projectId/rb', testId: testId.rb },
    { name: 'Логика проекта', url: '/projects/show/:projectId/lc', testId: testId.lc },
    {
      name: 'Экономика проекта',
      url: '/projects/show/:projectId/fem',
      routes: ['/projects/show/:projectId/fem/OPEX', '/projects/show/:projectId/fem/CAPEX'],
      testId: testId.fem,
    },
  ];

  const isActiveNavItem = useMemo(() => {
    return navItems.find((item) => {
      const match = (url?: string) =>
        matchPath(pathname, {
          path: url,
          exact: true,
        });

      return match(item.url) !== null || item.routes?.some((route) => match(route) !== null);
    });
  }, [pathname, navItems]);

  const menuItems = [
    { name: 'Проекты', url: '/projects', testId: testId.menuItemProject },
    { name: 'Обучение', disabled: true, testId: testId.menuItemTraining },
    { name: 'Помощь', disabled: true, testId: testId.menuItemHelp },
  ];

  const [isCreateProjectPage, isProjectsPage] = ['/projects/create', '/projects'].map(
    (path) => matchPath(pathname, { path, exact: true }) !== null,
  );

  const getTitle = (): string | null | undefined => {
    if (isCreateProjectPage) {
      return 'Создание проекта';
    }

    if (isProjectsPage) {
      return 'Проекты';
    }

    return projectName;
  };

  const shouldRenderNavItems = !isCreateProjectPage && !isProjectsPage;

  const menuItemsRender = menuItems.map((item) => {
    if (isProjectsPage && item.url === '/projects') {
      return null;
    }

    return (
      <BaseHeader.Menu.Item key={item.name} disabled={item.disabled}>
        {(menuItemProps): React.ReactNode => {
          const itemText = (
            <Text size="s" view={item.disabled ? 'ghost' : 'primary'}>
              {item.name}
            </Text>
          );

          if (!item.disabled && item.url !== undefined) {
            return (
              <Link
                onClick={menuItemProps.closeMenu}
                className={menuItemProps.className}
                to={item.url}
                data-testid={item.testId}
              >
                {itemText}
              </Link>
            );
          }

          return (
            <div
              className={cnHeader('MenuItem', { disabled: true }).mix(menuItemProps.className)}
              data-testid={item.testId}
            >
              {itemText}
              <Badge label="Скоро" view="filled" status="system" size="s" form="round" />
            </div>
          );
        }}
      </BaseHeader.Menu.Item>
    );
  });

  const cnHeaderMenu = cnHeader('Menu', { disabled: !shouldRenderNavItems });

  const menuTitle = getTitle() ?? '';

  const renderMenu = isLoading ? null : (
    <BaseHeader.Menu
      className={cnHeaderMenu}
      dropdownClassName={cnHeader('Dropdown')}
      title={menuTitle}
      pathname={pathname}
    >
      {renderAvatar()}
      <div className={cnHeader('MenuItems')}>{menuItemsRender}</div>
      <BaseHeader.Menu.Delimiter />
      <BaseHeader.Menu.Item>
        {(menuItemProps): React.ReactNode => (
          <a
            onClick={(e) => {
              e.preventDefault();
              if (menuItemProps.closeMenu) {
                identity.logout();
                menuItemProps.closeMenu(e);
              }
            }}
            className={menuItemProps.className}
            href="/login"
            data-testid={testId.logout}
          >
            <Text size="s">Выйти</Text>
          </a>
        )}
      </BaseHeader.Menu.Item>
    </BaseHeader.Menu>
  );

  return (
    <BaseHeader className="header">
      {renderMenu}
      {shouldRenderNavItems && (
        <BaseHeader.Nav
          activeItem={isActiveNavItem}
          navItems={navItems}
          onChangeItem={onChangeActive}
        />
      )}
    </BaseHeader>
  );
};
