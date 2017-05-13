#!/usr/bin/env bash

npm version prerelease;
npm run-script doc;
npm run-script gallery;
npm run-script deploy;
npm publish --tag next;
