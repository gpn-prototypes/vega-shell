import * as singleSpa from 'single-spa';
import { constructApplications, constructLayoutEngine, constructRoutes } from 'single-spa-layout';

import { getAppConfig } from '../app-config';

import { createGraphqlClient } from './utils/graphql-client';
import { Identity } from './utils/identity';
import { BrowserMessageBus } from './message-bus';

const { registerApplication, start } = singleSpa;

const HOME_PAGE = '/projects';

const bus = BrowserMessageBus.create();

bus.subscribe({ channel: 'project', topic: 'project-not-found' }, () => {
  console.log('not found');
});

const sendMessageOnAuth = () => {
  bus.send({ channel: 'auth', topic: 'logged-in', self: true });
};

bus.subscribe({ channel: 'auth', topic: 'logged-in' }, () => {
  const url = new URL(window.location.href).searchParams.get('redirect-to') ?? HOME_PAGE;
  singleSpa.navigateToUrl(url.toString());
});

bus.subscribe({ channel: 'auth', topic: 'logged-out' }, () => {
  console.log('dflksdfjlksdj')
  const url = new URL(window.location.href);
  url.searchParams.set('redirect-to', url.toString().replace(url.origin, ''));
  url.pathname = '/login';

  singleSpa.navigateToUrl(url.toString());
});

const { baseApiUrl } = getAppConfig();
const identity = new Identity({ apiUrl: `${baseApiUrl}/auth/obtain`, cbOnAuth: sendMessageOnAuth });
const graphqlClient = createGraphqlClient({
  uri: `${baseApiUrl}/graphql`,
  identity,
  bus,
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

type BeforeRoutingEvent = CustomEvent<{
  originalEvent: Event;
  totalAppChanges: number;
  oldUrl: string;
  newUrl: string;
  navigationIsCanceled: boolean;
  cancelNavigation: VoidFunction;
}>;

// TODO создать тип для событий
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.addEventListener('single-spa:before-routing-event', (evt: any) => {
  const { detail } = evt as BeforeRoutingEvent;
  const { cancelNavigation } = detail;

  const newUrl = new URL(detail.newUrl);
  const oldUrl = new URL(detail.oldUrl);

  const isLoggedIn = identity.isLoggedIn();

  if (!isLoggedIn) {
    if (newUrl.pathname !== '/login') {
      cancelNavigation();
      const url = new URL(newUrl.href);

      url.pathname = '/login';
      url.searchParams.set('redirect-to', newUrl.pathname !== '/' ? newUrl.pathname : HOME_PAGE);

      singleSpa.navigateToUrl(url.toString().replace(url.origin, ''));
    }

    return;
  }

  if (newUrl.pathname === '/login') {
    cancelNavigation();

    if (!oldUrl.pathname.startsWith(HOME_PAGE)) {
      singleSpa.navigateToUrl(HOME_PAGE);
    }

    return;
  }

  if (newUrl.pathname === '/') {
    cancelNavigation();

    if (!oldUrl.pathname.startsWith(HOME_PAGE)) {
      singleSpa.navigateToUrl(HOME_PAGE);
    }
  }
});
