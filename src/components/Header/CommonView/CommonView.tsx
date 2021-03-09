import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { BaseView } from '../BaseView/BaseView';
import { Title } from '../BaseView/Title';

export const CommonView: React.FC = () => {
  return (
    <BaseView
      title={(titleProps) => (
        <Title {...titleProps}>
          <Switch>
            <Route path="/projects/create">Создание проекта</Route>
            <Route path="/projects" exact>
              Проекты
            </Route>
          </Switch>
        </Title>
      )}
    />
  );
};
