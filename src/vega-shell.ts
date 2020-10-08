import * as singleSpa from 'single-spa';
// eslint-disable-next-line import/no-unresolved
import { constructApplications, constructLayoutEngine, constructRoutes } from 'single-spa-layout';

import { getAppConfig } from '../app-config';

import { Identity } from './utils/identity';
import { BrowserMessageBus } from './message-bus';

const { registerApplication, start } = singleSpa;

const bus = BrowserMessageBus.create();

const sendMessageOnAuth = () => {
  bus.send({ channel: 'auth', topic: 'logged-in' });
};

const { baseApiUrl } = getAppConfig();
const identity = new Identity({ apiUrl: `${baseApiUrl}/auth`, cbOnAuth: sendMessageOnAuth });

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

window.addEventListener('single-spa:before-routing-event', (evt) => {
  const { location } = evt.currentTarget;
  bus.send({ channel: 'auth', topic: 'logged-in' });

  const { pathname, searchParams, hash } = new URL(location.href);

  const referer = pathname === '/login' ? '/' : `${pathname}${searchParams || ''}${hash || ''}`;

  if (!identity.getToken()) {
    singleSpa.navigateToUrl('/login');
  } else {
    singleSpa.navigateToUrl(referer);
  }
});

bus.subscribe({ channel: 'auth', topic: 'logged-in' }, () => {
  console.log('-----------------------------------------------');
  singleSpa.navigateToUrl('/');
});
