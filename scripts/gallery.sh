#!/usr/bin/env bash

PORT=$1
if [ "$PORT" = "" ]; then
	PORT="8091"
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

cd ${DIR};

../node_modules//slimerjs/src/slimerjs js/slimer/gallery.js port:${PORT}
