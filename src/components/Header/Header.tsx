import React from 'react';
import { generatePath, useHistory, useLocation } from 'react-router-dom';

import { useShell } from '../../app';

import { useGetProjectName } from './__generated__/get-project-name';
import { HeaderView } from './HeaderView';
import { NavLinkType } from './types';

import './Header.css';

export const Header: React.FC = () => {
  const { serverError } = useShell();
  const history = useHistory();
  const location = useLocation();

  const params = location.pathname.match(/\/projects\/show\/([\w|-]*)/);
  const projectId = params ? params[1] : undefined;

  const { data, loading } = useGetProjectName({
    skip: projectId === undefined,
    variables: { vid: projectId as string },
  });

  const getProjectName = (): string | undefined | null => {
    if (data?.project?.__typename === 'Project') {
      return data.project.name;
    }

    return undefined;
  };

  const handleChangeActiveLink = (item: NavLinkType): void => {
    if (item.url && projectId !== undefined) {
      history.push(generatePath(item.url, { projectId }));
    }
  };

  if (serverError !== null) {
    return null;
  }

  return (
    <HeaderView
      isLoading={loading}
      projectName={getProjectName()}
      pathname={location.pathname}
      onChangeActive={handleChangeActiveLink}
    />
  );
};
