#!/usr/bin/env bash

LEVEL=$1
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

cd ${DIR};

npm version $LEVEL;
npm run-script doc;
# Gallery not working atm
# npm run-script gallery;
./deploy.sh $LEVEL;
cd ${DIR}/..;
if [ "$LEVEL" = "prerelease" ]; then
	npm publish --tag next;
else
	npm publish;
fi
