import React from 'react';

import { ErrorView } from '../Error';

export const NotFoundView: React.FC = () => (
  <ErrorView
    code={404}
    message="page-not-found"
    userMessage="Ошибка 404. Страница не найдена. Обратитесь в службу технической поддержки"
  />
);
