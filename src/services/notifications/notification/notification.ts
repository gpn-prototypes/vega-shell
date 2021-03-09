/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action } from '../types';

export type View = 'normal' | 'system' | 'success' | 'warning' | 'alert';

const TWO_ROW_SYMBOLS = 75;

type OnCloseAction = { action: string; payload: any };

export type NotificationProps = {
  id: string;
  body: string;
  view?: View;
  closable?: boolean;
  shared?: boolean;
  actions?: Action[];
  onCloseAction?: OnCloseAction;
  icon?: string;
  withShowMore?: boolean;
  truncatedLength?: number;
  autoClose?: number;
};

export class Notification {
  public readonly id: string;

  public body: string;

  public view: View;

  public actions?: Action[];

  public onCloseAction?: OnCloseAction;

  public readonly rawBody: string;

  public withShowMore: boolean;

  public visibleMore: boolean;

  public readonly truncatedLength: number;

  public readonly closable: boolean;

  public readonly shared: boolean;

  public readonly autoClose?: number;

  constructor(props: NotificationProps) {
    const {
      id,
      body,
      autoClose,
      actions = [],
      onCloseAction,
      view = 'normal',
      shared = false,
      closable = true,
      withShowMore = false,
      truncatedLength = TWO_ROW_SYMBOLS,
    } = props;

    const canTruncateBody = withShowMore && body.length > truncatedLength;

    this.id = id;
    this.rawBody = body;
    this.body = canTruncateBody ? Notification.truncate(body, truncatedLength) : body;
    this.onCloseAction = onCloseAction;
    this.actions = actions;
    this.shared = shared;
    this.closable = closable;
    this.withShowMore = withShowMore;
    this.visibleMore = false;
    this.truncatedLength = truncatedLength;
    this.view = view;
    this.autoClose = autoClose;
  }

  static truncate(text: string, length: number): string {
    return `${text.slice(0, length)}...`;
  }

  public toggleShowMore(): void {
    if (!this.visibleMore) {
      this.body = this.rawBody;
    } else {
      this.body = Notification.truncate(this.rawBody, this.truncatedLength);
    }

    this.visibleMore = !this.visibleMore;
  }
}
