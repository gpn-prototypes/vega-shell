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
  jest.useFakeTimers();
  history = createMemoryHistory({ initialEntries: ['/'] });
  Object.defineProperty(global, 'location', {
    writable: true,
    value: { reload: jest.fn() },
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

function findCreateAppealButton(): HTMLElement {
  return findButton(labels.createAppeal);
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

  describe('401 ошибка', () => {
    const userMessage =
      'Ошибка аутентификации. Вы не включены в рабочую группу Вега 2.0. Обратитесь в службу технической поддержки';
    beforeEach(() => {
      renderComponent({
        code: 401,
        message: 'permission_denied',
        userMessage,
      });
    });

    test('рендерится кнопка отправления обращения в техподдержку', () => {
      expect(findCreateAppealButton()).toBeInTheDocument();
    });

    test('при нажатии на кнопку происходит открытие страницы выбор', () => {
      const spy = jest.spyOn(window, 'open');

      const button = findCreateAppealButton();

      userEvent.click(button);

      expect(spy).toBeCalledWith('https://suid.gazprom-neft.local/', '_blank', 'noreferrer=true');
    });

    test('отображается корректный текст ошибки при наличии userMessage', () => {
      expect(screen.getByLabelText(labels.errorText)).toHaveTextContent(userMessage);
    });
  });
});
