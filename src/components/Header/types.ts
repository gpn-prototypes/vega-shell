import { NavItemType } from '../BaseHeader';

export interface NavLinkType extends NavItemType {
  url?: string;
  routes?: string[];
  testId: string;
}

export type Params = {
  projectId?: string;
};
