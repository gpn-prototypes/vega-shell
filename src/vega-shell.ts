import { registerApplication, start } from 'single-spa';
// eslint-disable-next-line import/no-unresolved
import { constructApplications, constructLayoutEngine, constructRoutes } from 'single-spa-layout';

const routes = constructRoutes(document.querySelector('#single-spa-layout') as HTMLTemplateElement);
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
