import React from 'react';
import { MemoryRouter, Route, useLocation } from 'react-router';
import { render, RenderResult } from '@testing-library/react';

import { AUTH_PAGE } from '../../utils/constants';

import { AuthGuard } from './AuthGuard';

let testLocation: ReturnType<typeof useLocation> | null = null;

interface Props extends React.ComponentProps<typeof AuthGuard> {
  initialEntries?: React.ComponentProps<typeof MemoryRouter>['initialEntries'];
}

afterEach(() => {
  testLocation = null;
});

const renderComponent = (props: Props): RenderResult => {
  return render(
    <MemoryRouter initialEntries={props.initialEntries}>
      <Route
        path="*"
        render={({ location }) => {
          testLocation = location;
          return null;
        }}
      />
      <AuthGuard isLoggedIn={props.isLoggedIn} onRouteChanged={props.onRouteChanged} />
    </MemoryRouter>,
  );
};

describe('AppGuard', () => {
  test('редиректит на главную, если пользователь не авторизован', () => {
    renderComponent({
      isLoggedIn: false,
      onRouteChanged: jest.fn(),
      initialEntries: ['/projects'],
    });

    expect(testLocation?.pathname).toBe(AUTH_PAGE);
  });
});
