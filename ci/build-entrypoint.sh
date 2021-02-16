#!/bin/bash

if [ -z "$NPM_URI" ] || [ -z "$NPM_AUTH_TOKEN" ]
then
  echo "Required variables (NPM_URI or NPM_AUTH_TOKEN) not found. Abort."
  exit 1;
fi

echo -e "@gpn-prototypes:registry=https://$NPM_URI \n//$NPM_URI/:_authToken=$NPM_AUTH_TOKEN" > .npmrc

yarn install --frozen-lockfile
yarn build
