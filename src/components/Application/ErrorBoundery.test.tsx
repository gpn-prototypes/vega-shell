import React from 'react';
import { render, screen } from '@testing-library/react';

import { ErrorBoundary } from './ErrorBoundery';

function Bomb() {
  throw new Error('BOOM');

  return <div>Hello from </div>;
}

describe('ErrorBoundary', () => {
  const originalError = console.error;
  console.error = jest.fn();

  afterAll(() => {
    console.error = originalError;
  });

  it('возвращает fallback при рендере, если есть ошибка', () => {
    render(
      <ErrorBoundary onError={() => {}} fallback={<div>Ошибка</div>}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Ошибка')).toBeInTheDocument();
  });

  it('возвращает null при рендере, если есть ошибка', () => {
    render(
      <ErrorBoundary onError={() => {}}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });

  it('вызывает onError при ошибке', () => {
    const fn = jest.fn();

    render(
      <ErrorBoundary onError={fn} fallback={<div>Ошибка</div>}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(fn).toBeCalled();
  });
});
