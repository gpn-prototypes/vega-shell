import React from 'react';

import { ErrorView } from '../Error';

export const PermissionDeniedView: React.FC = () => (
  <ErrorView
    code={403}
    message="permission_denied"
    userMessage="Вы не включены в рабочую группу ВЕГА 2.0. Необходимо запросить доступ к Вега 2.0 через СУИД"
  />
);
