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
    let canUpdateState = true;

    currentProject.checkout(vid).then((checkoutStatus) => {
      if (canUpdateState) {
        setStatus(checkoutStatus);
      }
    });

    return () => {
      canUpdateState = false;
      currentProject.release();
    };
  }, [currentProject, vid]);

  if (status.code === codes.NotFound || status.code === codes.Error) {
    return <NotFoundView />;
  }

  if (status.code !== codes.Done) {
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
        <Application type="react" name="@vega/sp" />
      </Route>
      <NotFoundView />
    </Switch>
  );
}
