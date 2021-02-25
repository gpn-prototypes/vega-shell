/* eslint-disable class-methods-use-this */
import { traverse } from '../utils';

import { AbstractEndpointStrategy, Data, Project } from './abstract-endpoint-strategy';

export class CommonEndpointStrategy extends AbstractEndpointStrategy {
  protected findCurrentProject(data: Data, project: Project): Project | null {
    let result: Project | null = null;

    traverse(data, (key, value, current) => {
      if (
        key === '__typename' &&
        value === 'Project' &&
        current.vid === project.vid &&
        typeof current.version === 'number'
      ) {
        result = { ...project, version: current.version };
      }
    });

    return result;
  }
}
