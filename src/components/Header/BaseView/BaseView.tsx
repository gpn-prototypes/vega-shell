import React from 'react';
import { block } from 'bem-cn';

import { Menu } from './Menu';

interface Props {
  title: React.FC<{ className: string }>;
  nav?: React.FC<{ className: string }>;
}

const b = block('VegaHeader');

export const BaseView: React.FC<Props> = (props) => {
  const { title: Title, nav: Nav } = props;
  return (
    <header className={b.mix('header').toString()} data-testid="Header">
      <Menu className={b('Menu').toString()} />
      <Title className={b('Title').toString()} />
      {Nav && (
        <>
          <div className={b('Delimiter').toString()} />
          <Nav className={b('Nav').toString()} />
        </>
      )}
    </header>
  );
};
