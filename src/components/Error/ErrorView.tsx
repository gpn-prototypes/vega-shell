import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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

import { ServerError } from '../../services/graphql-client';

import { GazpromLogo } from './GazpromLogo';

import './Error.css';

export type ErrorViewProps = ServerError;

export enum labels {
  errorText = 'Текст ошибки',
  reloadButton = 'Попробовать снова',
  projectButton = 'В список проектов',
  suidButton = 'Перейти в СУИД',
  returnButton = 'Назад',
  body = 'Ошибка от сервера',
}

export const TIME_TO_RELOAD_SEC = 60;

export const internalServerErrorText = (timeLeft: number): string => `Ошибка 500. Сервер недоступен
Повторное подключение через ${timeLeft} сек`;

const cnErrorView = cn('ErrorView');

type ErrorViewButtonProps = Pick<ErrorViewProps, 'code'> & {
  reloadInterval: ReturnType<typeof useInterval>;
};

const ErrorViewButton = (props: ErrorViewButtonProps): React.ReactElement => {
  const { code, reloadInterval } = props;
  const history = useHistory();
  let buttonText = labels.reloadButton;

  switch (code) {
    case 403: {
      buttonText = labels.suidButton;
      break;
    }
    case 404: {
      buttonText = labels.projectButton;
      break;
    }
    default:
      break;
  }

  const handleClick = (): void => {
    if (code === 403) {
      window.open('https://suid.gazprom-neft.local/', '_blank', 'noreferrer=true');
    }

    if (code === 404) {
      history.push('/projects');
    }

    if (code === 500) {
      reloadInterval.clear();
      window.location.reload();
    }
  };

  return (
    <div className={cnErrorView('ButtonsWrapper')}>
      {code === 403 && (
        <Button
          onClick={() => history.push('/login')}
          size="s"
          role="button"
          name={labels.returnButton}
          view="ghost"
          label={labels.returnButton}
          aria-label={labels.returnButton}
          className={cnErrorView('Button').toString()}
        />
      )}
      <Button
        onClick={handleClick}
        size="s"
        role="button"
        name={buttonText}
        view="ghost"
        label={buttonText}
        aria-label={buttonText}
        className={cnErrorView('Button').toString()}
      />
    </div>
  );
};

export const ErrorView: React.FC<ErrorViewProps> = (props) => {
  const { userMessage, code } = props;
  const [timeLeft, setTimeLeft] = useState(TIME_TO_RELOAD_SEC);

  const IS_INTERNAL_SERVER_ERROR = code === 500;

  const getMessage = (): string => {
    if (IS_INTERNAL_SERVER_ERROR) {
      return internalServerErrorText(timeLeft);
    }

    return userMessage ?? '';
  };

  const intervalAPI = useInterval(
    1000,
    () => {
      // istanbul ignore else
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
    <Theme className={cnErrorView()} preset={presetGpnDark}>
      <div aria-label={labels.body} className={cnErrorView('Body')}>
        <GazpromLogo />
        <Logo className={cnErrorView('VegaLogo')} />
        <Text
          size="xl"
          aria-label={labels.errorText}
          className={cnErrorView('UserMessage').toString()}
        >
          {getMessage()}
        </Text>
        {IS_INTERNAL_SERVER_ERROR && <Loader className={cnErrorView('Loader').toString()} />}
        <ErrorViewButton code={code} reloadInterval={intervalAPI} />
      </div>
    </Theme>
  );
};
