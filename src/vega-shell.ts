import * as singleSpa from 'single-spa';
// eslint-disable-next-line import/no-unresolved
import { constructApplications, constructLayoutEngine, constructRoutes } from 'single-spa-layout';

import { getAppConfig } from '../app-config';

import { createGraphqlClient } from './utils/graphql-client';
import { Identity } from './utils/identity';
import { BrowserMessageBus } from './message-bus';

const { registerApplication, start } = singleSpa;

const bus = BrowserMessageBus.create();

const sendMessageOnAuth = () => {
  bus.send({ channel: 'auth', topic: 'logged-in', self: true });
};

bus.subscribe({ channel: 'auth', topic: 'logged-in' }, () => {
  singleSpa.navigateToUrl('/');
});

bus.subscribe({ channel: 'auth', topic: 'logged-out' }, () => {
  singleSpa.navigateToUrl('/login');
});

const { baseApiUrl } = getAppConfig();
const identity = new Identity({ apiUrl: `${baseApiUrl}/auth`, cbOnAuth: sendMessageOnAuth });
const graphqlClient = createGraphqlClient({
  uri: `${baseApiUrl}/graphql`,
  identity,
});

const layoutData = {
  props: {
    bus,
    identity,
    graphqlClient,
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

// TODO создать тип для событий
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.addEventListener('single-spa:before-routing-event', (evt: any) => {
  const { location } = evt.currentTarget;

  const { pathname, searchParams, hash } = new URL(location.href);

  const referer = pathname === '/login' ? '/' : `${pathname}${searchParams || ''}${hash || ''}`;

  if (!identity.getToken()) {
    singleSpa.navigateToUrl('/login');
  } else {
    singleSpa.navigateToUrl(referer);
  }
});
