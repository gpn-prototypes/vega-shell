import React, { useMemo, useState } from 'react';
import { mountRootParcel } from 'single-spa';
import ParcelComponent from 'single-spa-react/lib/esm/parcel';

import { useAppContext } from '../../app-context';
import { RootLoader } from '../Loader';

type Props = {
  name: string;
  wrapWith?: string;
  wrapClassName?: string;
};

export const Application: React.FC<Props> = ({ name, wrapClassName, wrapWith }) => {
  const { serverError, ...context } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  const handleParcelMount = (): void => {
    if (isLoading) {
      setIsLoading(false);
    }
  };

  const config = useMemo(() => System.import(name), [name]);

  const handleServiceError = (): void => {
    System.delete(System.resolve(name));
    const key = `${name}-load-error`;
    context.notifications.add({
      key,
      message: `Ошибка загрузки модуля «${name}»`,
      status: 'alert',
      onClose: () => {
        context.notifications.remove(key);
      },
    });

    if (isLoading) {
      setIsLoading(false);
    }
  };

  if (serverError !== null) {
    return null;
  }

  return (
    <>
      {isLoading && <RootLoader />}
      <ParcelComponent
        key={name}
        config={config}
        handleError={handleServiceError}
        mountParcel={mountRootParcel}
        wrapClassName={wrapClassName}
        wrapWith={wrapWith}
        parcelDidMount={handleParcelMount}
        {...context}
      />
    </>
  );
};
