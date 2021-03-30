#!/usr/bin/env bash

LEVEL=$1
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

cd ${DIR};
mkdir -p ../build/;
cd ../build/;

if [ -d "nglviewer.github.io" ]; then
	cd ./nglviewer.github.io/;
	git fetch --all;
	git reset --hard origin/master;
	cd ../
else
	git clone "https://github.com/nglviewer/nglviewer.github.io.git";
fi

if [ "$LEVEL" = "prerelease" ]; then
	cd ./nglviewer.github.io/ngldev/;
else
	cd ./nglviewer.github.io/ngl/;
fi

cp -r ${DIR}/../data/. ./data/;
cp -r ${DIR}/../examples/css/. ./css/;
cp -r ${DIR}/../examples/fonts/. ./fonts/;
cp -r ${DIR}/../examples/js/. ./js/;
cp -r ${DIR}/../examples/scripts/. ./scripts/;
cp -r ${DIR}/../build/docs/. ./api/;
cp -r ${DIR}/../build/gallery/. ./gallery/;
cp ${DIR}/../build/scriptsList.json ./scripts/list.json;

cp ${DIR}/../dist/ngl.js ./js/ngl.js;

cd ../;
git add -A;
if [ "$LEVEL" = "prerelease" ]; then
	git commit -m "ngldev update";
else
	git commit -m "ngl update";
fi
# git push;
echo "Done";
