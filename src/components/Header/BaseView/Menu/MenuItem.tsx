import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Text } from '@gpn-prototypes/vega-ui';

import { cn } from './cn-menu';
import { useMenu } from './MenuProvider';

interface Props extends React.HTMLAttributes<HTMLAnchorElement | HTMLDivElement> {
  url?: string;
  disabled?: boolean;
}

export const MenuItem: React.FC<Props> = (props) => {
  const { children, url, disabled = false, ...rest } = props;

  const menu = useMenu();

  const text = (
    <Text size="s" view={disabled ? 'ghost' : 'primary'}>
      {children}
    </Text>
  );

  const baseProps = {
    className: cn('Item', { disabled }).mix(rest.className),
    role: 'menuitem',
  };

  if (typeof url === 'string' && !disabled) {
    return (
      <Link {...rest} {...baseProps} to={url} onClick={menu.close}>
        {text}
      </Link>
    );
  }
  return (
    <div {...rest} {...baseProps}>
      {text}
      <Badge label="Скоро" view="filled" status="system" size="s" form="round" />
    </div>
  );
};
