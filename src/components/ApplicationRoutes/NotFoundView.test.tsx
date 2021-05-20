import React from 'react';
import { Router } from 'react-router-dom';
import { render, RenderResult, screen } from '@testing-library/react';
import { createMemoryHistory, History } from 'history';

import { labels } from '../Error/ErrorView';

import { NotFoundView } from './NotFoundView';

let history: History;

const MESSAGE = 'Указанная страница не найдена';

beforeEach(() => {
  history = createMemoryHistory({ initialEntries: ['/'] });
});

function renderComponent(): RenderResult {
  return render(
    <Router history={history}>
      <NotFoundView />
    </Router>,
  );
}

describe('NotFoundView', () => {
  test('корректно рендерится', () => {
    expect(renderComponent).not.toThrow();
  });

  test('отображается корректный текст ошибки', () => {
    renderComponent();
    expect(screen.getByLabelText(labels.errorText)).toHaveTextContent(MESSAGE);
  });
});
