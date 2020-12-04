import React, { useMemo, useState } from 'react';
import { ServerError } from '@gpn-prototypes/vega-sdk';
import { mountRootParcel } from 'single-spa';
import ParcelComponent from 'single-spa-react/lib/esm/parcel';

import { useAppContext } from '../../app-context';
import { ErrorView } from '../Error';
import { RootLoader } from '../Loader';

type Props = {
  name: string;
  wrapWith?: string;
  wrapClassName?: string;
};

export const Application: React.FC<Props> = ({ name, wrapClassName, wrapWith }) => {
  const context = useAppContext();
  const [error, setError] = useState<ServerError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleParcelMount = (): void => {
    if (isLoading) {
      setIsLoading(false);
    }
  };

  const config = useMemo(() => System.import(name), [name]);

  const handleServiceError = (): void => {
    setError({
      code: 500,
      message: 'service-error',
    });

    if (isLoading) {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <RootLoader />}
      {error && <ErrorView {...error} />}
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
