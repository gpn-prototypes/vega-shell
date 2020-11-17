/* eslint-disable max-classes-per-file */
import React from 'react';
import { render } from 'react-dom';

import { BrowserMessageBus } from '../../message-bus';

import { Error } from './Error';
import { ErrorView } from './ErrorView';

export const createErrorWidget = (params: {
  bus: BrowserMessageBus;
}): CustomElementConstructor & { widgetName: string } => {
  return class ErrorWidget extends HTMLElement {
    static widgetName = 'error-widget';

    connectedCallback(): void {
      render(<Error bus={params.bus} />, this);
    }
  };
};

export class ErrorViewWidget extends HTMLElement {
  static widgetName = 'error-view-widget';

  connectedCallback(): void {
    const code = Number(this.getAttribute('code'));
    const message = this.getAttribute('message') ?? '';
    const userMessage = this.getAttribute('userMessage') ?? '';

    if (code) {
      render(<ErrorView code={code} message={message} userMessage={userMessage} />, this);
    }
  }
}
