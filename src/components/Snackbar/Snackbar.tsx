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
    const unsubscribe = shell.notifications.subscribe('change', (payload) => {
      const items = payload.items.map((item: Notification) => {
        let actions = item.actions
          ? item.actions.map((action: Action): { label: string; onClick(): void } => {
              return {
                label: action.title,
                onClick() {
                  shell.notifications.dispatch(
                    {
                      action: action.action,
                      shared: Boolean(action.shared),
                    },
                    action.payload,
                  );
                },
              };
            })
          : [];

        const visibleActionShowMore =
          item.withShowMore && item.rawBody.length > item.truncatedLength;

        if (visibleActionShowMore) {
          actions = [
            {
              label: !item.visibleMore ? 'Подробнее' : 'Свернуть',
              onClick() {
                item.toggleShowMore();
                shell.notifications.publish('change', {
                  items: shell.notifications.getAll(),
                });
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
            shell.notifications.remove(item.id);
            if (item.onCloseAction) {
              shell.notifications.dispatch<string>(
                {
                  action: item.onCloseAction.action,
                  shared: false,
                },
                item.onCloseAction.payload,
              );
            }
          },
        });
      });

      setNotifications(items);
    });

    return () => {
      unsubscribe();
    };
  }, [shell.notifications]);

  return renderPortalWithTheme(
    <div className={styles.container}>
      <BaseSnackbar
        items={notifications.slice(-2)}
        className={styles.snackbar}
        data-testid="Notifications"
      />
    </div>,
    document.body,
  );
};
