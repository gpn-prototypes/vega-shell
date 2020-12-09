import React from 'react';
import { Item } from '@consta/uikit/SnackBar';
import { SnackBar as BaseSnackbar, usePortalRender } from '@gpn-prototypes/vega-ui';

import { useAppContext } from '../../app-context';

import './Snackbar.css';

const styles = {
  container: 'vega-shell-snackbar-container',
  snackbar: 'vega-shell-snackbar',
};

export const Snackbar = (): React.ReactElement => {
  const [notifications, setNotifications] = React.useState<Item[]>([]);
  const { renderPortalWithTheme } = usePortalRender();

  const context = useAppContext();

  React.useEffect(() => {
    const unsubscribe = context.notifications.subscribe('change', ({ items }) => {
      setNotifications(items);
    });

    return () => {
      unsubscribe();
    };
  }, [context.notifications]);

  return renderPortalWithTheme(
    <div className={styles.container}>
      <BaseSnackbar items={notifications} className={styles.snackbar} data-testid="Notifications" />
    </div>,
    document.body,
  );
};
