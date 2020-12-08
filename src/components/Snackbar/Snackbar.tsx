import React from 'react';
import ReactDOM from 'react-dom';
import { Item } from '@consta/uikit/SnackBar';
import { SnackBar as BaseSnackbar, usePortalRender } from '@gpn-prototypes/vega-ui';
import singleSpaReact from 'single-spa-react';

import { Notifications } from '../../utils/notifications';

import './Snackbar.css';

const styles = {
  container: 'vega-shell-snackbar-container',
  snackbar: 'vega-shell-snackbar',
};

type SnackBarProps = {
  notifications: Notifications;
};

const Snackbar: React.FC<SnackBarProps> = (props) => {
  const [notifications, setNotifications] = React.useState<Item[]>([]);
  const { renderPortalWithTheme } = usePortalRender();

  React.useEffect(() => {
    const unsubscribe = props.notifications.subscribe('change', ({ items }) => {
      setNotifications(items);
    });

    return () => {
      unsubscribe();
    };
  }, [props.notifications]);

  return renderPortalWithTheme(
    <div className={styles.container}>
      <BaseSnackbar items={notifications} className={styles.snackbar} data-testid="Notifications" />
    </div>,
    document.body,
  );
};

export const SnackbarLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Snackbar,
  suppressComponentDidCatchWarning: true,
});
