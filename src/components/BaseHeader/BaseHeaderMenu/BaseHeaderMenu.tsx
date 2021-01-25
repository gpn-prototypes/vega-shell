import React, { useState } from 'react';
import {
  Button,
  Dropdown,
  IconHamburger,
  Text,
  useOnChange,
  usePreviousRef,
} from '@gpn-prototypes/vega-ui';

import { cnBaseHeader } from '../cn-base-header';

import { BaseHeaderMenuContext } from './BaseHeaderMenuContext';
import { BaseHeaderMenuDelimiter } from './BaseHeaderMenuDelimiter';
import { BaseHeaderMenuItem } from './BaseHeaderMenuItem';

interface BaseHeaderMenuProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  dropdownClassName?: string;
  pathname?: string;
}

const testId = {
  trigger: 'BaseHeader:menu:trigger',
  title: 'BaseHeader:menu:title',
} as const;

type BaseHeaderMenuType = React.FC<BaseHeaderMenuProps> & {
  Delimiter: typeof BaseHeaderMenuDelimiter;
  Item: typeof BaseHeaderMenuItem;
  testId: typeof testId;
};

export const BaseHeaderMenu: BaseHeaderMenuType = (props) => {
  const { title, children, className, dropdownClassName, pathname } = props;
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseMenu = (): void => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const previousPathname = usePreviousRef(pathname).current;

  useOnChange(pathname, () => {
    if (previousPathname !== null && pathname !== previousPathname) {
      handleCloseMenu();
    }
  });

  return (
    <BaseHeaderMenuContext.Provider value={{ closeMenu: handleCloseMenu }}>
      <div className={cnBaseHeader('MenuWrap').mix(className)} role="menubar">
        <Dropdown
          isOpen={isOpen}
          aria-expanded={isOpen}
          aria-hidden={!isOpen}
          aria-haspopup="true"
          aria-labelledby="BaseHeaderMenuTrigger"
          onToggle={(nextState): void => {
            setIsOpen(nextState);
          }}
          onClickOutside={handleCloseMenu}
          placement="bottom-start"
        >
          <Dropdown.Trigger>
            {({ toggle, props: triggerProps }): React.ReactNode => (
              <div className={cnBaseHeader('MenuTrigger')} {...triggerProps}>
                <Button
                  id="BaseHeaderMenuTrigger"
                  size="m"
                  view="clear"
                  type="button"
                  onlyIcon
                  onClick={toggle}
                  iconLeft={IconHamburger}
                  form="brick"
                  data-testid={testId.trigger}
                />
              </div>
            )}
          </Dropdown.Trigger>
          <Dropdown.Menu>
            {({ props: menuProps }): React.ReactNode => (
              <div className={cnBaseHeader('Dropdown').mix(dropdownClassName)} {...menuProps}>
                <ul className={cnBaseHeader('Menu')} role="menu">
                  {children}
                </ul>
              </div>
            )}
          </Dropdown.Menu>
        </Dropdown>
        <Text
          size="s"
          aria-label="Триггер для выпадающего меню шапки"
          className={cnBaseHeader('MenuTriggerText').toString()}
          data-testid={testId.title}
        >
          {title}
        </Text>
      </div>
    </BaseHeaderMenuContext.Provider>
  );
};

BaseHeaderMenu.Delimiter = BaseHeaderMenuDelimiter;
BaseHeaderMenu.Item = BaseHeaderMenuItem;
BaseHeaderMenu.testId = testId;
