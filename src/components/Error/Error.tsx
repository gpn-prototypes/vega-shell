import React, { useState } from 'react';
import { useMount } from '@gpn-prototypes/vega-ui';

import { BrowserMessageBus } from '../../message-bus';
import { ShellServerError } from '../../utils/graphql-client';

import { ErrorView } from './ErrorView';

type ErrorProps = {
  bus: BrowserMessageBus;
};

export const Error: React.FC<ErrorProps> = ({ bus }) => {
  const [error, setError] = useState<ShellServerError | null>(null);

  const onErrorHandle = (serverError: ShellServerError): void => {
    setError(serverError);
  };

  useMount(() => {
    const unsub = bus.subscribe<ShellServerError>(
      { channel: 'error', topic: 'server-error' },
      ({ payload }) => {
        onErrorHandle(payload);
      },
    );

    return unsub;
  });

  if (!error) {
    return null;
  }

  return <ErrorView {...error} />;
};
