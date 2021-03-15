import { normalizeUri } from '../../utils';

import { AbstractEndpointStrategy, Params as StrategyParams } from './abstract-endpoint-strategy';
import { CommonEndpointStrategy } from './common-endpoint-strategy';
import { ProjectEndpointStrategy } from './project-endpoint-strategy';

const PROJECT_VID_PATTERN = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

function isProjectEndpoint(url: string): boolean {
  const [path] = url.split('?');
  const normalizedPath = normalizeUri(path);

  if (normalizedPath.endsWith('/graphql')) {
    return false;
  }

  const [, uuid] = normalizedPath.split('/graphql/');

  return PROJECT_VID_PATTERN.test(uuid);
}

export function createEndpointStrategy(
  uri: string,
  params: StrategyParams,
): AbstractEndpointStrategy {
  if (isProjectEndpoint(uri)) {
    return new ProjectEndpointStrategy(params);
  }

  return new CommonEndpointStrategy(params);
}
