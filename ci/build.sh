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
NAME="$VEGA_REPOPREFIX.$IMAGE_NAME"

IS_IMAGE_EXIST=$(docker image ls | grep -w "$VEGA_REPOPREFIX/$IMAGE_NAME")


if [ -n "$IS_IMAGE_EXIST" && -n "$REBUILD"]
then
  echo "Docker image already exist. Skip build command."
else
  echo "Docker image do not exist. Run build command."
  docker build -t $TAG ./ci
fi

docker rm $NAME

docker run \
  --name "$NAME" \
  -v "$(pwd):/app" \
  --env NPM_URI=$NPM_URI \
  --env NPM_AUTH_TOKEN=$NPM_AUTH_TOKEN \
  --env BASE_API_URL=$BASE_API_URL \
  $TAG \
  /app/ci/build-entrypoint.sh
