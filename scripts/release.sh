#!/usr/bin/env bash

LEVEL=$1

npm version $LEVEL;
npm run-script doc;
npm run-script gallery;
npm run-script deploy $LEVEL;
if [ "$LEVEL" = "prerelease" ]; then
	npm publish --tag next;
else
	npm publish;
fi
