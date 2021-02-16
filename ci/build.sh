#!/bin/bash

VERSION="${BUILD_VERSION:=1}"

IS_IMAGE_EXIST=$(docker image ls | grep -w "vega/frontend-builder")

if [ -n "$IS_IMAGE_EXIST" ]
then
  echo "Docker image already exist. Skip build command."
else
  echo "Docker image do not exist. Run build command."
  docker build -t vega/frontend-builder:$VERSION ./ci
fi

docker run \
  --name vega \
  -v "$(pwd):/app" \
  --env NPM_URI=$NPM_URI \
  --env NPM_AUTH_TOKEN=$NPM_AUTH_TOKEN \
  vega/frontend-builder:$VERSION \
  /app/ci/build-entrypoint.sh
