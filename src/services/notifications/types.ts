/* eslint-disable @typescript-eslint/no-explicit-any */
export type Action = {
  title: string;
  action: string;
  shared?: boolean;
  payload?: any;
};
