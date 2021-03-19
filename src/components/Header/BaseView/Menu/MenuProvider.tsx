import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type MenuAPI = {
  isOpen: boolean;
  toggle: VoidFunction;
  close: VoidFunction;
};

const MenuContext = createContext<MenuAPI | null>(null);

export const MenuProvider: React.FC = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((s) => !s);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      toggle,
      close,
    }),
    [isOpen, close, toggle],
  );

  return <MenuContext.Provider value={value}>{props.children}</MenuContext.Provider>;
};

export const useMenu = (): MenuAPI => {
  const ctx = useContext(MenuContext);

  // istanbul ignore if
  if (ctx === null) {
    throw new Error('useMenu called outside from MenuProvider');
  }

  return ctx;
};
