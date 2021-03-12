import React from 'react';
import userEvent from '@testing-library/user-event';

import {
  BeforeRenderFn,
  findLoginInput,
  findPasswordInput,
  findSubmitButton,
  incorrectLogin,
  login,
  render,
  RenderResultShell,
  waitFor,
} from '../../testing';

import { AUTH_ERROR_KEY, authErrorMessage, AuthForm, AuthFormProps } from './AuthForm';

function renderComponent(props: AuthFormProps, beforeRender?: BeforeRenderFn): RenderResultShell {
  return render(<AuthForm {...props} />, { beforeRender });
}

const onLogin = jest.fn(() => Promise.resolve(''));

describe('AuthForm', () => {
  beforeEach(() => {
    onLogin.mockClear();
  });

  test('рендерится без ошибок', () => {
    expect(renderComponent).not.toThrow();
  });

  test('если ввести корректные данные и засабмитить форму, то вызовется onLogin', () => {
    renderComponent({ onLogin });

    login();

    expect(onLogin).toBeCalledTimes(1);
  });

  test('если ввести некорректные данные и засабмитить форму, то onLogin не вызовется', () => {
    renderComponent({ onLogin });

    incorrectLogin();

    expect(onLogin).toBeCalledTimes(0);
  });

  test('если ввести некорректные данные и засабмитить форму, то сработает ошибка валидации', () => {
    renderComponent({ onLogin });

    incorrectLogin();

    // Особенности верстки Consta
    expect(findLoginInput().parentElement).toHaveClass('TextField_state_alert');
  });

  test('если не ввести данные и засабмитить форму, то сработает ошибка валидации', () => {
    renderComponent({ onLogin });

    userEvent.click(findSubmitButton());

    expect(findLoginInput().parentElement).toHaveClass('TextField_state_alert');
    expect(findPasswordInput().parentElement).toHaveClass('TextField_state_alert');
  });

  test('если засабмитить форму, то в кнопке рендерится лоадер', () => {
    renderComponent({ onLogin });

    login();

    const submitButton = findSubmitButton();

    expect(submitButton).toHaveClass('Button_loading');
  });

  test('обрабатывает ошибку авторизации', async () => {
    const onLoginError = jest.fn().mockRejectedValueOnce({ code: 'AUTH_ERROR' });

    const { shell } = renderComponent({ onLogin: onLoginError });

    login();

    await waitFor(() => {
      expect(shell.notifications.getAll()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'auth-error-alert', body: authErrorMessage }),
        ]),
      );
    });
  });

  test('если код ошибки не AUTH_ERROR, то в нотификации отобразится сообщение с сервера', async () => {
    const body = 'Ошибка валидации';
    const onLoginError = jest
      .fn()
      .mockRejectedValueOnce({ code: 'VALIDATION_ERROR', message: body });

    const { shell } = renderComponent({ onLogin: onLoginError });

    login();

    await waitFor(() => {
      expect(shell.notifications.getAll()).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 'auth-error-alert', body })]),
      );
    });
  });

  test('удаляет нотификации перед запросом', async () => {
    const result = renderComponent({ onLogin }, ({ shell }) => {
      shell.notifications.add({ id: AUTH_ERROR_KEY, view: 'alert', body: 'Ошибка' });
      shell.notifications.add({ id: 'auth-error-alert', view: 'alert', body: 'Ошибка 2' });

      expect(shell.notifications.getAll()).toHaveLength(2);
    });

    login();

    await waitFor(() => {
      expect(result.shell.notifications.getAll()).toHaveLength(0);
    });
  });
});
