# build ngl.js
./build.py --include ngl --output ../js/build/ngl.js
./build.py --include ngl --minify --externs externs/libs.js --output ../js/build/ngl.min.js

# build custom three.js
./build.py --include three --output ../js/build/three.custom.js
./build.py --include three --minify --output ../js/build/three.custom.min.js

# concatenate minified lib files
./build.py --include lib --output ../js/build/lib.min.js

# build gui-no-libs
./build.py --include gui-no-libs --output ../js/build/gui-no-libs.js
./build.py --include gui-no-libs --minify --externs externs/ui-libs.js --output ../js/build/gui-no-libs.min.js

# concatenate minified gui files
./build.py --include gui --output ../js/build/gui.min.js

# concatenate minified files for single file use
./build.py --include full --output ../js/build/ngl.full.min.js

# concatenate minified files for embedded use
./build.py --include embedded --output ../js/build/ngl.embedded.min.js
