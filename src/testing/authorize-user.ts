import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export function findLoginInput(): HTMLElement {
  return screen.getByRole('textbox', { name: 'E-mail' });
}

export function findPasswordInput(): HTMLElement {
  // К type=password нельзя получить доступ по роли
  const element = screen.getByLabelText('Введите пароль');

  const passwordInput = element.querySelector('input');

  if (passwordInput === null) {
    throw new Error('Input not found');
  }

  return passwordInput;
}

export function findSubmitButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Войти' });
}

export function getInputs(): HTMLElement[] {
  const loginInput = findLoginInput();
  const passwordInput = findPasswordInput();

  return [loginInput, passwordInput];
}

export function incorrectLogin(): void {
  const [loginInput, passwordInput] = getInputs();

  userEvent.type(loginInput, 'test..gpn.ru');
  userEvent.type(passwordInput, '12345678[]');

  userEvent.click(findSubmitButton());
}

export function login(): void {
  const [loginInput, passwordInput] = getInputs();

  userEvent.type(loginInput, 'test@gpn.ru');
  userEvent.type(passwordInput, '12345678');

  userEvent.click(findSubmitButton());
}
