import { Action } from '../types';

export type View = 'normal' | 'system' | 'success' | 'warning' | 'alert';

const TWO_ROW_SYMBOLS = 75;

export type NotificationProps = {
  id: string;
  body: string;
  namespace?: string;
  view?: View;
  closable?: boolean;
  shared?: boolean;
  actions?: Action[];
  icon?: string;
  withShowMore?: boolean;
  maxBodyLength?: number;
  autoClose?: number;
};

export class Notification {
  public readonly id: string;

  public body: string;

  public view: View;

  public actions?: Action[];

  public readonly rawBody: string;

  public withShowMore: boolean;

  public visibleMore: boolean;

  public readonly maxBodyLength: number;

  public readonly canSliceBody: boolean;

  public readonly namespace;

  public readonly closable: boolean;

  public readonly shared: boolean;

  public readonly autoClose?: number;

  constructor(props: NotificationProps) {
    const {
      id,
      body,
      autoClose,
      actions = [],
      view = 'normal',
      shared = false,
      closable = true,
      withShowMore = true,
      maxBodyLength = TWO_ROW_SYMBOLS,
      namespace = 'common',
    } = props;

    const canSliceBody = withShowMore && body.length > maxBodyLength;

    this.id = id;
    this.rawBody = body;
    this.body = canSliceBody ? Notification.sliceText(body, maxBodyLength) : body;
    this.actions = actions;
    this.shared = shared;
    this.namespace = namespace;
    this.closable = closable;
    this.canSliceBody = canSliceBody;
    this.withShowMore = withShowMore;
    this.visibleMore = false;
    this.maxBodyLength = maxBodyLength;
    this.view = view;
    this.autoClose = autoClose;
  }

  static sliceText(text: string, length: number): string {
    return `${text.slice(0, length)}...`;
  }

  public toggleShowMore(): void {
    if (!this.visibleMore) {
      this.body = this.rawBody;
    } else {
      this.body = Notification.sliceText(this.rawBody, this.maxBodyLength);
    }

    this.visibleMore = !this.visibleMore;
  }
}
