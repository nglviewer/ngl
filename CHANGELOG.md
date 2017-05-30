# Change Log
All notable changes to this project will be documented in this file, following the suggestions of [Keep a CHANGELOG](http://keepachangelog.com/). This project adheres to [Semantic Versioning](http://semver.org/).


## [Unreleased]
### Added
- contour option for volume surfaces (electron density maps)
- buble, for transpiling some ES2015 features (e.g. classes, arrow functions, ...)
- volume slice representation including interpolation support
- xplor/cns volume file parser
- `colorVolume` parameter for surface representation of volume data
- `voxelSize` parameter for volume file parser
- support for non orthogonal cell in cube file parser
- dsn6/brix volume file parser
- psf topology/structure file parser
- wwPDB validation report xml parser, representation and colorschemes
- support for picking Shape objects, Volume slices, Contact bonds
- scroll mouse behavior to change far/near clipping and fog
- label primitive for Shape class
- support for reversing color schemes with `colorReverse` parameter
- independent component movement via `.setPosition`, `.setRotation`, `.setScale`, `.setTransform`
- `bonded` and `ring` selection language keywords
- resname list to selection language, `[ALA,GLU]`

### Changed
- renamed `volume` parameter in molecular surface representation to `colorVolume`
- renamed colormaker classes from colorMaker to colormaker, i.e. removed camel case
- renamed ColormakerRegistry.getTypes to .getSchemes
- colormaker subclasses now auto-register with ColormakerRegistry
- refactored buffer classes to use a data object as input
- refactored picking to be more general
- replaced PickingData with PickingProxy
- updated three.js to r85
- updated chroma.js to 1.3.3
- replaced utils/bitset with utils/bitarray
- tweaked aminoacid keywords in selection language to follow rasmol/jmol, vmd

### Removed
- stage/component.centerView method, use .autoView instead
- GidPool, picking handled by Picker objects
- deprecated use of `#` for element selection, use `_` instead


## [v0.9.3] - 2016-10-14
### Changed
- increased light distance from camera, to fix unlit rendering
- remove double quotes from atomnames in chemComp cif parser


## [v0.9.2] - 2016-10-06
### Changed
- fix, moved polyfills back inside the bundle


## [v0.9.1] - 2016-10-06
### Changed
- removed (wrongly added) ngl2.js from dist folder
- fixed chemComp cif parser not passing chainid


## [v0.9.0] - 2016-10-05
### Added
- lazy representation parameter that only builds & updates the representation when visible
- chainname based color scheme
- BondHash class to quickly get atoms connected to an atom
- SpatialHash class to quickly get neighboring atoms/points
- XmlParser parameter to use the browser's DOMParser
- attachment (top, middle, bottom; left, center, right) for LabelRepresentation/TextBuffer
- border color and width for LabelRepresentation/TextBuffer
- colored background rectangle for LabelRepresentation/TextBuffer
- "offset" style rendering of double/triple bonds (@fredludlow)
- PubchemDatasource to load cid as sdf, pubchem://16490
- basic entity support (type, description, chain mapping; mmcif, mmtf)
- entitytype, moleculetype, chainid, polymer color schemes
- ShaderRegistry, DecompressorRegistry
- box display for "axes" representation

### Changed
- ResidueindexColorMaker colorscale domain on a per chain basis
- ChainindexColorMaker colorscale domain on a per model basis
- Fixed, initial parameters for a Buffer not taken into account
- ignore bonds that are defined multiple times in PDB parser
- updated mmtf lib to v1.0
- use npm as the build system
- complete list of ion and saccharide group names

### Removed
- gulp as the build system


## [v0.8] - 2016-07-22
### Added
- gulp build scripts
- mmtf v0.2 support
- support for rendering double/triple bonds, enable via `multipleBond` Representation parameter (@fredludlow, @arose)
- stage.clicked signal (renamed from .onPicking)
- stage.hovered signal
- parsing of "chem comp" cif files
- experimental "axes" representation showing the principal axes of an atom selection
- added cone, arrow & ellipsoid buffers
- added Shape class as a simple way to add custom shapes to the scene

### Changed
- reorganized everything to use es6 modules
- read bondOrder from 'pdbx_value_order' in mmcif files
- interpret 'CONECT 1529 1528 1528' as double bond in pdb files
- `side` Buffer/Representation parameter changed: THREE.FrontSide => "front", THREE.BackSide => "back", THREE.DoubleSide => "double"
- support for negative resno values in selections: "-5:A", "-12--8", "-12-0"
- use chemical component type (available in mmtf) for determining molecule type
- `.get/setOrientation` return/argument changed
- enable SDF font as the default TextBuffer class only on Chrome
- support for building using three-jsnext
- renamed `radiusSegments` parameter to `radialSegments`
- WebWorkers (for building surfaces) no longer need to load the main script file
- `NGL.GET` renamed to `NGL.getQuery`

### Removed
- python-based build scripts
- closure-compiler
- stage.signals.onPicking (renamed to .clicked)
- stage.signals.atom/bond/volume/nothingPicked, use .clicked instead
- `NGL.mainScriptFilePath` no longer needed
- `NGL.useWorker`, use "useWorker" representation parameter


## [v0.7.1a] - 2016-06-02
### Changed
- fixed version in builds


## [v0.7.1] - 2016-06-02
### Added
- orthographic camera mode
- `backgroundColor` parameter for `Stage`
- x/y/z offset parameters for labels (TextBuffer)
- `OX1` atoms are recognized as part of the protein backbone
- `stage.makeImage` now increments the task counter
- added `.isIdentity` method to test if an `Assembly` is an identity transformation over all chains
- embedded-dev build target (@sbliven)
- support for responseType = "json" to efficiently load json data

### Changed
- there is no longer a fake unitcell created when no space group information is available
- the query string is removed from urls before the determining file info (e.g. name, extension)
- fixed labelText param not working in LabelRepresentation
- enable SDF font as the default only on Chrome (fixes labels not shown on some OS/Browser)
- ignore 'given' ncs operators
- ensure that resname is upper case

### Removed
- `stage.setTheme` removed (use new `backgroundColor` parameter), themes now part of GUI code
- `NGL.Preferences` is now part of the GUI code and removed from `NGL.Stage`. Setting `overwritePreferences: true` when instantiating an `NGL.Stage` object is not necessary anymore.
- removed .requestVisibility method and signal (too GUI specific, if needed, should be handled there)


## [v0.7] - 2016-05-08
### Added
- Store and Proxy classes for memory efficiency
- MMTF, DXBIN, DCD files format parsers
- 'unitcell' representation
- stage.makeImage (returns Promise)
- take NCS operations into account when creating unitcell & supercell assemblies
- added multi sample antialias rendering
- added support for spinning around an axis
- use bitsets for storing selections of atoms
- Assembly and AssemblyPart classes
- stage.toggleFullscreen method
- read occupancy data when available (mmCIF, pdb, mmtf)
- occupancy color scheme
- alternate location support in selections, e.g. %B
- read insertion codes when available (mmCIF, pdb, mmtf)
- insertion code support in selections, e.g. ^A
- numeric residue name support in selections, e.g. [032]
- Queue class to handle async tasks

### Changed
- fixed transformation matrix in mrc/ccp4 parser
- optimized near clipping
- Fiber class remanamed to Polymer
- more consistent fog
- use workers more sparsely due to the large overhead of creating them
- create font SDF on demand, remove asset dependency
- integrated three.js lighting into custom shaders
- MIGRATION: chainname read from `auth_asym_id` instead of from `label_asym_id` field
- DOC: clarified apache configuration for deployment
- FIX: cif parser, ignore non-displayable bonds between symmetry mates
- FIX: cif parser, struct_conn bonds not added for multiple altloc atoms
- LIB: updated signals.js
- LIB: updated promise.js
- LIB: updated three.js
- LIB: updated pako.js to pako_inflate.js (no deflation support needed)
- CODE: support loading of Blob objects in addition to File objects
- CODE: tweaked DistanceRepresentation visibility params

### Removed
- zip, lzma, bzip2 decompression
- removed async.js
- mdsrv related code and documentation
- stage.exportImage (makes image and triggers download), use stage.makeImage


## [v0.6] - 2015-10-12
### Added
- MIGRATION: `Stage.loadFile` signature changed, now returns a `Promise` and does not accept callbacks
- MIGRATION: moved trajectory server into its own repository: [MDSrv](https://github.com/arose/mdsrv/)
- ADD: Support for MOL2 and SDF files
- ADD: Support for DX files
- ADD: Support for PQR files
- ADD: `ExampleRegistry` singleton
- ADD: `PluginRegistry` singleton
- ADD: `Datasource` class to use instead of hard-coded paths
- ADD: `GidPool`
- ADD: simple xml parser
- ADD: APBS plugin to load PQR and DX file, simple GUI
- ADD: bond and surface picking
- ADD: User-defined color schemes (API)
- GUI: `VirtualList` and `VirtualTable`
- GUI: re-sizable sidebar (contents still need to be made responsive)
- WIP: scripting API

### Changed
- EXAMPLES: general fixes and enhancements
- DOC: moved installation and development information into the README
- GUI/DOC: Higher color contrast for GUI and documentation pages
- CODE: qunit updated
- CODE: moved logical units of code into their own files
- CODE: speeded up secondary structure assignment from PDB/mmCIF files; fixed bugs leading to wrong assignment
- CODE: element color scheme now uses colorValue parameter to color carbon elements
- CODE: script and assets paths are now configurable
- CODE: more forgiving pdb parsing wrt to model records
- CODE: helper function for re-ordering atoms
- CODE: enhancements to handling Web Workers (`WorkerPool`, lazy Worker creation)
- CODE: enhancements to volume triangulation (limit to given box, skip empty parts)
- CODE: all `*Buffer` classes now inherit from `Buffer` and share common code
- CODE: BufferAttributes can be re-used or grown
- CODE: moved Buffer-specific code out of Representation class
- CODE: molecular surface enhancements (color by atom, filter by atom)
- CODE: nicer clipping of meshes and impostors (unlit interior to make them appear solid)
- CODE: optimized kdtree building
- CODE: clearer atomnames handling for fiber creation
- CODE: Color handling code refactored exposing more parameters
- CODE: Basic support for async creation of representations (so far used for molecular surfaces and volume triangulation)
- CODE: chunked data loading and parsing via streamer class
- CODE: faster autobonding of large residues (e.g. hydrated lipids)
- CODE: WebWorker support while using development and build files
- CODE: WebWorker used for decompression, parsing and surface generation
- FIX: Issue #7
- FIX: residues at the end of fibers may not require all backbone atoms
- FIX: standard compatible atom names when writing pdb files
- FIX: origin coordinates not used/read from mrc header

### Removed
- DEL: removed FragFit plugins


## v0.5 - 2015-30-04
### Added
- Initial release


[Unreleased]: https://github.com/arose/ngl/compare/v0.9.3...HEAD
[v0.9.3]: https://github.com/arose/ngl/compare/v0.9.2...v0.9.3
[v0.9.2]: https://github.com/arose/ngl/compare/v0.9.1...v0.9.2
[v0.9.1]: https://github.com/arose/ngl/compare/v0.9.0...v0.9.1
[v0.9.0]: https://github.com/arose/ngl/compare/v0.8...v0.9.0
[v0.8]: https://github.com/arose/ngl/compare/v0.7.1a...v0.8
[v0.7.1a]: https://github.com/arose/ngl/compare/v0.7.1...v0.7.1a
[v0.7.1]: https://github.com/arose/ngl/compare/v0.7...v0.7.1
[v0.7]: https://github.com/arose/ngl/compare/v0.6...v0.7
[v0.6]: https://github.com/arose/ngl/compare/v0.5...v0.6
