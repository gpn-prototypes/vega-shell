import React from 'react';

import { cn } from './cn-menu';

type Props = {
  // eslint-disable-next-line react/require-default-props
  className?: string;
};

export const MenuDelimiter = (props: Props): React.ReactElement => {
  return <div role="separator" className={cn('Delimiter').mix(props.className).toString()} />;
};
