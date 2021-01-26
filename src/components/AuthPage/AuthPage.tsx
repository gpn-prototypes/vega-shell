import React, { useEffect, useState } from 'react';
import { Carousel, Loader } from '@gpn-prototypes/vega-ui';

import { useAppContext } from '../../app/app-context';
import { AuthForm } from '../AuthForm';

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
};

type AuthPageType = React.FC & {
  testId: typeof testId;
};

export const AuthPage: AuthPageType = () => {
  const { identity, notifications } = useAppContext();

  const [slideIdx, setSlideIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const useUnstableAuthSSO = localStorage.getItem('useUnstableAuthSSO');

    if (useUnstableAuthSSO === 'true') {
      identity?.authSSO().catch(() => {
        const key = 'sso-error-alert';
        const message = 'При входе возникла ошибка, войдите с помощью учетной записи';

        notifications.add({
          key,
          message,
          status: 'alert',
          onClose: () => {
            notifications.remove(key);
          },
        });

        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={cnAuthPage()}>
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
