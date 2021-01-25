import React from 'react';

import { cnBaseHeader } from '../cn-base-header';

type Props = {
  className?: string;
};

export const BaseHeaderMenuDelimiter = (props: Props): React.ReactElement => {
  return <li className={cnBaseHeader('MenuDelimiter').mix(props.className).toString()} />;
};
