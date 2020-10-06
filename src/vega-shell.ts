import { registerApplication, start } from 'single-spa';
// eslint-disable-next-line import/no-unresolved
import { constructApplications, constructLayoutEngine, constructRoutes } from 'single-spa-layout';

import { getAppConfig } from '../app-config';

import { Identity } from './utils/identity';
import { BrowserMessageBus } from './message-bus';

const bus = BrowserMessageBus.create();

const { baseApiUrl } = getAppConfig();
const identity = new Identity({ apiUrl: baseApiUrl });

const layoutData = {
  props: {
    bus,
    identity,
  },
  loaders: {},
};

const routes = constructRoutes(
  document.querySelector('#single-spa-layout') as HTMLTemplateElement,
  layoutData,
);

const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return System.import(name);
  },
});

const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();
start();
