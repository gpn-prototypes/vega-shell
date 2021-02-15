import fetch from 'cross-fetch';

import '@testing-library/jest-dom';

jest.mock('single-spa-react/lib/esm/parcel', () => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const { useMount } = require('@gpn-prototypes/vega-ui');

  return (props: { error: boolean; handleError: VoidFunction }) => {
    useMount(() => {
      if (props.error) {
        props.handleError();
      }
    });

    return null;
  };
});

global.fetch = fetch;
