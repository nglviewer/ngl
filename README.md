
[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/arose/ngl/blob/master/LICENSE)
[![Changelog](https://img.shields.io/badge/changelog--lightgrey.svg?style=flat)](https://github.com/arose/ngl/blob/master/CHANGELOG.md)
[![npm version](https://badge.fury.io/js/ngl.svg)](https://badge.fury.io/js/ngl)
[![Build Status](https://travis-ci.org/arose/ngl.svg?branch=master)](https://travis-ci.org/arose/ngl)
[![Standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat)](https://standardjs.com)
[![Gitter](https://badges.gitter.im/nglviewer/Lobby.svg)](https://gitter.im/nglviewer/Lobby)


NGL Viewer is a web application for molecular visualization. [WebGL](https://get.webgl.org/) is employed to display molecules like proteins and DNA/RNA with a variety of representations.

See it in action:

* [Web application](https://arose.github.io/ngl/?script=showcase/ferredoxin)
* [X-ray viewer](https://codepen.io/arose/full/oWOQMg/)
* [Gallery](http://arose.github.io/ngl/gallery/index.html)
* [CodePen template](https://codepen.io/pen?template=JNLMXb)
* [Pens tagged _ngl_](https://codepen.io/tag/ngl/)


Documentation:

* [Reference](http://arose.github.io/ngl/api/identifiers.html)
* [Manual](http://arose.github.io/ngl/api/manual/index.html)


Features
--------

* Molecular structures (mmCIF, PDB, PQR, GRO, SDF, MOL2, MMTF)
* Density volumes (MRC/MAP/CCP4, DX/DXBIN, CUBE, BRIX/DSN6, XPLOR/CNS)
* User interaction (mouse picking, selection language, image export)
* Coordinate trajectories (DCD/PSF, animation, remote access via [MDSrv](https://github.com/arose/mdsrv/))
* Embeddable (single file, API)



Table of contents
=================

* [Usage](#usage)
* [Browser support](#browser-support)
* [Acknowledgments](#acknowledgments)



Usage
=====

Since the NGL Viewer is a set of static files to be viewed in a web-browser there is not much of an installation needed. For development purposes it will be helpful to clone this repository and serve it locally (see below). When embedding the NGL Viewer as a library it is sufficient to include the self contained build [dist/ngl.js](dist/ngl.js). A full web application including a GUI can be found in the [examples](examples/) directory.



Browser support
===============

The NGL Viewer requires your browser to support WebGL. To see if your browser supports WebGL and what you might need to do to activate it, visit the [Get WebGL](https://get.webgl.org/) page.

Generally, WebGL is available in recent browser versions of Mozilla Firefox (>29) or Google Chrome (>27). The Internet Explorer supports WebGL only since version 11. The Safari Browser since version 8 (though WebGL can be activated in earlier version: first enable the Develop menu in Safari’s Advanced preferences, then secondly in the now visible Develop menu enable WebGL).

See also [this page](https://www.khronos.org/webgl/wiki/BlacklistsAndWhitelists) for details on which graphics card drivers are supported by the browsers.

__WebGL draft extensions__: For a smoother appearance of cylinders and spheres your browser needs to have the `EXT_frag_depth` extension available. The [WebGL Report](http://webglreport.com/) should list the extension if active. If not, you can enable WebGL draft extensions in your browser following these instructions:

* Chrome: browse to `about:flags`, enable the `Enable WebGL Draft Extensions` option, then relaunch.
* Firefox: browse to `about:config` and set `webgl.enable-draft-extensions` to `true`.
* Safari: Currently, the `EXT_frag_depth` extension is not supported.
* Internet Explorer: Currently, the `EXT_frag_depth` extension is not supported.



Acknowledgments
===============

This project would not be possible without many fine open-source projects. Especially the [three.js](http://threejs.org/) project provides a great foundation.

* [three.js](http://threejs.org/)
    * NGL relies on the three.js library to interface WebGL
    * NGL's GUI is based on the three.js editor UI
* [sprintf.js](https://github.com/alexei/sprintf.js) - for formatting text
* [jsfeat](http://inspirit.github.io/jsfeat/) - the SVD code for the superposition method is from jsfeat
* [ESDoc](https://esdoc.org/) - for documentation
* [Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/) - for unit testing
* [Chroma.js](https://github.com/gka/chroma.js) - for color handling
* [FlexiColorPicker](https://github.com/DavidDurman/FlexiColorPicker) - for color picking
* [Virtual DOM List](https://github.com/sergi/virtual-list)
* [Font Awesome](http://fontawesome.io) - for icons
* [JS Signals](http://millermedeiros.github.com/js-signals)
* [tether.js](http://github.hubspot.com/tether/)
* [Lightweight promise polyfill](https://github.com/taylorhakes/promise-polyfill)
* [pako - zlib port](https://github.com/nodeca/pako)
* [Open Source PyMOL](http://sourceforge.net/projects/pymol/) - screen aligned cylinder shader
* [VTK](http://www.vtk.org/) Quadric shader code from the PointSprite Plugin - quadric surface center calculation
* [HyperBalls](http://sourceforge.net/projects/hyperballs/) - hyperball stick shader - Chavent, M., Vanel, A., Tek, A., Levy, B., Robert, S., Raffin, B., &amp; Baaden, M. (2011). GPU-accelerated atom and dynamic bond visualization using hyperballs: a unified algorithm for balls, sticks, and hyperboloids. Journal of Computational Chemistry, 32(13), 2924–35. [doi:10.1002/jcc.21861](https://dx.doi.org/10.1002/jcc.21861)


Funding sources:

* NCI/NIH award number U01 CA198942
* DFG Projekt HI 1502


Cite
====

When using NGL please cite:

* AS Rose, AR Bradley, Y Valasatava, JM Duarte, A Prlić and PW Rose. _Web-based molecular graphics for large complexes._ ACM Proceedings of the 21st International Conference on Web3D Technology (Web3D '16): 185-186, 2016. [doi:10.1145/2945292.2945324](http://dx.doi.org/10.1145/2945292.2945324)
* AS Rose and PW Hildebrand. _NGL Viewer: a web application for molecular visualization._ Nucl Acids Res (1 July 2015) 43 (W1): W576-W579 first published online April 29, 2015. [doi:10.1093/nar/gkv402](https://doi.org/10.1093/nar/gkv402)
