import { createContext, useContext } from 'react';

type BaseHeaderMenuContextProps = {
  closeMenu?: (e: MouseEvent | TouchEvent | React.SyntheticEvent) => void;
};

export const BaseHeaderMenuContext = createContext<BaseHeaderMenuContextProps>({});

export const useBaseHeaderMenuContext = (): BaseHeaderMenuContextProps =>
  useContext(BaseHeaderMenuContext);
