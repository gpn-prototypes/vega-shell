import React, { useEffect } from 'react';

import { useShell } from '../../app';
import { useForceUpdate } from '../../hooks';

import { CommonView } from './CommonView';
import { ProjectView } from './ProjectView';

import './Header.css';

export const Header: React.FC = () => {
  const { serverError, currentProject, bus } = useShell();
  const forceUpdate = useForceUpdate();

  useEffect(() => bus.subscribe({ channel: 'project', topic: 'status' }, forceUpdate), [
    forceUpdate,
    bus,
  ]);

  if (serverError !== null) {
    return null;
  }

  const isProjectView = currentProject.status().code !== currentProject.codes.Idle;

  if (isProjectView) {
    return <ProjectView />;
  }

  return <CommonView />;
};
