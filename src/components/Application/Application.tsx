import React, { useMemo, useState } from 'react';
import { mountRootParcel } from 'single-spa';
import ParcelComponent from 'single-spa-react/lib/esm/parcel';

import { useShell } from '../../app/shell-context';
import { RootLoader } from '../Loader';

export type ApplicationProps = {
  name: string;
  wrapWith?: string;
  wrapClassName?: string;
  onUnmount?: (name: string) => void;
};

export const Application: React.FC<ApplicationProps> = ({
  name,
  wrapClassName,
  wrapWith,
  ...rest
}) => {
  const { serverError, ...shell } = useShell();
  const [isLoading, setIsLoading] = useState(true);

  const handleParcelMount = (): void => {
    // istanbul ignore else
    if (isLoading) {
      setIsLoading(false);
    }
  };

  const config = useMemo(() => {
    return System.import(name);
  }, [name]);

  const handleServiceError = (): void => {
    System.delete(System.resolve(name));
    const key = `${name}-load-error`;
    shell.notifications.add({
      key,
      message: `Ошибка загрузки модуля «${name}»`,
      status: 'alert',
    });

    // istanbul ignore else
    if (isLoading) {
      setIsLoading(false);
    }
  };

  // istanbul ignore else
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
        {...shell}
        {...rest}
      />
    </>
  );
};
