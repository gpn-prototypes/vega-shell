import React from 'react';
import { fireEvent, render, RenderResult, screen } from '@testing-library/react';

import { AuthForm, AuthFormProps } from './AuthForm';

function renderComponent(props: AuthFormProps): RenderResult {
  return render(<AuthForm {...props} />);
}

const onLogin = jest.fn(() => Promise.resolve());

function findLoginInput(): HTMLElement {
  return screen.getByTestId(AuthForm.testID.loginInput);
}

function findPasswordInput(): HTMLElement {
  return screen.getByTestId(AuthForm.testID.passwordInput);
}

function findSubmitButton(): HTMLElement {
  return screen.getByTestId(AuthForm.testID.submit);
}

function getInputs(): ChildNode[] {
  const loginContainer = findLoginInput();
  const passwordContainer = findPasswordInput();

  const { firstChild: loginInput } = loginContainer;
  const { firstChild: passwordInput } = passwordContainer;

  if (loginInput && passwordInput) {
    return [loginInput, passwordInput];
  }

  return [];
}

function submitIncorrectData(): void {
  const [loginInput, passwordInput] = getInputs();

  fireEvent.change(loginInput, { target: { value: 'test..gpn.ru' } });
  fireEvent.change(passwordInput, { target: { value: '12345678[]' } });

  fireEvent.click(findSubmitButton());
}

describe('AuthForm', () => {
  test('рендерится без ошибок', () => {
    expect(renderComponent).not.toThrow();
  });

  beforeEach(() => {
    onLogin.mockClear();
  });

  test('если ввести корректные данные и засабмитить форму, то вызовется onLogin', () => {
    renderComponent({ onLogin });

    const [loginInput, passwordInput] = getInputs();

    fireEvent.change(loginInput, { target: { value: 'test@gpn.ru' } });
    fireEvent.change(passwordInput, { target: { value: '12345678' } });

    fireEvent.click(findSubmitButton());

    expect(onLogin).toBeCalledTimes(1);
  });

  test('если ввести некорректные данные и засабмитить форму, то onLogin не вызовется', () => {
    renderComponent({ onLogin });

    submitIncorrectData();

    expect(onLogin).toBeCalledTimes(0);
  });

  test('если ввести некорректные данные и засабмитить форму, то сработает ошибка валидации', () => {
    renderComponent({ onLogin });

    submitIncorrectData();

    expect(findLoginInput().classList.contains('TextField_state_alert')).toBe(true);
  });

  test('если не ввести данные и засабмитить форму, то сработает ошибка валидации', () => {
    renderComponent({ onLogin });

    fireEvent.click(findSubmitButton());

    expect(findLoginInput().classList.contains('TextField_state_alert')).toBe(true);
    expect(findPasswordInput().classList.contains('TextField_state_alert')).toBe(true);
  });

  test('если isFetching = true, то в кнопке рендерится лоадер', () => {
    renderComponent({ onLogin, isFetching: true });

    const submitButton = findSubmitButton();

    expect(submitButton.classList.contains('Button_loading')).toBe(true);
  });
});
