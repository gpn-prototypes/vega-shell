import fetch from 'cross-fetch';

import '@testing-library/jest-dom';

import { MockLocalStorage } from './src/testing/MockLocalStorage';

beforeEach(() => {
  Object.defineProperty(global.window, 'localStorage', { value: new MockLocalStorage() });
});

global.fetch = fetch;
