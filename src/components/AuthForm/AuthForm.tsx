import React, { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useHistory } from 'react-router-dom';
import { Button, Form, Logo, Text } from '@gpn-prototypes/vega-ui';

import { useShell } from '../../app';
import { UserDataType } from '../../services/api-client';

import { cnAuthForm } from './cn-auth-form';
import { GazpromLogo } from './GazpromLogo';
import { TextField } from './TextField';
import { createValidate, validators } from './validation';

import './AuthForm.css';

export type LoginError = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type State = {
  login: string;
  password: string;
};

const validator = createValidate<Partial<State>>({
  login: [validators.required(), validators.email()],
  password: [validators.required()],
});

type ValidateMap = ReturnType<typeof validator>;

const testId = {
  logo: 'AuthForm:logo:gpn',
  logoVega: 'AuthForm:logo:vega',
  form: 'AuthForm:form',
  loginInput: 'AuthForm:field:login',
  loginInputLabel: 'AuthForm:label:login',
  passwordInput: 'AuthForm:field:password',
  passwordInputLabel: 'AuthForm:label:password',
  submit: 'AuthForm:button:submit',
  support: 'AuthForm:text:support',
};

export type AuthFormProps = {
  onLogin: (state: UserDataType) => Promise<string | null>;
  containerClassName?: string;
};

type AuthFormComponent = React.FC<AuthFormProps> & {
  testId: typeof testId;
};

export const authErrorMessage =
  'Неверный e-mail или пароль. Проверьте введенные данные и повторите попытку.';

export const AUTH_ERROR_NOTIFICATION_KEY = 'auth-error-alert';
export const LOGIN_ERROR_NOTIFICATION_KEY = 'login-error-alert';

export const AuthForm: AuthFormComponent = (props) => {
  const { onLogin, containerClassName } = props;

  const history = useHistory();

  const { notifications } = useShell();

  const [isFetching, setIsFetching] = useState(false);

  const handleAuthSubmit = (values: State): void => {
    setIsFetching(true);

    if (notifications.find(LOGIN_ERROR_NOTIFICATION_KEY) !== undefined) {
      notifications.remove(LOGIN_ERROR_NOTIFICATION_KEY);
    }

    if (notifications.find(AUTH_ERROR_NOTIFICATION_KEY) !== undefined) {
      notifications.remove(AUTH_ERROR_NOTIFICATION_KEY);
    }

    onLogin(values).catch((error: LoginError) => {
      setIsFetching(false);

      if (error.code === 'PERMISSION_DENIED') {
        history.push('/permission_denied');
        return;
      }

      const body = error.code === 'AUTH_ERROR' ? authErrorMessage : error.message;

      if (error) {
        notifications.add({
          id: LOGIN_ERROR_NOTIFICATION_KEY,
          body,
          view: 'alert',
        });
      }
    });
  };

  const validate = (values: State): ValidateMap => validator(values);

  return (
    <div className={cnAuthForm.mix(containerClassName)}>
      <div className={cnAuthForm('GazpromLogo')} data-testid={testId.logo}>
        <GazpromLogo />
      </div>
      <FinalForm onSubmit={handleAuthSubmit} validate={validate}>
        {({ handleSubmit }): React.ReactNode => (
          <Form
            noValidate
            onSubmit={handleSubmit}
            className={cnAuthForm('Form')}
            data-testid={testId.form}
          >
            <Logo className={cnAuthForm('Logo')} data-testid={testId.logoVega} />
            <Form.Row>
              <Form.Field>
                <Form.Label htmlFor="login" space="xs" data-testid={testId.loginInputLabel}>
                  <Text size="l" lineHeight="s" view="secondary">
                    E-mail
                  </Text>
                </Form.Label>
                <TextField
                  id="login"
                  type="email"
                  name="login"
                  size="l"
                  width="full"
                  maxLength={128}
                  validateOnTouched
                  data-testid={testId.loginInput}
                />
              </Form.Field>
            </Form.Row>
            <Form.Row space="m">
              <Form.Field>
                <Form.Label htmlFor="password" space="xs" data-testid={testId.passwordInputLabel}>
                  <Text size="l" lineHeight="s" view="secondary">
                    Пароль
                  </Text>
                </Form.Label>
                <TextField
                  id="password"
                  type="password"
                  name="password"
                  aria-label="Введите пароль"
                  size="l"
                  width="full"
                  maxLength={200}
                  validateOnTouched
                  data-testid={testId.passwordInput}
                />
              </Form.Field>
            </Form.Row>
            <Form.Row space="xl">
              <Button
                data-testid={testId.submit}
                loading={isFetching}
                label="Войти"
                size="l"
                width="full"
              />
            </Form.Row>
            <Form.Row className={cnAuthForm('Desc')}>
              <Text size="s" lineHeight="xs" view="secondary">
                Если вы забыли пароль, обратитесь в&nbsp;
                <a
                  data-testid={testId.support}
                  href="mailto:support@vegaspace.tk"
                  className={cnAuthForm('Link')}
                  target="_blank"
                  rel="noreferrer"
                >
                  Службу&nbsp;технической поддержки
                </a>
              </Text>
            </Form.Row>
          </Form>
        )}
      </FinalForm>
    </div>
  );
};

AuthForm.testId = testId;
