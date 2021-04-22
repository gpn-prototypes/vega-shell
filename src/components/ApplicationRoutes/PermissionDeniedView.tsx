import React from 'react';

import { ErrorView } from '../Error';

export const PermissionDeniedView: React.FC = () => (
  <ErrorView
    code={401}
    message="permission_denied"
    userMessage="Ошибка аутентификации. Права доступа в систему Вега 2.0 отсутствуют"
  />
);
