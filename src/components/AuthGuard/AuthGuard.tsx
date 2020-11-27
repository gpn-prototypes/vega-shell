import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useOnChange, usePreviousRef } from '@gpn-prototypes/vega-ui';

import { AUTH_PAGE, MAIN_PAGE } from '../../utils/constants';

type AuthGuardProps = {
  onRouteChanged: () => void;
  isLoggedIn: boolean;
};

export const AuthGuard = (props: AuthGuardProps): React.ReactElement | null => {
  const { onRouteChanged, isLoggedIn } = props;

  const location = useLocation();

  const isAuthPage = location.pathname.includes(AUTH_PAGE);

  const previousPathname = usePreviousRef(location.pathname).current;

  const isEqualPathnames = previousPathname !== null && previousPathname === location.pathname;

  useOnChange(location.pathname, () => {
    if (!isEqualPathnames) {
      onRouteChanged();
    }
  });

  if ((isAuthPage || location.pathname === '/') && isLoggedIn) {
    return <Redirect to={MAIN_PAGE} />;
  }

  if (!isAuthPage && !isLoggedIn) {
    return <Redirect to={AUTH_PAGE} />;
  }

  return null;
};
