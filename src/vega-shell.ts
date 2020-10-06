import { registerApplication, start } from 'single-spa';
// eslint-disable-next-line import/no-unresolved
import { constructApplications, constructLayoutEngine, constructRoutes } from 'single-spa-layout';

import { BrowserMessageBus } from './message-bus';

const bus = BrowserMessageBus.create();

const layoutData = {
  props: {
    bus,
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
