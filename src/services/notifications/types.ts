/* eslint-disable @typescript-eslint/no-explicit-any */

export type Action = {
  title: string;
  action: string;
  shared?: boolean;
  payload?: any;
};

export type Callback = (payload: any) => void;

export type Topic = string;

export interface Unsubscribe {
  (): void;
}
