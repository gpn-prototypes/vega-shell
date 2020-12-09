import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useHistory } from 'react-router-dom';
import {
  Button,
  Loader,
  Logo,
  presetGpnDark,
  Text,
  Theme,
  useInterval,
  useMount,
  useUnmount,
} from '@gpn-prototypes/vega-ui';
import cn from 'bem-cn';

import { ServerError } from '../../utils/graphql-client';

import { GazpromLogo } from './GazpromLogo';

import './Error.css';

type ErrorViewProps = ServerError;

const TIME_TO_RELOAD_SEC = 60;

const cnErrorView = cn('ErrorView');

type ErrorViewButtonProps = ErrorViewProps & {
  reloadInterval: ReturnType<typeof useInterval>;
};

const ErrorViewButton = (props: ErrorViewButtonProps): React.ReactElement => {
  const { code, reloadInterval } = props;
  const history = useHistory();
  const buttonText = code === 500 ? 'Попробовать снова' : 'В список проектов';

  const handleClick = (): void => {
    if (code === 404) {
      history.push('/projects');
    }

    if (code === 500) {
      reloadInterval.clear();
      window.location.reload();
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
  const { userMessage, code } = props;
  const [timeLeft, setTimeLeft] = useState(TIME_TO_RELOAD_SEC);

  const IS_INTERNAL_SERVER_ERROR = code === 500;

  const getMessage = (): string => {
    if (IS_INTERNAL_SERVER_ERROR) {
      return `Ошибка 500. Сервер недоступен
        Повторное подключение через ${timeLeft} секунд`;
    }

    return userMessage ?? '';
  };

  const intervalAPI = useInterval(
    1000,
    () => {
      if (timeLeft > 1) {
        setTimeLeft((prevTime) => prevTime - 1);
      }
    },
    { autostart: false },
  );

  useMount(() => {
    if (code === 500) {
      intervalAPI.start();
    }
  });

  useUnmount(() => {
    intervalAPI.clear();
  });

  useEffect(() => {
    if (timeLeft <= 1) {
      intervalAPI.clear();
      window.location.reload();
    }
  }, [intervalAPI, timeLeft]);

  return (
    <Router>
      <Theme className={cnErrorView()} preset={presetGpnDark}>
        <div className={cnErrorView('Body')}>
          <GazpromLogo />
          <Logo className={cnErrorView('VegaLogo')} />
          <Text size="xl" className={cnErrorView('UserMessage').toString()}>
            {getMessage()}
          </Text>
          {IS_INTERNAL_SERVER_ERROR && <Loader className={cnErrorView('Loader').toString()} />}
          <ErrorViewButton {...props} reloadInterval={intervalAPI} />
        </div>
      </Theme>
    </Router>
  );
};
