

Example usage
=============

	$( NGL ).bind( 'initialized', function(){
		
		var viewer = new NGL.Viewer( 'container' );

		// a single red sphere of radius 2 at the origin
		var buffer = new NGL.SphereImpostorBuffer(
			new Float32Array( 0, 0, 0 ),
			new Float32Array( 1, 0, 0 ),
			new Float32Array( 2 ),
		);

		viewer.add( buffer );

		viewer.animate();

	});

	NGL.init();


Useful
======

* [WebGL Report](http://webglreport.com/)
* [JSdoc](http://usejsdoc.org/)
* [three.js](http://threejs.org/)
	* [Github](https://github.com/mrdoob/three.js/)
	* [Examples](http://threejs.org/examples/)


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


Todo
====

* remove underscore dependence
* remove jQuery dependence
	* use three.js XHR and image loading functions
* potentially better [FXAA](https://github.com/AnalyticalGraphicsInc/cesium/blob/master/Source/Shaders/PostProcessFilters/FXAA.glsl)
* lighting
	* double sided (looks funny in MeshBuffer)
	* OIT (see above)
	* pre-multiplied alpha
* implement SphereMeshBuffer
* depth material
	* use the same shaders but with lighting removed (via defines)





