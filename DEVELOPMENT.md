
Making a Release
================

Follow semantic versioning and make sure the changelog is up-to-date.

Change the version number in:

- [src/ngl.js](src/ngl.js)
- [README.md](README.md)
- [CHANGELOG.md](CHANGELOG.md)

Push to github. Make a release on github, tag the commit and copy the relevant info from the changelog file.



Development
===========

Development of the NGL Viewer is coordinated through the repository on [github](http://github.com/arose/ngl). Please use the [issue tracker](https://github.com/arose/ngl/issues) there to report bugs or suggest improvements.

To participate in developing for the NGL Viewer you need a local copy of the source code, which you can obtain by forking the [repository](https://github.com/arose/ngl) on github. Read about how to [fork a repository](https://help.github.com/articles/fork-a-repo/), [sync a fork](https://help.github.com/articles/syncing-a-fork/) and [start a pull request](https://help.github.com/articles/using-pull-requests/).


Modules
-------

The source code ([src/](src/)) is organized into ES6 modules (see http://exploringjs.com/es6/ch_modules.html). The main entry point is the file [src/ngl.js](src/ngl.js) and [rollup](http://rollupjs.org/) is used to create a bundle that can be used in a browser.


Building
--------

[Gulp](http://gulpjs.com/) is used as a build tool. The necessary dependencies can be installed with `npm install`. A non-minified build ([build/js/ngl.js](build/js/ngl.js)) can be created with `gulp build`. A minified file for distribution ([dist/ngl.js](dist/ngl.js)) can be created with `gulp`. For development `gulp watch` can be called to watch source files and trigger a rebuild upon changes to them.

A smaller build can be created by using [three-jsnext](https://github.com/rollup/three-jsnext). To enable this clone the three-jsnext repository to be a sibling directory of the ngl repository and then change the import `from` line at the end of [lib/three.es6.js](lib/three.es6.js) to point to [three-jsnext-import.js](lib/three-jsnext-import.js). Finally, rebuild.


Server
------

The [examples](examples/) need to served by a webserver. Options for a simple development webserver are `python -m SimpleHTTPServer` (Python 2), `python -m http.server` (Python 3) or https://github.com/indexzero/http-server (node.js).


Unit tests
----------

[Mocha](https://mochajs.org/) is used for unit testing. The unit tests can be found in [test/html/mocha.html](test/html/mocha.html). Note, that the tests must be built with `gulp build-test`.
