import React from 'react';

import { ErrorView } from '../Error';

export const NotFoundView: React.FC = () => (
  <ErrorView code={404} message="page-not-found" userMessage="Указанная страница не найдена" />
);
