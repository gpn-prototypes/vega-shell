import { readFileSync } from 'fs';
import { join } from 'path';

import React from 'react';
import { SchemaLink } from '@apollo/client/link/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import {
  render as defaultRender,
  RenderOptions,
  RenderResult as RTLRenderResult,
} from '@testing-library/react';
import { IMocks, makeExecutableSchema } from 'apollo-server';
import faker from 'faker';

import { Shell, ShellProvider } from '../app';
import { LS_KEYS } from '../services/identity';
import { mockValidToken } from '../services/identity/tokenHandlers';

import { addCleanupTask } from './cleanup';
import { resolveTypes } from './resolve-types';

export * from '@testing-library/react';

interface RenderContext {
  shell: Shell;
}

interface ShellOptions {
  baseApiUrl?: string;
  customResolvers?: IMocks;
}
export type BeforeRenderFn = (context: RenderContext) => void;

export interface Options extends RenderOptions {
  route?: string;
  isAuth?: boolean;
  shell?: ShellOptions;
  beforeRender?: BeforeRenderFn;
}

const baseResolvers = {
  Int: () => faker.random.number(10000),
  UUID: () => faker.random.uuid(),
  Float: () => faker.random.float(10000),
  Boolean: () => faker.random.boolean(),
  String: () => faker.random.words(),
};

export type RenderResult = RTLRenderResult & { shell: Shell };

const SCHEMA_PATH = process.env.VEGA_SCHEMA_PATH ?? join(__dirname, '../../schema.graphql');

const typeDefs = readFileSync(SCHEMA_PATH, 'utf-8');

export const render = (ui: React.ReactElement, options: Options = {}): RenderResult => {
  const { shell: shellOptions, beforeRender, isAuth = false, route = '/', ...rtlOptions } = options;

  window.history.pushState({}, 'Test page', route);

  const baseSchema = makeExecutableSchema({
    typeDefs,
    resolvers: [resolveTypes],
  });

  const schema = addMocksToSchema({
    schema: baseSchema,
    mocks: { ...baseResolvers, ...shellOptions?.customResolvers },
  });

  const shell = new Shell({
    baseApiUrl: shellOptions?.baseApiUrl ?? '',
    link: shellOptions?.customResolvers ? new SchemaLink({ schema }) : undefined,
  });

  if (beforeRender !== undefined) {
    beforeRender({ shell });
  }

  if (isAuth) {
    localStorage.setItem(LS_KEYS.LS_ACCESS_TOKEN_KEY, mockValidToken());
    localStorage.setItem(LS_KEYS.LS_REFRESH_TOKEN_KEY, mockValidToken());

    addCleanupTask(() => {
      localStorage.removeItem(LS_KEYS.LS_ACCESS_TOKEN_KEY);
      localStorage.removeItem(LS_KEYS.LS_REFRESH_TOKEN_KEY);
    });
  }

  addCleanupTask(() => {
    shell.dispose();
  });

  const TestProviders: React.FC = ({ children }) => {
    return <ShellProvider shell={shell}>{children}</ShellProvider>;
  };

  return {
    shell,
    ...defaultRender(ui, {
      wrapper: TestProviders,
      ...rtlOptions,
    }),
  };
};
