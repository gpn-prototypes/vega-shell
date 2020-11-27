declare module 'single-spa-react/lib/esm/parcel' {
  import { Lifecycles } from 'single-spa-react';
  import { mountRootParcel } from 'single-spa';

  interface ParcelProps {
    // define here what props you need
    config:
      | (() => Promise<Lifecycles>)
      | (() => Promise<System.Module>)
      | Lifecycles
      | Promise<Lifecycles>;
    mountParcel?: typeof mountRootParcel;
    wrapWith?: string;
    wrapClassName?: string;
    handleError?: (err) => void;
  }

  // eslint-disable-next-line react/prefer-stateless-function
  export default class Parcel extends React.Component<ParcelProps> {}
}
