import React, { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Tabs } from '@gpn-prototypes/vega-ui';
import { block } from 'bem-cn';

export const testId = {
  rb: 'Header:nav:rb',
  lc: 'Header:nav:lc',
  fem: 'Header:nav:fem',
  about: 'Header:nav:about',
  nav: 'Header:nav',
};

type NavLinkType = {
  name: string;
  url: string;
  isActive?: boolean;
  testId: string;
};

interface Props {
  vid: string;
  className: string;
}

const tabCn = block('TabsTab');

export const ProjectNav: React.FC<Props> = (props) => {
  const history = useHistory();
  const location = useLocation();

  const { vid } = props;

  const navItems: NavLinkType[] = useMemo(
    () => [
      { name: 'О проекте', url: `/projects/show/${vid}`, testId: testId.about },
      { name: 'Ресурсная база', url: `/projects/show/${vid}/rb`, testId: testId.rb },
      { name: 'Логгика проекта', url: `/projects/show/${vid}/lc`, testId: testId.lc },
      {
        name: 'Экономика проекта',
        url: `/projects/show/${vid}/fem`,
        testId: testId.fem,
      },
    ],
    [vid],
  );

  const activeItem = navItems.find((item) => item.url === location.pathname);

  return (
    <nav aria-label="Разделы проекта" className={props.className} data-testid={testId.nav}>
      <Tabs<NavLinkType>
        view="clear"
        size="s"
        items={navItems}
        value={activeItem}
        getLabel={(item): string => item.name}
        onChange={({ value }): void => history.push(value.url)}
        renderItem={({ key, ref, onChange, label, item, className }) => (
          <button
            role="tab"
            key={key}
            ref={ref}
            type="button"
            onClick={onChange}
            className={tabCn({ checked: item.name === activeItem?.name })
              .mix(className)
              .toString()}
            data-testid={item.testId}
          >
            {label}
          </button>
        )}
      />
    </nav>
  );
};
