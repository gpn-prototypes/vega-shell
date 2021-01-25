import React from 'react';

import { cnBaseHeader } from '../cn-base-header';

import { useBaseHeaderMenuContext } from './BaseHeaderMenuContext';

type ItemRenderProps = {
  closeMenu?: (e: React.SyntheticEvent) => void;
  className: string;
};

type BaseHeaderMenuItemProps = {
  children: (props: ItemRenderProps) => React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export const BaseHeaderMenuItem: React.FC<BaseHeaderMenuItemProps> = (props) => {
  const { children, className, disabled } = props;

  const { closeMenu } = useBaseHeaderMenuContext();

  const content =
    typeof children === 'function'
      ? children({
          closeMenu,
          className: cnBaseHeader('MenuLink').toString(),
        })
      : children;

  return (
    <li
      className={cnBaseHeader('MenuItem', { disabled }).mix(className).toString()}
      role="menuitem"
    >
      {content}
    </li>
  );
};
