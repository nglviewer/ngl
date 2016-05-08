
Making a Release
================

Follow semantic versioning and make sure the changelog is up-to-date.

Change the version number in:

js/ngl/core.js
README.md
CHANGELOG.md

Push to github. Make a release on github, tag the commit and copy the relevant info from the changelog file.



Development
===========

Development of the NGL Viewer is coordinated through the repository on [github](http://github.com/arose/ngl). Please use the [issue tracker](https://github.com/arose/ngl/issues) there to report bugs or suggest improvements.

To participate in developing for the NGL Viewer you need a local copy of the source code, which you can obtain by forking the [repository](https://github.com/arose/ngl) on github. Read about how to [fork a repository](https://help.github.com/articles/fork-a-repo/), [sync a fork](https://help.github.com/articles/syncing-a-fork/) and [start a pull request](https://help.github.com/articles/using-pull-requests/).


Local server
------------

A (Python based) local development server can be started with the shell script

    sh serve.sh

to serve the NGL Viewer at http://localhost:8000/.

Limited (due to browser security restrictions) functionality is available when directly opening one of the [html files](html/) from the local file system. For Google Chrome/Chromium it can be helpful to start the browser with the `--allow-file-access-from-files` command line flag.


Unit tests
----------

[QUnit](http://qunitjs.com/) is used for unit testing. The unit tests can be found [here](test/unit/).
