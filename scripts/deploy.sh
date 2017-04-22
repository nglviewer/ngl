#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

cd ${DIR};
mkdir -p ../build/;
cd ../build/;

if [ -d "arose.github.io" ]; then
	git pull;
else
	git clone "https://github.com/arose/arose.github.io.git";
fi

cd ./arose.github.io/ngldev/;

cp -r ${DIR}/../data/ ./data/;
cp -r ${DIR}/../examples/css/ ./css/;
cp -r ${DIR}/../examples/fonts/ ./fonts/;
cp -r ${DIR}/../examples/js/ ./js/;
cp -r ${DIR}/../examples/plugins/ ./plugins/;
cp -r ${DIR}/../build/docs/api/ ./api/;

cp ${DIR}/../dist/ngl.js ./js/ngl.js;

cd ../;
git add -A;
git commit -m "ngldev update";
git push;
