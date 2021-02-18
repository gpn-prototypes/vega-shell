#!/bin/bash

if [ -z "$VEGA_REPOPREFIX" ]
then
  VEGA_REPOPREFIX="vega-shell"
fi

if [ -z "$IMAGE_NAME" ]
then
  IMAGE_NAME="frontend-builder"
fi

if [ -z "$FE_BUILDER_VERSION" ]
then
  FE_BUILDER_VERSION="1"
fi

TAG="$VEGA_REPOPREFIX/$IMAGE_NAME:$FE_BUILDER_VERSION"

IS_IMAGE_EXIST=$(docker image ls | grep -w "$VEGA_REPOPREFIX/$IMAGE_NAME")

if [ -n "$IS_IMAGE_EXIST" ]
then
  echo "Docker image already exist. Skip build command."
else
  echo "Docker image do not exist. Run build command."
  docker build -t $TAG ./ci
fi

docker run \
  --name vega \
  -v "$(pwd):/app" \
  --env NPM_URI=$NPM_URI \
  --env NPM_AUTH_TOKEN=$NPM_AUTH_TOKEN \
  $TAG \
  /app/ci/build-entrypoint.sh
