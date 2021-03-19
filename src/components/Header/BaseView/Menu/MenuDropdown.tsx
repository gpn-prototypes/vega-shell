import React from 'react';
import { Button, Dropdown, IconHamburger } from '@gpn-prototypes/vega-ui';

import { cn } from './cn-menu';
import { useMenu } from './MenuProvider';

const testId = {
  trigger: 'Header:menu:trigger',
};

export const MenuDropdown: React.FC = (props) => {
  const menu = useMenu();

  return (
    <Dropdown
      isOpen={menu.isOpen}
      aria-expanded={menu.isOpen}
      aria-hidden={!menu.isOpen}
      aria-haspopup="true"
      aria-labelledby="HeaderMenuTrigger"
      onToggle={menu.toggle}
      onClickOutside={menu.close}
      placement="bottom-start"
    >
      <Dropdown.Trigger>
        {({ toggle, props: triggerProps }): React.ReactNode => (
          <div className={cn('Trigger')} {...triggerProps}>
            <Button
              id="HeaderMenuTrigger"
              size="m"
              view="clear"
              type="button"
              onlyIcon
              onClick={toggle}
              iconLeft={IconHamburger}
              form="brick"
              aria-label="Меню"
              data-testid={testId.trigger}
            />
          </div>
        )}
      </Dropdown.Trigger>
      <Dropdown.Menu>
        {({ props: menuProps }): React.ReactNode => (
          <div className={cn('Dropdown')} {...menuProps}>
            <div className={cn('List')} role="menu">
              {props.children}
            </div>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
