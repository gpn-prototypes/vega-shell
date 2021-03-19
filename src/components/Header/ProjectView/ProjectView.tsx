import React from 'react';

import { useShell } from '../../../app';
import { BaseView, Title } from '../BaseView';

import { ProjectNav } from './ProjectNav';
import { ProjectTitle, ProjectTitleLoader } from './ProjectTitle';

export const ProjectView: React.FC = () => {
  const { currentProject } = useShell();

  const status = currentProject.status();

  if (status.code !== currentProject.codes.Done) {
    return <BaseView title={() => <ProjectTitleLoader />} />;
  }

  return (
    <BaseView
      nav={(navProps) => <ProjectNav {...navProps} vid={status.project.vid} />}
      title={(titleProps) => (
        <Title {...titleProps}>
          <ProjectTitle vid={status.project.vid} />
        </Title>
      )}
    />
  );
};
