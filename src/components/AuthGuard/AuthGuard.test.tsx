import React from 'react';
import { MemoryRouter, Route, useLocation } from 'react-router';
import { render, RenderResult } from '@testing-library/react';

import { AUTH_PAGE, MAIN_PAGE } from '../../utils/constants';

import { AuthGuard } from './AuthGuard';

let testLocation: ReturnType<typeof useLocation> | null = null;

interface Props extends React.ComponentProps<typeof AuthGuard> {
  initialEntries?: React.ComponentProps<typeof MemoryRouter>['initialEntries'];
}

afterEach(() => {
  testLocation = null;
});

const renderComponent = (props: Omit<Props, 'onRouteChanged'>): RenderResult => {
  return render(
    <MemoryRouter initialEntries={props.initialEntries}>
      <Route
        path="*"
        render={({ location }) => {
          testLocation = location;
          return null;
        }}
      />
      <AuthGuard isLoggedIn={props.isLoggedIn} onRouteChanged={jest.fn()} />
    </MemoryRouter>,
  );
};

describe('Authuard', () => {
  test('редиректит на страницу логина, если пользователь не авторизован', () => {
    renderComponent({
      isLoggedIn: false,
      initialEntries: [MAIN_PAGE],
    });

    expect(testLocation?.pathname).toBe(AUTH_PAGE);
  });

  test('не редиректит со страницы, если пользователь авторизован', () => {
    renderComponent({
      isLoggedIn: true,
      initialEntries: [MAIN_PAGE],
    });

    expect(testLocation?.pathname).toBe(MAIN_PAGE);
  });

  test('редиректит на главную страницу при попытке зайти на корневой роут', () => {
    renderComponent({
      isLoggedIn: true,
      initialEntries: ['/'],
    });

    expect(testLocation?.pathname).toBe(MAIN_PAGE);
  });

  test('редиректит со страницы логина на главную, если пользователь авторизован', () => {
    renderComponent({
      isLoggedIn: true,
      initialEntries: [AUTH_PAGE],
    });

    expect(testLocation?.pathname).toBe(MAIN_PAGE);
  });
});
