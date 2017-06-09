#!/usr/bin/env bash

LEVEL=$1
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

cd ${DIR};

npm version $LEVEL;
npm run-script doc;
npm run-script gallery;
npm run-script deploy $LEVEL;
./deploy.sh $LEVEL;
if [ "$LEVEL" = "prerelease" ]; then
	npm publish --tag next;
else
	npm publish;
fi
