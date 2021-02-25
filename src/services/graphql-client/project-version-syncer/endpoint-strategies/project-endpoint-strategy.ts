import * as utils from '../utils';

import { AbstractEndpointStrategy, Data, Project } from './abstract-endpoint-strategy';

export class ProjectEndpointStrategy extends AbstractEndpointStrategy {
  // eslint-disable-next-line class-methods-use-this
  protected findCurrentProject(data: Data, project: Project): Project | null {
    if (data.__typename === 'Query') {
      let result = null;

      utils.traverse(data, (key, value, current): null | void => {
        if (key === '__typename' && value === 'ProjectInner') {
          if (current.vid === project.vid && typeof current.version === 'number') {
            result = { vid: project.vid, version: current.version };
            return null;
          }
        }

        return undefined;
      });

      if (result === null && typeof data.version === 'number') {
        return { ...project, version: data.version };
      }

      return result;
    }

    if (typeof data.version === 'number') {
      return { ...project, version: data.version };
    }

    return null;
  }
}
