import React from 'react';
import { Text } from '@gpn-prototypes/vega-ui';
import { block } from 'bem-cn';

import { useShell } from '../../../../../app';

import defaultAvatar from './default-avatar.svg';

import './CurrentUserInfo.css';

interface Props {
  className?: string;
}

const testId = {
  userInfo: 'Header:userInfo',
  username: 'Header:username',
};

const b = block('CurrentUserInfo');

export const CurrentUserInfo: React.FC<Props> = (props) => {
  const { identity } = useShell();
  const { className } = props;

  const userName = identity.getUserName();

  // istanbul ignore if: у авторизованного пользователя имя обязательно
  if (userName === null) {
    return null;
  }

  const { firstName, lastName } = userName;
  const fullName = `${firstName} ${lastName}`;

  return (
    <div data-testid={testId.userInfo} className={b.mix(className).toString()}>
      <img src={defaultAvatar} alt="avatar" className={b('avatar').toString()} />
      <Text data-testid={testId.username} size="xs" className={b('name').toString()}>
        {fullName}
      </Text>
    </div>
  );
};
