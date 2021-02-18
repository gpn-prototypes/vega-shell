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
  RenderResult,
  waitFor,
} from '../../testing';

import { AUTH_ERROR_KEY, authErrorMessage, AuthForm, AuthFormProps } from './AuthForm';

function renderComponent(props: AuthFormProps, beforeRender?: BeforeRenderFn): RenderResult {
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
          expect.objectContaining({ key: 'auth-error-alert', message: authErrorMessage }),
        ]),
      );
    });
  });

  test('если код ошибки не AUTH_ERROR, то в нотификации отобразится сообщение с сервера', async () => {
    const message = 'Ошибка валидации';
    const onLoginError = jest.fn().mockRejectedValueOnce({ code: 'VALIDATION_ERROR', message });

    const { shell } = renderComponent({ onLogin: onLoginError });

    login();

    await waitFor(() => {
      expect(shell.notifications.getAll()).toEqual(
        expect.arrayContaining([expect.objectContaining({ key: 'auth-error-alert', message })]),
      );
    });
  });

  test('удаляет нотификации перед запросом', async () => {
    const result = renderComponent({ onLogin }, ({ shell }) => {
      shell.notifications.add({ key: AUTH_ERROR_KEY, status: 'alert' });
      shell.notifications.add({ key: 'auth-error-alert', status: 'alert' });

      expect(shell.notifications.getAll()).toHaveLength(2);
    });

    login();

    await waitFor(() => {
      expect(result.shell.notifications.getAll()).toHaveLength(0);
    });
  });
});
