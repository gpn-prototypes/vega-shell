import { Worker } from './worker';

// eslint-disable-next-line no-restricted-globals
const sharedWorker = (self as unknown) as SharedWorkerGlobalScope;

const worker = new Worker();

sharedWorker.addEventListener('connect', (e) => {
  worker.handleConnectEvent(e);
});
