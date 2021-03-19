import { readFileSync } from 'fs';
import { join } from 'path';

import { SchemaLink } from '@apollo/client/link/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import { IMocks, makeExecutableSchema } from 'apollo-server';
import faker from 'faker';

import { Shell } from '../app';
import { LS_KEYS } from '../services/identity';
import { mockValidToken } from '../services/identity/tokenHandlers';

import { addCleanupTask } from './cleanup';
import { resolveTypes } from './resolve-types';

export type SchemaResolvers = IMocks;

export interface User {
  firstName: string;
  lastName: string;
}
interface Options {
  isAuth?: boolean;
  user?: Partial<User>;
  baseApiUrl?: string;
  resolvers?: SchemaResolvers;
}

const baseResolvers = {
  Int: () => faker.random.number(10000),
  UUID: () => faker.random.uuid(),
  Float: () => faker.random.float(10000),
  Boolean: () => faker.random.boolean(),
  String: () => faker.random.words(),
};

const SCHEMA_PATH = process.env.VEGA_SCHEMA_PATH ?? join(__dirname, '../../schema.graphql');

let typeDefs: null | string = null;

function readTypeDefs(): string {
  if (typeDefs === null) {
    typeDefs = readFileSync(SCHEMA_PATH, 'utf-8');
  }

  return typeDefs;
}

function createSchemaLink(resolvers: SchemaResolvers): SchemaLink {
  const baseSchema = makeExecutableSchema({
    typeDefs: readTypeDefs(),
    resolvers: [resolveTypes],
  });

  const schema = addMocksToSchema({
    schema: baseSchema,
    mocks: { ...baseResolvers, ...resolvers },
  });

  return new SchemaLink({ schema });
}

export const configureShell = (options: Options = {}): Shell => {
  const { user: userOpts, isAuth = false, baseApiUrl = '', resolvers } = options;

  if (isAuth) {
    const user: User = {
      firstName: userOpts?.firstName ?? 'First',
      lastName: userOpts?.lastName ?? 'Last',
    };

    localStorage.setItem(LS_KEYS.LS_ACCESS_TOKEN_KEY, mockValidToken());
    localStorage.setItem(LS_KEYS.LS_REFRESH_TOKEN_KEY, mockValidToken());
    localStorage.setItem(LS_KEYS.LS_USER_FIRST_NAME_KEY, user.firstName);
    localStorage.setItem(LS_KEYS.LS_USER_LAST_NAME_KEY, user.lastName);

    addCleanupTask(() => {
      localStorage.removeItem(LS_KEYS.LS_ACCESS_TOKEN_KEY);
      localStorage.removeItem(LS_KEYS.LS_REFRESH_TOKEN_KEY);
      localStorage.removeItem(LS_KEYS.LS_USER_FIRST_NAME_KEY);
      localStorage.removeItem(LS_KEYS.LS_USER_LAST_NAME_KEY);
    });
  }

  const shell = new Shell({
    baseApiUrl,
    link: resolvers !== undefined ? createSchemaLink(resolvers) : undefined,
  });

  addCleanupTask(() => {
    shell.dispose();
  });

  return shell;
};
