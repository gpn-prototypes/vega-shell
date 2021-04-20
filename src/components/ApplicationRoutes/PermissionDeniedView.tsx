import React from 'react';

import { ErrorView } from '../Error';

export const PermissionDeniedView: React.FC = () => (
  <ErrorView
    code={401}
    message="permission_denied"
    userMessage="Ошибка аутентификации. Вы не включены в рабочую группу Вега 2.0. Обратитесь в службу технической поддержки"
  />
);
