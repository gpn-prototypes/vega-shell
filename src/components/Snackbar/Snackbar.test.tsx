import React from 'react';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '../../testing/react-testing-library';

import { Snackbar } from './Snackbar';

describe('Snackbar', () => {
  it('реднерится без ошибок', () => {
    expect(() => render(<Snackbar />)).not.toThrow();
  });

  it('добавляет нотификации', async () => {
    const { shell } = render(<Snackbar />);

    act(() => {
      shell.notifications.add({ body: 'Testing notification' });
    });

    const notification = await screen.findByText('Testing notification');

    expect(notification).toBeInTheDocument();
  });

  it('закрывает нотификации', async () => {
    jest.useFakeTimers();
    const { shell } = render(<Snackbar />);

    act(() => {
      shell.notifications.add({ body: 'Testing notification' });
    });

    const notification = await screen.findByText('Testing notification');

    expect(notification).toBeInTheDocument();

    const closeButton = await screen.findByRole('button');

    userEvent.click(closeButton);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(notification).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it('вызывает пользовательский action закрытия', async () => {
    const func = jest.fn();
    const { shell } = render(<Snackbar />);

    const unsub = shell.notifications.on('user-close', func);

    act(() => {
      shell.notifications.add({
        body: 'Testing notification',
        onCloseAction: { action: 'user-close', payload: { test: 'closed' } },
      });
    });

    const closeButton = await screen.findByRole('button');

    userEvent.click(closeButton);

    expect(func).toBeCalledWith(expect.objectContaining({ test: 'closed' }));

    unsub();
  });

  it('вызывает пользовательский action', async () => {
    const func = jest.fn();
    const { shell } = render(<Snackbar />);

    const unsub = shell.notifications.on('colorize', func);

    act(() => {
      shell.notifications.add({
        body: 'Testing notification',
        actions: [{ action: 'colorize', title: 'Покрасить', payload: { color: 'red' } }],
      });
    });

    const actionButton = await screen.findByText('Покрасить');

    expect(actionButton).toBeInTheDocument();

    userEvent.click(actionButton);

    expect(func).toBeCalledWith(expect.objectContaining({ color: 'red' }));

    unsub();
  });

  it('переключает видимый текст для нотификаций', async () => {
    const { shell } = render(<Snackbar />);
    const text = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent non conva',
      'llis nulla. Vivamus non nisl sed neque rutrum vestibulum.',
    ];

    const truncatedText = `${text[0]}...`;

    act(() => {
      shell.notifications.add({ body: text.toString(), withShowMore: true });
    });

    const notification = await screen.findByText(truncatedText);

    expect(notification).toHaveTextContent(truncatedText);

    const showMoreButton = await screen.findByText('Показать');

    userEvent.click(showMoreButton);

    expect(notification).toHaveTextContent(text.toString());

    const hideMoreButton = await screen.findByText('Свернуть');

    userEvent.click(hideMoreButton);

    expect(notification).toHaveTextContent(truncatedText);
  });
});
