import React from 'react';
import { Item } from '@consta/uikit/SnackBar';
import { SnackBar as BaseSnackbar, usePortalRender } from '@gpn-prototypes/vega-ui';

import { useShell } from '../../app/shell-context';
import { Notification, View } from '../../services/notifications/notification/notification';
import { Action } from '../../services/notifications/types';

import './Snackbar.css';

const styles = {
  container: 'vega-shell-snackbar-container',
  snackbar: 'vega-shell-snackbar',
};

type TransformedAction = { label: string; onClick(): void };

type TransformProps = {
  key: string;
  message: string;
  status: View;
  autoClose?: number;
  actions: TransformedAction[];
  onClose(): void;
};

const transform = (item: TransformProps) => {
  return {
    key: item.key,
    message: item.message,
    actions: item.actions,
    status: item.status,
    autoClose: item.autoClose,
    onClose: () => {
      item.onClose();
    },
  };
};

export const Snackbar = (): React.ReactElement => {
  const [notifications, setNotifications] = React.useState<Item[]>([]);
  const { renderPortalWithTheme } = usePortalRender();

  const shell = useShell();

  React.useEffect(() => {
    const unsubscribe = shell.notificationCenter.subscribe(
      'change',
      (payload: { notifications: Notification[] }) => {
        const items = payload.notifications.map((item: Notification) => {
          let actions = item.actions
            ? item.actions.map((action: Action): { label: string; onClick(): void } => {
                return {
                  label: action.title,
                  onClick() {
                    shell.notificationCenter.dispatchAction(
                      {
                        action: action.action,
                        namespace: item.namespace,
                        shared: Boolean(action.shared),
                      },
                      action.payload,
                    );
                  },
                };
              })
            : [];

          if (item.canSliceBody) {
            actions = [
              {
                label: !item.visibleMore ? 'Показать' : 'Свернуть',
                onClick() {
                  item.toggleShowMore();
                  shell.notificationCenter.triggerChange();
                },
              },
              ...actions,
            ];
          }

          return transform({
            key: item.id,
            message: item.body,
            status: item.view,
            autoClose: item.autoClose,
            actions,
            onClose: () => {
              shell.notificationCenter.remove(item.id);
            },
          });
        });
        setNotifications(items);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [shell.notificationCenter]);

  return renderPortalWithTheme(
    <div className={styles.container}>
      <BaseSnackbar items={notifications} className={styles.snackbar} data-testid="Notifications" />
    </div>,
    document.body,
  );
};
