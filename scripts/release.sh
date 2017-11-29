#!/usr/bin/env bash

LEVEL=$1
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

cd ${DIR};

if [ "$LEVEL" = "ts2" ]; then
	npm version "prerelease";
else
	npm version $LEVEL;
fi
npm run-script doc;
npm run-script gallery;
./deploy.sh $LEVEL;
cd ${DIR}/..;
if [ "$LEVEL" = "prerelease" ]; then
	npm publish --tag next;
elif [ "$LEVEL" = "ts2" ]; then
	npm publish --tag ts2;
else
	npm publish;
fi
