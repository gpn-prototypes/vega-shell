import React from 'react';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import { Button, Logo, presetGpnDark, Text, Theme } from '@gpn-prototypes/vega-ui';
import cn from 'bem-cn';

import { ShellServerError } from '../../utils/graphql-client';

import { GazpromLogo } from './GazpromLogo';

import './Error.css';

type ErrorViewProps = ShellServerError;

const cnErrorView = cn('ErrorView');

const ErrorViewButton = (props: ErrorViewProps): React.ReactElement => {
  const { code } = props;
  const history = useHistory();
  const buttonText = 'В список проектов';

  const handleClick = (): void => {
    if (code === 404) {
      history.push('/projects');
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="s"
      view="ghost"
      label={buttonText}
      className={cnErrorView('Button').toString()}
    />
  );
};

export const ErrorView: React.FC<ErrorViewProps> = (props) => {
  const { userMessage } = props;

  return (
    <Router>
      <Theme className={cnErrorView()} preset={presetGpnDark}>
        <div className={cnErrorView('Body')}>
          <GazpromLogo />
          <Logo className={cnErrorView('VegaLogo')} />
          <Text size="xl" className={cnErrorView('UserMessage').toString()}>
            {userMessage}
          </Text>
          <ErrorViewButton {...props} />
        </div>
      </Theme>
    </Router>
  );
};
