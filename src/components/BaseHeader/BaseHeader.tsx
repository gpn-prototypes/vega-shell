import React from 'react';

import { BaseHeaderMenu } from './BaseHeaderMenu';
import { BaseHeaderNav } from './BaseHeaderNav';
import { cnBaseHeader } from './cn-base-header';

import './BaseHeader.css';

type BaseHeaderProps = {
  className?: string;
  children: React.ReactNode;
};

const testId = {
  wrapper: 'Header',
};

type BaseHeaderType = React.FC<BaseHeaderProps> & {
  Menu: typeof BaseHeaderMenu;
  Nav: typeof BaseHeaderNav;
  testId: Record<string, string>;
};

export const BaseHeader: BaseHeaderType = ({ className, children }) => {
  const cn = cnBaseHeader.mix(className);

  return (
    <header className={cn} data-testid={testId.wrapper}>
      {children}
    </header>
  );
};

BaseHeader.Menu = BaseHeaderMenu;
BaseHeader.Nav = BaseHeaderNav;
BaseHeader.testId = testId;
