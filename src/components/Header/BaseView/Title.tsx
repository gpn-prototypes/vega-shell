import React from 'react';
import { Text } from '@gpn-prototypes/vega-ui';

interface Props {
  className: string;
}

export const Title: React.FC<Props> = (props) => {
  return <Text {...props} data-testid="Header:title" role="heading" size="s" />;
};
