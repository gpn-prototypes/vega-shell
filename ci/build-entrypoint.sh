#!/bin/bash

if [ -z "$NPM_URI" ]
then
  NPM_URI="npm.pkg.github.com"
fi

if [ -z "$NPM_AUTH_TOKEN" ]
then
  echo "NPM_AUTH_TOKEN is required to continue. Abort."
  exit 1;
fi

echo -e "@gpn-prototypes:registry=https://$NPM_URI \n//$NPM_URI/:_authToken=$NPM_AUTH_TOKEN" > .npmrc

yarn install --frozen-lockfile
yarn build
