import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Carousel, Loader } from '@gpn-prototypes/vega-ui';

import { useShell } from '../../app';
import { AuthForm, LoginError } from '../AuthForm';

import imgCreate from './images/carousel-create-project.png';
import imgRb from './images/carousel-rb.png';
import imgTotal from './images/carousel-total.png';
import { cnAuthPage } from './cn-auth-page';

import './AuthPage.css';

type SlideType = {
  caption: string;
  img: string;
};

const slides: SlideType[] = [
  { caption: 'Быстрое создание проекта', img: imgCreate },
  { caption: 'Удобное заполнение Ресурсной Базы и рисков', img: imgRb },
  { caption: 'Наглядный результат расчёта Ресурсной Базы ', img: imgTotal },
];

const testId = {
  carousel: 'AuthPage:Carousel',
  loader: 'AuthPage:Loader',
  root: 'AuthPage:Root',
};

type AuthPageType = React.FC & {
  testId: typeof testId;
};

export const LOGIN_SSO_ERROR_NOTIFICATION_KEY = 'login-sso-error-alert';

export const AuthPage: AuthPageType = () => {
  const { identity, notifications } = useShell();
  const history = useHistory();

  const [slideIdx, setSlideIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const useAuthWithoutSSO = process.env.DISABLE_SSO === 'true';
    const manuallyDisableSSO = localStorage.getItem('disableSSO') === 'true';

    if (!useAuthWithoutSSO && !manuallyDisableSSO) {
      if (notifications.find(LOGIN_SSO_ERROR_NOTIFICATION_KEY) !== undefined) {
        notifications.remove(LOGIN_SSO_ERROR_NOTIFICATION_KEY);
      }

      identity?.authSSO().catch((error: LoginError) => {
        if (error.code === 'PERMISSION_DENIED') {
          history.push('/permission_denied');
          return;
        }

        const body = 'При входе возникла ошибка, войдите с помощью учетной записи';

        notifications.add({
          id: LOGIN_SSO_ERROR_NOTIFICATION_KEY,
          body,
          view: 'alert',
        });

        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <Loader aria-label="Загрузка" data-testid={testId.loader} />;
  }

  return (
    <div className={cnAuthPage()} aria-label="Авторизация">
      <AuthForm onLogin={identity.auth} containerClassName={cnAuthPage('FormContainer')} />
      <div className={cnAuthPage('Teaser')}>
        <Carousel
          currentIdx={slideIdx}
          onChange={setSlideIdx}
          className={cnAuthPage('TeaserCarousel')}
          testId={testId.carousel}
        >
          {slides.map((slide) => (
            <Carousel.Slide
              key={slide.caption}
              caption={slide.caption}
              className={cnAuthPage('Slide')}
            >
              <div
                className={cnAuthPage('Image')}
                style={{ backgroundImage: `url(${slide.img})` }}
              />
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

AuthPage.testId = testId;
