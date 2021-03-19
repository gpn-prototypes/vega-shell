import React from 'react';
import { Loader } from '@gpn-prototypes/vega-ui';

import { useProjectName } from './__generated__/project-name';

interface Props {
  vid: string;
}

export const ProjectTitleLoader: React.FC = () => (
  <Loader aria-label="Загрузка имени проекта" size="s" />
);

export const ProjectTitle: React.FC<Props> = (props) => {
  const { vid } = props;
  const { data } = useProjectName({
    variables: { vid },
  });

  if (data?.project?.__typename === 'Project' && typeof data.project.name === 'string') {
    return <>{data.project.name}</>;
  }

  return <ProjectTitleLoader />;
};
