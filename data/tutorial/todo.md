

Ideas
=====

* [X-ray shader](https://github.com/cryos/avogadro/tree/master/libavogadro/src/extensions/shaders)
* [WEBGL_draw_buffers (aka multiple render targets)](https://hacks.mozilla.org/2014/01/webgl-deferred-shading/)
* [WEBGL_depth_texture](http://blog.tojicode.com/2012/07/using-webgldepthtexture.html)
* Transparency
  * Weighted, Blended Order-Independent Transparency:
    [Cesium](http://cesiumjs.org/2014/03/14/Weighted-Blended-Order-Independent-Transparency/),
    [Blog](http://casual-effects.blogspot.de/2014/03/weighted-blended-order-independent.html),
    [Demo](http://bagnell.github.io/cesium/Apps/Sandcastle/gallery/OIT.html),
    [Article](http://jcgt.org/published/0002/02/09/)
* Ambient occlusion
  * pre-computed for static scenes (see Molecules app & cited paper)
* Toonshader
* Depth material (what for?)
  * use the same shaders but with lighting removed (via defines)
* Export & import of NGL scenes
  * load multiple scenes
  * allows for fast static scene loading
  * workflow: export from Jmol with NGL as renderer => import in standalone NGL
  * re-use three.js export & import functions - possible?
* [rendererStats](https://github.com/jeromeetienne/threex.rendererstats/blob/master/threex.rendererstats.js) does not play well with a Composer
* Alternative GUI
  * [xgui](https://github.com/oosmoxiecode/xgui.js)
  * THREE.js Editor UI
* Use a texture for atom positions
  * to render atoms and bonds get the positions from the corresponding texture coordinates
  * to update the atom positions only the texture needs to be changed
  * http://stackoverflow.com/questions/17262574/packing-vertex-data-into-a-webgl-texture
  * http://stackoverflow.com/questions/7709689/webgl-pass-array-shader?rq=1
* Potentially better [FXAA](https://github.com/AnalyticalGraphicsInc/cesium/blob/master/Source/Shaders/PostProcessFilters/FXAA.glsl)
* Virtual list
  * https://github.com/sergi/virtual-list
* Marching cubes
  * http://stemkoski.github.io/Three.js/Marching-Cubes.html
* Coarse graining support
  * autobonding
  * backbone determination
  * secondary structure determination
* Controls that move model/rotation group, not the camera
* Websockets to lower latency of trajectory serving
  * http://www.html5rocks.com/en/tutorials/websockets/basics/
  * http://blog.miguelgrinberg.com/post/easy-websockets-with-flask-and-gevent (uses socketio)
  * http://socket.io/
  * http://diesel.io/
  * seems that you need gevent or similar additionally?
* WebRTC to allow p2p sync
  * http://www.html5rocks.com/en/tutorials/webrtc/datachannels/
* Backface hitting - use to fill objects when clipped?

* Sele for trajectory by supplying a list of indices
* Fit trajectory by supplying a list of indices
* Calculate simulation time


Todo
====

* NGL.HyperballRepresentation.prototype.update broken
* negate single sele !345:A.CA
* sele "hetero 135" broken

* Point repr
* Trace/tube repr
* Cartoon repr

* Selection
  * protein
  * nucleic

* Coloring
  * CPK (done)
  * Secondary structure
  * Rainbow
  * B-factor

* Fog
  * adjust fog near/far for zoom
  * should be relative to the scene (molecule) extent
  * maybe by dynamically setting camera near & far
  * see also GLmol
  * Jmol is probably problematic since there the molecule moves not the camera

* NGL.LineBuffer.setAttributes missing
* Dual color CylinderGeometryBuffer
* GeometryBuffer quality option
* GeometryBuffer update mechanism
  * move attribute array filling code to a setAttributes function

* Move NGL.GUI into NGL.Viewer
* Use THREE.RawShaderMaterial()?
* Lighting
  * double sided (looks funny in MeshBuffer)
  * OIT (see above)
  * pre-multiplied alpha
  * physically based material parameters
    * where to get?
  * static light in three.js, i.e. move with camera
* Make viewer stats optional (hide/show)
* Create distance fields for [Computer modern fonts](http://checkmyworking.com/cm-web-fonts/)
* Uint16 and three.js Buffergeometry.computeOffsets() for mobile devices
    * Create NGL.IndexAttribute to globally change the index buffer type
* Screenshot tool
	* make a viewer method
	* allow higher resolution
	* test for max resolution
* Picking
  * CPU: Raycaster
    * Imposter types would need extra handling
  * GPU: color texture with colors as object ids
    * requires extra rendering pass (or multiple render targets)
* Spin/Rock (needs animation) button
* Supersampling anti-aliasing


Jmol
====

* Slide zoom fails in fullscreen mode
	* Workaround: `unbind _slideZoom;`
* Menu (and console) do not show in fullscreen mode
	* Workaround (menu): in Swing.setMenu make the menu a child of the applet container


Other Viewers
=============

* [iMolecule](https://github.com/patrickfuller/imolecule)
* [pv](https://github.com/biasmv/pv)
* [GLmol](https://github.com/biochem-fan/GLmol)
* [Chem Doodle Web Components](http://web.chemdoodle.com/)
* [iview](https://github.com/HongjianLi/istar) (based on GLmol)

