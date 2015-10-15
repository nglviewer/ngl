
![Gallery](gallery.png)


NGL Viewer is a web application for molecular visualization. [WebGL](https://get.webgl.org/) is employed to display molecules like proteins and DNA/RNA with a variety of representations.

See it in action:

* [Web application](http://arose.github.io/ngl/?example=3pqr)
* [API documentation](http://arose.github.io/ngl/doc/)



Features
--------

* Molecular structures (mmCIF, PDB, PQR, GRO, SDF, MOL2)
* Density volumes (MRC/MAP/CCP4, DX, CUBE)
* User interaction (mouse picking, selection language, image export)
* Coordinate trajectories (animation, remote access via [MDSrv](https://github.com/arose/mdsrv/))
* Embeddable (single file, API)



Table of contents
=================

* [Installation](#installation)
* [Development](#development)
* [Deployment](#deployment)
* [Changelog](#changelog)
* [Acknowledgments](#acknowledgments)
* [License](#license)



Installation
============

Since the NGL Viewer is a set of static files to be viewed in a web-browser there is not much of an installation needed. For development purposes it will be helpful to clone this repository and serve it locally (see below). The  When embedding the NGL Viewer as a library it is sufficient to include the self contained [embedded build](js/build/ngl.embedded.min.js). The full web application including the GUI requires the full build and some static assets - have a look at the example [html files](html/) for what is required.


Browser
-------

The NGL Viewer requires your browser to support WebGL. To see if your browser supports WebGL and what you might need to do to activate it, visit the [Get WebGL](https://get.webgl.org/) page.

Generally, WebGL is available in recent browser versions of Mozilla Firefox (>29) or Google Chrome (>27). The Internet Explorer supports WebGL only since version 11. The Safari Browser since version 8 (though WebGL can be activated in earlier version: first enable the Develop menu in Safari’s Advanced preferences, then secondly in the now visible Develop menu enable WebGL).

See also [this page](https://www.khronos.org/webgl/wiki/BlacklistsAndWhitelists) for details on which graphics card drivers are supported by the browsers.

__WebGL draft extensions__: For a smoother appearance of cylinders and spheres your browser needs to have the `EXT_frag_depth` extension available. The [WebGL Report](http://webglreport.com/) should list the extension if active. If not, you can enable WebGL draft extensions in your browser following these instructions:

* Chrome: browse to `about:flags`, enable the `Enable WebGL Draft Extensions` option, then relaunch.
* Firefox: browse to `about:config` and set `webgl.enable-draft-extensions` to `true`.
* Safari: Currently, the `EXT_frag_depth` extension is not supported.
* Internet Explorer: Currently, the `EXT_frag_depth` extension is not supported.


Trajectories
------------

The NGL Viewer can be configured to interactively display molecular dynamics trajectories served by [MDSrv](https://github.com/arose/mdsrv/). After installing MDSrv please look at the following files on how to set everything up.

* [js/extra/mdsrv.js](js/extra/mdsrv.js) - Implementation of `NGL.MdsrvDatasource` that is used to access trajectory data in `NGL.RemoteTrajectory`.
* [js/extra/examples_mdsrv.js](js/extra/examples_mdsrv.js) - A number of examples of molecular dynamics trajectories.
* [html/mdsrv.dev.html](html/mdsrv.dev.html) - Example html showing the configuration for viewing trajectories in the NGL Viewer.



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



Deployment
==========

Any webserver that serves static files will do. If you want to serve the NGL Viewer directly from the repository with the Apache webserver you can do so by creating a symlink:

	ln -s /path/to/ngl-repository/ /var/www/ngl

This assumes the Apache configuration includes somthing like

	DocumentRoot /var/www
    <Directory />
        Options FollowSymLinks
        AllowOverride None
    </Directory>
    <Directory /var/www/>
        Options Indexes FollowSymLinks MultiViews
        AllowOverride None
        Order allow,deny
        allow from all
    </Directory>

Read more about getting started with the Apache webserver [here](http://httpd.apache.org/docs/trunk/getting-started.html).



Changelog
=========

Version dev
-----------

* DOC: clarified apache configuration for deployment
* FIX: bonds not reset when building a NGL.StructureSubset
* FIX: cif parser, ignore non-displayable bonds between symmetry mates
* FIX: cif parser, struct_conn bonds not added for multiple altloc atoms



Version 0.6
-----------

* MIGRATION: `Stage.loadFile` signature changed, now returns a `Promise` and does not accept callbacks
* MIGRATION: moved trajectory server into its own repository: [MDSrv](https://github.com/arose/mdsrv/)
* ADD: Support for MOL2 and SDF files
* ADD: Support for DX files
* ADD: Support for PQR files
* ADD: `ExampleRegistry` singleton
* ADD: `PluginRegistry` singleton
* ADD: `Datasource` class to use instead of hard-coded paths
* ADD: `GidPool`
* ADD: simple xml parser
* ADD: APBS plugin to load PQR and DX file, simple GUI
* ADD: bond and surface picking
* ADD: User-defined color schemes (API)
* EXAMPLES: general fixes and enhancements
* DOC: moved installation and development information into the README
* GUI/DOC: Higher color contrast for GUI and documentation pages
* GUI: `VirtualList` and `VirtualTable`
* GUI: re-sizable sidebar (contents still need to be made responsive)
* DEL: removed FragFit plugins
* CODE: qunit updated
* CODE: moved logical units of code into their own files
* CODE: speeded up secondary structure assignment from PDB/mmCIF files; fixed bugs leading to wrong assignment
* CODE: element color scheme now uses colorValue parameter to color carbon elements
* CODE: script and assets paths are now configurable
* CODE: more forgiving pdb parsing wrt to model records
* CODE: helper function for re-ordering atoms
* CODE: enhancements to handling Web Workers (`WorkerPool`, lazy Worker creation)
* CODE: enhancements to volume triangulation (limit to given box, skip empty parts)
* CODE: all `*Buffer` classes now inherit from `Buffer` and share common code
* CODE: BufferAttributes can be re-used or grown
* CODE: moved Buffer-specific code out of Representation class
* CODE: molecular surface enhancements (color by atom, filter by atom)
* CODE: nicer clipping of meshes and impostors (unlit interior to make them appear solid)
* CODE: optimized kdtree building
* CODE: clearer atomnames handling for fiber creation
* CODE: Color handling code refactored exposing more parameters
* CODE: Basic support for async creation of representations (so far used for molecular surfaces and volume triangulation)
* CODE: chunked data loading and parsing via streamer class
* CODE: faster autobonding of large residues (e.g. hydrated lipids)
* CODE: WebWorker support while using development and build files
* CODE: WebWorker used for decompression, parsing and surface generation
* FIX: Issue #7
* FIX: residues at the end of fibers may not require all backbone atoms
* FIX: standard compatible atom names when writing pdb files
* FIX: origin coordinates not used/read from mrc header
* WIP: scripting API


Version 0.5
-----------

The first release.



Acknowledgments
===============

This project would not be possible without recourse to many fine open-source projects. Especially the [three.js](http://threejs.org/) project provides a great foundation.

* [three.js](http://threejs.org/)
    * NGL relies on the three.js library to interface WebGL
    * NGL's documentation uses the three.js documentation as a template
    * NGL's GUI is based on the three.js editor UI
* [sprintf.js](https://github.com/alexei/sprintf.js) - for formatting text
* [async.js](https://github.com/caolan/async)
* [jsfeat](http://inspirit.github.io/jsfeat/) - the SVD code for the superposition method is from jsfeat
* [QUnit](http://qunitjs.com/) - for unit testing; [assert-close](https://github.com/JamesMGreene/qunit-assert-close), [Blanket.js](http://blanketjs.org/)
* [Benchmark.js](http://benchmarkjs.com/) - for benchmarking
* [Chroma.js](https://github.com/gka/chroma.js) - for color handling
* [FlexiColorPicker](https://github.com/DavidDurman/FlexiColorPicker) - for color picking
* [Virtual DOM List](https://github.com/sergi/virtual-list)
* [Font Awesome](http://fontawesome.io) - for icons
* [JS Signals](http://millermedeiros.github.com/js-signals)
* [tether.js](http://github.hubspot.com/tether/)
* [Lightweight promise polyfill](https://github.com/taylorhakes/promise-polyfill)
* Compression: [bzip2.js](https://github.com/antimatter15/bzip2.js), [JSZip](http://stuk.github.io/jszip/), [js-lzma](https://code.google.com/p/js-lzma/), [pako - zlib port](https://github.com/nodeca/pako)
* [Open Source PyMOL](http://sourceforge.net/projects/pymol/) - screen aligned cylinder shader
* [VTK](http://www.vtk.org/) Quadric shader code from the PointSprite Plugin - quadric surface center calculation
* [HyperBalls](http://sourceforge.net/projects/hyperballs/) - hyperball stick shader - Chavent, M., Vanel, A., Tek, A., Levy, B., Robert, S., Raffin, B., &amp; Baaden, M. (2011). GPU-accelerated atom and dynamic bond visualization using hyperballs: a unified algorithm for balls, sticks, and hyperboloids. Journal of Computational Chemistry, 32(13), 2924–35. [doi:10.1002/jcc.21861](https://dx.doi.org/10.1002/jcc.21861)



License
=======

Generally MIT licensed, see the LICENSE file for details.
