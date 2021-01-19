import React from 'react';
import { generatePath, useHistory, useLocation, useParams } from 'react-router-dom';

import { useGetProjectName } from './__generated__/get-project-name';
import { HeaderView } from './HeaderView';
import { NavLinkType, Params } from './types';

import './Header.css';

export const Header = (): React.ReactElement => {
  const history = useHistory();

  const location = useLocation();

  const params = useParams<Params>();

  const { data, loading } = useGetProjectName({
    skip: params.projectId === undefined,
    variables: { vid: params.projectId },
  });

  const getTitle = (): string | undefined | null => {
    if (data?.project?.__typename === 'Project') {
      return data.project.name;
    }

    return undefined;
  };

  const handleChangeActiveLink = (item: NavLinkType): void => {
    if (item.url && params.projectId !== undefined) {
      history.push(generatePath(item.url, { projectId: params.projectId }));
    }
  };

  return (
    <HeaderView
      pathname={location.pathname}
      onChangeActive={handleChangeActiveLink}
      projectName={getTitle()}
      isLoading={loading}
    />
  );
};
