import React from 'react';
import { Router } from 'react-router-dom';
import { act, render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, History } from 'history';

import { ErrorView, ErrorViewProps, labels, TIME_TO_RELOAD_SEC } from './ErrorView';

const { location } = window;

let history: History;

const USER_MESSAGE = 'user message';

beforeEach(() => {
  jest.clearAllTimers();
  jest.useFakeTimers();
  history = createMemoryHistory({ initialEntries: ['/'] });
  Object.defineProperty(global, 'location', {
    writable: true,
    value: { reload: jest.fn() },
  });
  Object.defineProperty(global, 'open', {
    writable: true,
    value: jest.fn(),
  });
});

afterEach(() => {
  global.location = location;
  jest.useRealTimers();
});

function findButton(name: string): HTMLElement {
  return screen.getByRole('button', { name });
}

function findReloadButton(): HTMLElement {
  return findButton(labels.reloadButton);
}

function findProjectsButton(): HTMLElement {
  return findButton(labels.projectButton);
}

function findSuidButton(): HTMLElement {
  return findButton(labels.suidButton);
}

function findReturnButton(): HTMLElement {
  return findButton(labels.returnButton);
}

function renderComponent(props: Partial<ErrorViewProps> = {}): RenderResult {
  return render(
    <Router history={history}>
      <ErrorView code={400} message="validation-error" {...props} />
    </Router>,
  );
}

describe('ErrorView', () => {
  test('корректно рендерится', () => {
    expect(renderComponent).not.toThrow();
  });

  describe('500 ошибка', () => {
    beforeEach(() => {
      renderComponent({ code: 500 });
    });

    test(`страница перезагружается через ${TIME_TO_RELOAD_SEC} секунд`, () => {
      act(() => {
        jest.advanceTimersByTime(TIME_TO_RELOAD_SEC * 1000);
      });

      expect(global.location.reload).toHaveBeenCalled();
    });

    test('рендерится кнопка для обновления страницы', () => {
      expect(findReloadButton()).toBeInTheDocument();
    });

    test('при нажатии на кнопку происходит обновление страницы', () => {
      const button = findReloadButton();

      userEvent.click(button);

      expect(global.location.reload).toHaveBeenCalled();
    });

    test('отображается корректный текст ошибки', () => {
      expect(screen.getByLabelText(labels.errorText)).toHaveTextContent(
        'Ошибка 500. Сервер недоступен Повторное подключение через 60 сек',
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByLabelText(labels.errorText)).toHaveTextContent(
        'Ошибка 500. Сервер недоступен Повторное подключение через 59 сек',
      );
    });
  });

  describe('404 ошибка', () => {
    beforeEach(() => {
      renderComponent({ code: 404, userMessage: USER_MESSAGE });
    });

    test('рендерится кнопка перехода на страницу проектов', () => {
      expect(findProjectsButton()).toBeInTheDocument();
    });

    test('при нажатии на кнопку происходит переход на страницу проектов', () => {
      const spy = jest.spyOn(history, 'push');

      const button = findProjectsButton();

      userEvent.click(button);

      expect(spy).toBeCalledWith('/projects');
    });

    test('отображается корректный текст ошибки при наличии userMessage', () => {
      expect(screen.getByLabelText(labels.errorText)).toHaveTextContent(USER_MESSAGE);
    });
  });

  describe('403 ошибка', () => {
    const userMessage = 'Ошибка аутентификации. Права доступа в систему Вега 2.0 отсутствуют';
    beforeEach(() => {
      renderComponent({
        code: 403,
        message: 'permission_denied',
        userMessage,
      });
    });

    test('рендерится кнопка отправления обращения в техподдержку', () => {
      expect(findSuidButton()).toBeInTheDocument();
    });

    test('рендерится кнопка возвращения на страницу логина', () => {
      expect(findReturnButton()).toBeInTheDocument();
    });

    test('при нажатии на кнопку перехода в суид происходит открытие новой страницы', () => {
      const spy = jest.spyOn(global, 'open');

      const button = findSuidButton();

      userEvent.click(button);

      expect(spy).toBeCalledWith('https://suid.gazprom-neft.local/', '_blank', 'noreferrer=true');
    });

    test('при нажатии на кнопку назад происходит переход на страницу логина', () => {
      const spy = jest.spyOn(history, 'push');

      const button = findReturnButton();

      userEvent.click(button);

      expect(spy).toBeCalledWith('/login');
    });

    test('отображается корректный текст ошибки при наличии userMessage', () => {
      expect(screen.getByLabelText(labels.errorText)).toHaveTextContent(userMessage);
    });
  });
});
