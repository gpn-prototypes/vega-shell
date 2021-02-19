import React, { useMemo, useState } from 'react';
import { mountRootParcel } from 'single-spa';
import ParcelComponent from 'single-spa-react/lib/esm/parcel';

import { useShell } from '../../app/shell-context';
import { RootLoader } from '../Loader';

export type ApplicationProps = {
  name: string;
  type?: 'single-spa' | 'react';
  wrapWith?: string;
  wrapClassName?: string;
  onUnmount?: (name: string) => void;
};

export const lazyComponentsCache = new Map<string, ReturnType<typeof React.lazy>>();

const toLazyComponent = (name: string) => {
  let component = lazyComponentsCache.get(name);

  if (component === undefined) {
    component = React.lazy(() => System.import(name));
    lazyComponentsCache.set(name, component);
  }

  return component;
};

export const Application: React.FC<ApplicationProps> = ({
  name,
  type = 'single-spa',
  wrapClassName,
  wrapWith,
  ...rest
}) => {
  const { serverError, ...shell } = useShell();
  const [isLoading, setIsLoading] = useState(type !== 'react');

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

  if (type === 'react') {
    const Component = toLazyComponent(name);
    return (
      <React.Suspense fallback={<RootLoader />}>
        <Component {...rest} {...shell} />
      </React.Suspense>
    );
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
