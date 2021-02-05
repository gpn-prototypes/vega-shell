import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { useShell } from '../../app';
import { Application } from '../Application';
import { RootLoader } from '../Loader';

import { NotFoundView } from './NotFoundView';

interface Props {
  vid: string;
  base: string;
}

export function ProjectRoutes(props: Props): React.ReactElement {
  const { vid, base } = props;
  const { currentProject } = useShell();
  const { codes } = currentProject;
  const [status, setStatus] = useState(() => currentProject.status());

  useEffect(() => {
    let mounted = true;

    currentProject.checkout(vid).then((checkoutStatus) => {
      if (mounted) {
        setStatus(checkoutStatus);
      }
    });

    return () => {
      mounted = false;
      currentProject.release();
    };
  }, [currentProject, vid]);

  if (status.code === codes.NOT_FOUND || status.code === codes.ERROR) {
    return <NotFoundView />;
  }

  if (status.code !== codes.CHECKED) {
    return <RootLoader />;
  }

  return (
    <Switch>
      <Route path={`${base}/rb`}>
        <Application name="@vega/rb" />
      </Route>
      <Route path={`${base}/lc`}>
        <Application name="@vega/lc" />
      </Route>
      <Route path={`${base}/fem`}>
        <Application name="@vega/fem" />
      </Route>
      <Route exact path={base}>
        <Application name="@vega/sp" />
      </Route>
      <NotFoundView />
    </Switch>
  );
}
