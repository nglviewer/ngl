/**
 * @file Core
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

$.loadImage = function(url) {
    // from: http://aboutcode.net/2013/01/09/load-images-with-jquery-deferred.html
    // Define a "worker" function that should eventually resolve or reject the deferred object.
    var loadImage = function( deferred ) {
        var image = new Image();
         
        // Set up event handlers to know when the image has loaded
        // or fails to load due to an error or abort.
        image.onload = loaded;
        image.onerror = errored; // URL returns 404, etc
        image.onabort = errored; // IE may call this if user clicks "Stop"
         
        // Setting the src property begins loading the image.
        image.src = url;
         
        function loaded() {
            unbindEvents();
            // Calling resolve means the image loaded sucessfully and is ready to use.
            deferred.resolve( image );
        }
        function errored() {
            unbindEvents();
            // Calling reject means we failed to load the image (e.g. 404, server offline, etc).
            deferred.reject( image );
        }
        function unbindEvents() {
            // Ensures the event callbacks only get called once.
            image.onload = null;
            image.onerror = null;
            image.onabort = null;
        }
    };

    // Create the deferred object that will contain the loaded image.
    // We don't want callers to have access to the resolve() and reject() methods, 
    // so convert to "read-only" by calling `promise()`.
    return $.Deferred( loadImage ).promise();
};


/**
 * [NGL description]
 * @namespace NGL
 * @type {Object}
 */
NGL = {
    REVISION: '1dev',
    EPS: 0.0000001,
};


/**
 * [Resources description]
 * @type {Object}
 * @private
 */
NGL.Resources = {

    // fonts
    'font/Arial.png': 'image',
    'font/Arial.fnt': '',

    // shaders
    'shader/BezierRaymarch.vert': '',
    'shader/BezierRaymarch.frag': '',
    'shader/HelixImpostor.vert': '',
    'shader/HelixImpostor.frag': '',
    'shader/HelixImpostor2.vert': '',
    'shader/HelixImpostor2.frag': '',
    'shader/HyperballSphereImpostor.vert': '',
    'shader/HyperballSphereImpostor.frag': '',
    'shader/HyperballStickImpostor.vert': '',
    'shader/HyperballStickImpostor.frag': '',
    'shader/Ribbon.vert': '',
    'shader/Ribbon.frag': '',
    'shader/SphereImpostor.vert': '',
    'shader/SphereImpostor.frag': '',
    'shader/SphereMesh.vert': '',
    'shader/SphereMesh.frag': '',
    'shader/SphereHalo.vert': '',
    'shader/SphereHalo.frag': '',
    'shader/CylinderImpostor.vert': '',
    'shader/CylinderImpostor.frag': '',
    'shader/CylinderBoxImpostor.vert': '',
    'shader/CylinderBoxImpostor.frag': '',
    'shader/SDFFont.vert': '',
    'shader/SDFFont.frag': '',
    'shader/LineSprite.vert': '',
    'shader/LineSprite.frag': '',
    'shader/Mesh.vert': '',
    'shader/Mesh.frag': '',
    'shader/ParticleSprite.vert': '',
    'shader/ParticleSprite.frag': '',
    'shader/Quad.vert': '',
    'shader/Quad.frag': '',
    'shader/QuadricImpostor.vert': '',
    'shader/QuadricImpostor.frag': '',

    // shader chunks
    'shader/chunk/light_params.glsl': '',
    'shader/chunk/light.glsl': '',
    'shader/chunk/fog.glsl': '',
    'shader/chunk/fog_params.glsl': '',

};


/**
 * [UniformsLib description]
 * @type {Object}
 * @private
 */
NGL.UniformsLib = {

    'fog': THREE.UniformsLib[ "fog" ],

    'lights': THREE.UniformsUtils.merge([
        THREE.UniformsLib[ "lights" ],
        {
            "ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
            "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
        }
    ])

};


/**
 * [Utils description]
 * @namespace NGL.Utils
 * @type {Object}
 */
NGL.Utils = {

    /**
     * Converted to JavaScript from 
     * {@link http://paulbourke.net/geometry/pointlineplane/lineline.c}
     * 
     * @param  {THREE.Vector3} p1
     * @param  {THREE.Vector3} p2
     * @param  {THREE.Vector3} p3
     * @param  {THREE.Vector3} p4
     * @return {Array.<THREE.Vector3, THREE.Vector3>}
     */
    lineLineIntersect: function( p1, p2, p3, p4 ){

        var EPS = NGP.EPS;

        var p13 = new THREE.Vector3(),
            p43 = new THREE.Vector3(),
            p21 = new THREE.Vector3();
        var d1343, d4321, d1321, d4343, d2121;
        var denom, numer;

        p13.x = p1.x - p3.x;
        p13.y = p1.y - p3.y;
        p13.z = p1.z - p3.z;
        p43.x = p4.x - p3.x;
        p43.y = p4.y - p3.y;
        p43.z = p4.z - p3.z;
        if( Math.abs(p43.x) < EPS && Math.abs(p43.y) < EPS && Math.abs(p43.z) < EPS )
            return null;

        p21.x = p2.x - p1.x;
        p21.y = p2.y - p1.y;
        p21.z = p2.z - p1.z;
        if( Math.abs(p21.x) < EPS && Math.abs(p21.y) < EPS && Math.abs(p21.z) < EPS )
            return null;

        d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
        d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
        d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
        d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
        d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

        denom = d2121 * d4343 - d4321 * d4321;
        if( Math.abs(denom) < EPS )
            return null;
        numer = d1343 * d4321 - d1321 * d4343;

        var mua = numer / denom;
        var mub = ( d1343 + d4321 * mua ) / d4343;

        var pa = new THREE.Vector3(
            p1.x + mua * p21.x,
            p1.y + mua * p21.y,
            p1.z + mua * p21.z
        );
        var pb = new THREE.Vector3(
            p3.x + mub * p43.x,
            p3.y + mub * p43.y,
            p3.z + mub * p43.z
        );

        return [ pa, pb ];

    },

};


// NGL.chunkSize = 65536;
NGL.chunkSize = 65520; // divisible by 4 (quad mapping) and 6 (box mapping) and 8 (box mapping 2)
// NGL.chunkSize = 4294967296;


NGL.calculateOffsets = function ( n, nTriangle, nVertex ) {
    var ratio = nTriangle / nVertex;
    var offsets = [];
    var offsetCount = n / NGL.chunkSize;
    for (var i = 0; i < offsetCount; i++) {
        var offset = {
            start: i * NGL.chunkSize * ratio * 3,
            index: i * NGL.chunkSize,
            count: Math.min(
                n*ratio - (i * NGL.chunkSize * ratio), 
                NGL.chunkSize * ratio
            ) * 3
        };
        offsets.push( offset );
    }
    return offsets;
}


NGL.calculateChunkSize = function( nVertex ){

    return NGL.chunkSize - ( NGL.chunkSize % nVertex );

}



/**
 * Initialize the global NGL object, i.e. get resources
 */
NGL.init = function () {

    NGL.initResources();

    NGL.materialCache = {};

    this.textures = [];

    return this;

}


/**
 * Get resources for the global NGL object
 * @private
 */
NGL.initResources = function(){

    var deferreds = [];

    _.each( NGL.Resources, function( v, url ){
        var d;
        if( v=="image" ){
            d = $.loadImage( url ).done( 
                function( image ){ NGL.Resources[ url ] = image; }
            );
        }else{
            d = $.ajax({
                url: url,
                success: function( data ){
                    if( v=="chunk" ){
                        NGL.Resources[ url ] = data;
                    }else{
                        NGL.Resources[ url ] = data;
                    }
                },
                dataType: "text"
            });
        }
        deferreds.push( d );
    });

    $.when.apply( $, deferreds ).then( function() {
        $( NGL ).triggerHandler( "initialized" );
    });

},


/**
 * [getMaterial description]
 * @private
 * @param  {Object} params
 * @return {THREE.Material}
 */
NGL.getMaterial = function( params ){

    var key = JSON.stringify( params );

    if (!NGL.materialCache[ key ]) {
        NGL.materialCache[ key ] = new THREE.MeshLambertMaterial( params )
    }

    return NGL.materialCache[ key ];

};


/**
 * [getShader description]
 * @private
 * @param  {String} name
 * @param  {String[]} defines
 * @return {String}
 */
NGL.getShader = function( name, defines ) {

    var shader = NGL.Resources[ 'shader/' + name ];
    var re = /^(?!\/\/)\s*#include\s+(\S+)/gmi;

    shader = shader.replace( re, function( match, p1 ){

        var path = 'shader/chunk/' + p1 + '.glsl';
        var chunk = NGL.Resources[ path ] || THREE.ShaderChunk[ p1 ];

        return chunk ? chunk : "";

    });

    return _.map( defines, function( def ){ return "#define " + def })
                .join("\n") + "\n" + shader;

};


////////
// GUI

/**
 * A dat.GUI {@link https://code.google.com/p/dat-gui/} based GUI
 * for a viewer instance.
 * @class
 * @param {NGL.Viewer} viewer
 */
NGL.GUI = function( viewer ){

    this.viewer = viewer;

    this.updateDisplay = true;

    this.dotScreenEffect = false;
    this.fxaaEffect = false;
    this.ssaoEffect = false;

    this.fogType = "";
    this.fogNear = 0;
    this.fogFar = 1000;
    this.fogDensity = 0.00025;
    this.fogColor = '#000000';
    this.backgroundColor = '#000000';
    this.cameraPerspective = true;
    this.cameraFov = 40;
    this.cameraNear = 1;
    this.cameraFar = 10000;

    var gui = new dat.GUI({ autoPlace: false });
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '0px';
    gui.domElement.style.right = '0px';
    this.viewer.container.appendChild( gui.domElement );
    this.gui = gui;

    var tools = gui.addFolder( 'Tools' );
    tools.add( this, 'clear' );
    tools.add( this, 'screenshot' );
    tools.add( this, 'fullscreen' );

    var effects = gui.addFolder( 'Effects' );
    effects.add( this, 'dotScreenEffect' ).onChange(
        function( value ){ 
            viewer.dotScreenEffect.enabled = value;
            viewer.render();
        }
    );
    effects.add( this, 'fxaaEffect' ).onChange(
        function( value ){ 
            viewer.fxaaEffect.enabled = value;
            viewer.render();
        }
    );
    effects.add( this, 'ssaoEffect' ).onChange(
        function( value ){ 
            viewer.ssaoEffect.enabled = value;
            viewer.render();
        }
    );

    var options = gui.addFolder( 'Options ' );
    options.add( this, 'updateDisplay' ).onChange(
        function( value ){ viewer.params.updateDisplay = value; }
    );
    options.add(this, 'fogType', ['', 'linear', 'exp2']).onChange(
        function( value ){ viewer.setFog( value ); }
    );
    options.add(this, 'fogNear').min(0).max(3000).step(10).onChange(
        function( value ){ viewer.setFog( null, null, value ); }
    );
    options.add(this, 'fogFar').min(0).max(3000).step(10).onChange(
        function( value ){ viewer.setFog( null, null, null, value ); }
    );
    options.add(this, 'fogDensity').min(0).max(0.01).step(0.00005).onChange(
        function( value ){ viewer.setFog( null, null, null, null, value ); }
    );
    options.addColor(this, 'fogColor').onChange(
        function( value ){ viewer.setFog( null, value ); }
    ).listen();
    options.addColor(this, 'backgroundColor').onChange(
        function( value ){ viewer.setBackground( value ); this.fogColor = value; }
    );
    options.add(this, 'cameraPerspective').onChange(
        function( value ){ viewer.setCamera( value ); }
    );
    options.add(this, 'cameraFov').min(0).max(180).step(1).onChange(
        function( value ){ viewer.setCamera( null, value ); }
    );
    options.add(this, 'cameraNear').min(1).max(10000).step(10).onChange(
        function( value ){ viewer.setCamera( null, null, value ); }
    );
    options.add(this, 'cameraFar').min(1).max(10000).step(10).onChange(
        function( value ){ viewer.setCamera( null, null, null, value ); }
    );

}

NGL.GUI.prototype = {

    clear: function(){
        
        this.viewer.clear();

    },

    screenshot: function(){
        
        window.open(
            this.viewer.renderer.domElement.toDataURL("image/png"),
            "NGL_screenshot_" + THREE.Math.generateUUID()
        );

    },

    fullscreen: function(){
        
        var elem = this.viewer.container;

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }

    }

}


///////////
// Viewer

/**
 * [Viewer description]
 * @class
 * @param {String} eid
 */
NGL.Viewer = function( eid ){

    this.container = document.getElementById( eid );

    if ( this.container === document ) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    } else {
        var box = this.container.getBoundingClientRect();
        this.width = box.width;
        this.height = box.height;
    }

    this.aspect = this.width / this.height;

    this.initParams();

    this.initCamera();

    this.initScene();

    this.initRenderer();

    this.initLights();

    this.initControls();

    this.initStats();

    window.addEventListener( 'resize', _.bind( this.onWindowResize, this ), false );

    // fog & background
    this.setBackground();
    this.setFog();

}

NGL.Viewer.prototype = {
    
    constructor: NGL.Viewer,

    initParams: function(){

        this.params = {
        
            fogType: null,
            fogColor: 0x000000,
            fogNear: 0,
            fogFar: 1000,
            fogDensity: 0.00025,

            // backgroundColor: 0xFFFFFF,
            backgroundColor: 0x000000,

            cameraType: 1,
            cameraFov: 40,
            cameraNear: 1,
            cameraFar: 10000,
            cameraZ: -300,

            specular: 0x050505,

            updateDisplay: true,

        };

    },

    initCamera: function(){

        var p = this.params;
        var lookAt = new THREE.Vector3( 0, 0, 0 );

        this.perspectiveCamera = new THREE.PerspectiveCamera( 
            p.cameraFov, this.aspect, p.cameraNear, p.cameraFar
        );
        this.perspectiveCamera.position.z = p.cameraZ;
        this.perspectiveCamera.lookAt( lookAt );

        this.orthographicCamera = new THREE.OrthographicCamera(
            this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 
            p.cameraNear, p.cameraFar
        );
        this.orthographicCamera.position.z = p.cameraZ/2;
        this.orthographicCamera.lookAt( lookAt );

        if( p.cameraType ){
            this.camera = this.perspectiveCamera;
        }else{
            this.camera = this.orthographicCamera;
        }

        this.camera.updateProjectionMatrix();

    },

    initRenderer: function(){

        this.renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
            alpha: false,
            antialias: false
        });
        this.renderer.setSize( this.width, this.height );
        this.renderer.autoClear = true;

        var _glExtensionFragDepth = this.renderer.context.getExtension('EXT_frag_depth');
        if( !_glExtensionFragDepth ){ 
            console.error( "ERROR getting 'EXT_frag_depth'" );
        }

        this.renderer.context.getExtension('OES_standard_derivatives');
        this.renderer.context.getExtension('OES_element_index_uint');

        this.container.appendChild( this.renderer.domElement );

        // postprocessing
        this.composer = new THREE.EffectComposer( this.renderer );
        this.composer.setSize( this.width, this.height );
        this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

        this.depthScale = 0.5;
        this.depthTarget = new THREE.WebGLRenderTarget( 
            this.width * this.depthScale, this.height * this.depthScale, 
            { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
        );

        this.ssaoEffect = new THREE.ShaderPass( THREE.SSAOShader );
        this.ssaoEffect.uniforms[ 'tDepth' ].value = this.depthTarget;
        this.ssaoEffect.uniforms[ 'size' ].value.set( 
            this.width * this.depthScale, this.height * this.depthScale
        );
        this.ssaoEffect.uniforms[ 'cameraNear' ].value = this.camera.near;
        this.ssaoEffect.uniforms[ 'cameraFar' ].value = this.camera.far;
        this.ssaoEffect.enabled = false;
        this.composer.addPass( this.ssaoEffect );

        this.dotScreenEffect = new THREE.ShaderPass( THREE.DotScreenShader );
        this.dotScreenEffect.uniforms[ 'scale' ].value = 4;
        this.dotScreenEffect.enabled = false;
        this.composer.addPass( this.dotScreenEffect );

        this.fxaaEffect = new THREE.ShaderPass( THREE.FXAAShader );
        this.fxaaEffect.uniforms[ 'resolution' ].value = new THREE.Vector2( 
            1 / this.width, 1 / this.height
        );
        this.fxaaEffect.enabled = false;
        this.composer.addPass( this.fxaaEffect );

        var effect = new THREE.ShaderPass( THREE.CopyShader );
        effect.renderToScreen = true;
        this.composer.addPass( effect );

        // depth pass
        this.depthPassPlugin = new THREE.DepthPassPlugin();
        this.depthPassPlugin.renderTarget = this.depthTarget;

        this.renderer.addPrePlugin( this.depthPassPlugin );

    },

    initScene: function(){

        this.scene = new THREE.Scene();

        this.modelGroup = new THREE.Object3D();
        this.rotationGroup = new THREE.Object3D();

        this.rotationGroup.add( this.modelGroup );
        this.scene.add( this.rotationGroup );

    },

    initLights: function(){
        
        var directionalLight = new THREE.DirectionalLight( 0xFFFFFF );
        directionalLight.position = new THREE.Vector3( 1, 1, -2.5 ).normalize();
        directionalLight.intensity = 0.5;
        
        var ambientLight = new THREE.AmbientLight( 0x101010 );
        
        var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0.01)
        
        this.scene.add( directionalLight );
        this.scene.add( ambientLight );
        this.scene.add( hemisphereLight );

    },

    initControls: function(){

        this.controls = new THREE.TrackballControls( 
            this.camera, this.renderer.domElement 
        );

        this.controls.rotateSpeed = 2.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;
        this.controls.keys = [65, 83, 68];

        this.controls.addEventListener( 'change', this.render.bind( this ) );

    },

    initStats: function(){

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.container.appendChild( this.stats.domElement );

        this.rendererStats = new THREEx.RendererStats();
        this.rendererStats.domElement.style.position = 'absolute';
        this.rendererStats.domElement.style.bottom = '0px';
        this.container.appendChild( this.rendererStats.domElement );

    },

    /**
     * Adds a buffer to the scene
     * @param {NGL.Buffer} buffer
     * @example
     * var viewer = new NGL.Viewer( "eid" );
     * var buffer = new NGL.Buffer();
     * viewer.add( buffer );
     */
    add: function( buffer ){

        console.log( buffer );
        this.modelGroup.add( buffer.mesh );

        this.render();

    },

    /**
     * [setFog description]
     * @param {String} type - Either 'linear' or 'exp2'.
     * @param {String} color - Fog color.
     * @param {Number} near - Where the fog effect starts (only 'linear').
     * @param {Number} far - Where the fog effect ends (only 'linear').
     * @param {Number} density - Density of the fog (only 'exp2').
     */
    setFog: function( type, color, near, far, density ){

        var p = this.params;

        if( !_.isNull(type) ) p.fogType = type;
        if( color ) p.fogColor = color;
        if( near ) p.fogNear = near;
        if( far ) p.fogFar = far;
        if( density ) p.fogDensity = density;

        if( p.fogType=="linear" ){
            this.scene.fog = new THREE.Fog( p.fogColor, p.fogNear, p.fogFar );
        }else if( p.fogType=="exp2" ){
            this.scene.fog = new THREE.FogExp2( p.fogColor, p.fogDensity );
        }else{
            this.scene.fog = null;
        }

        _.each( this.modelGroup.children, function( o ){
            if( o.material ) o.material.needsUpdate = true;
        });

        _.each( NGL.materialCache, function( m ){
            m.needsUpdate = true;
        });

        this.render();

    },

    /**
     * Sets the background color (and also the fog color).
     * @param {String} color
     */
    setBackground: function( color ){

        var p = this.params;

        if( color ) p.backgroundColor = color;

        this.setFog( null, p.backgroundColor );
        this.renderer.setClearColor( p.backgroundColor, 1 );

        this.render();

    },

    setCamera: function( type, fov, near, far ){

        var p = this.params;

        if( !_.isNull(type) ) p.cameraType = type;
        if( fov ) p.cameraFov = fov;
        if( near ) p.cameraNear = near;
        if( far ) p.cameraFar = far;

        if( p.cameraType ){
            this.camera = this.perspectiveCamera;
        }else{
            this.camera = this.orthographicCamera;
        }
        
        this.perspectiveCamera.fov = p.cameraFov;
        this.perspectiveCamera.near = p.cameraNear;
        this.perspectiveCamera.far = p.cameraFar;

        this.orthographicCamera.near = p.cameraNear;
        this.orthographicCamera.far = p.cameraFar;
        
        this.controls.object = this.camera;
        this.camera.updateProjectionMatrix();

        this.render();

    },

    onWindowResize: function(){

        if ( this.container === document ) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        } else {
            var box = this.container.getBoundingClientRect();
            this.width = box.width;
            this.height = box.height;
        }
        this.aspect = this.width / this.height;

        this.perspectiveCamera.aspect = this.aspect;

        var az = this.controls.accumulatedZoom;
        this.orthographicCamera.left = az * -this.width / 2;
        this.orthographicCamera.right = az * this.width / 2;
        this.orthographicCamera.top = az * this.height / 2;
        this.orthographicCamera.bottom = az * -this.height / 2;

        this.camera.updateProjectionMatrix();
        this.controls.handleResize();
        this.renderer.setSize( this.width, this.height );
        this.composer.setSize( this.width, this.height );

        this.fxaaEffect.uniforms[ 'resolution' ].value.set( 
            1 / this.width, 1 / this.height
        );

        this.render();

    },

    animate: function(){

        requestAnimationFrame( this.animate.bind( this ) );

        this.controls.update();

    },

    /**
     * Renders the scene.
     */
    render: function(){

        if( !this.params.updateDisplay ) return;

        this.rotationGroup.updateMatrix();
        this.rotationGroup.updateMatrixWorld( true );

        this.modelGroup.updateMatrix();
        this.modelGroup.updateMatrixWorld( true );

        this.updateDynamicUniforms();

        // needed for font texture, but I don't know why
        _.each( NGL.textures, function( v ){
            v.uniform.value = v.tex;
        });

        // this.renderer.render( this.scene, this.camera );

        // -------
        if( this.ssaoEffect.enabled ){
            this.depthPassPlugin.enabled = true;
            this.renderer.autoClear = false;
            this.renderer.render( this.scene, this.camera );
        }
        this.depthPassPlugin.enabled = false;
        this.composer.render();
        // -------

        this.stats.update();
        this.rendererStats.update( this.composer.renderer );

    },

    updateDynamicUniforms: function(){

        var i, o, u;
        var matrix = new THREE.Matrix4();
        var objects = this.modelGroup.children;
        var nObjects = objects.length;
        var camera = this.camera;
        
        camera.updateMatrix();
        camera.updateMatrixWorld( true );
        camera.matrixWorldInverse.getInverse( camera.matrixWorld );
        camera.updateProjectionMatrix();

        for( i = 0; i < nObjects; i ++ ) {

            o = objects[i];
            if( !o.material ) continue;

            u = o.material.uniforms;
            if( !u ) continue;

            o.updateMatrix();
            o.updateMatrixWorld( true );

            if( u.modelViewMatrixInverse ){
                matrix.multiplyMatrices( 
                    camera.matrixWorldInverse, o.matrixWorld
                );
                u.modelViewMatrixInverse.value.getInverse( matrix );
            }

            if( u.modelViewMatrixInverseTranspose ){
                matrix.multiplyMatrices( 
                    camera.matrixWorldInverse, o.matrixWorld
                );
                u.modelViewMatrixInverseTranspose.value.getInverse( matrix ).transpose();
            }

            if( u.projectionMatrixInverse ){
                u.projectionMatrixInverse.value.getInverse(
                    camera.projectionMatrix
                );
            }

            if( u.projectionMatrixTranspose ){
                u.projectionMatrixTranspose.value.copy(
                    camera.projectionMatrix
                ).transpose();
            }

            if( u.modelViewProjectionMatrix ){
                matrix.multiplyMatrices( 
                    camera.matrixWorldInverse, o.matrixWorld
                );
                u.modelViewProjectionMatrix.value.multiplyMatrices(
                    camera.projectionMatrix, matrix
                )
            }

            if( u.modelViewProjectionMatrixInverse ){
                matrix.multiplyMatrices( 
                    camera.matrixWorldInverse, o.matrixWorld
                );
                u.modelViewProjectionMatrixInverse.value.multiplyMatrices(
                    camera.projectionMatrix, matrix
                )
                u.modelViewProjectionMatrixInverse.value.getInverse( 
                    u.modelViewProjectionMatrixInverse.value
                );
            }

        }

    },

    /**
     * Clears the scene.
     */
    clear: function(){

        console.log( "scene cleared" );

        this.scene.remove( this.rotationGroup );
        
        this.modelGroup = new THREE.Object3D();
        this.rotationGroup = new THREE.Object3D();

        this.rotationGroup.add( this.modelGroup );
        this.scene.add( this.rotationGroup );

        this.renderer.clear();

    },

}


////////////////
// Buffer Core

/**
 * The core buffer class.
 * @class
 * @private
 */
NGL.Buffer = function () {

    // required properties:
    // - size
    // - attributeSize
    // - vertexShader
    // - fragmentShader

    this.defines = [];
    this.attributes = {};
    this.geometry = new THREE.BufferGeometry();

    this.addAttributes({
        "position": { type: "v3", value: null },
        "color": { type: "c", value: null },
    });
    
    this.uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
    ]);
    
}

NGL.Buffer.prototype = {
    
    constructor: NGL.Buffer,

    finalize: function(){

        this.makeIndex();

        this.material = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            attributes: this.attributes,
            vertexShader: NGL.getShader( this.vertexShader, this.defines ),
            fragmentShader: NGL.getShader( this.fragmentShader, this.defines ),
            depthTest: true,
            transparent: false,
            // opacity: 1.0,
            // blending: THREE.AdditiveBlending,
            // blending: THREE.MultiplyBlending,
            // blending: THREE.CustomBlending,
            // blendSrc: THREE.OneFactor,
            // blendDst: THREE.OneMinusSrcAlphaFactor,
            depthWrite: true,
            lights: true,
            fog: true
        });

        this.mesh = new THREE.Mesh( this.geometry, this.material );

    },

    addUniforms: function( uniforms ){

        this.uniforms = THREE.UniformsUtils.merge([ this.uniforms, uniforms ]);
    
    },

    addAttributes: function( attributes ){

        var itemSize = {
            "f": 1, "v2": 2, "v3": 3, "c": 3
        };

        _.each( attributes, function( a, name ){

            this.attributes[ name ] = { 
                "type": a.type, "value": null
            };

            this.geometry.addAttribute( 
                name, 
                new THREE.Float32Attribute( this.attributeSize, itemSize[ a.type ] )
            );

        }, this );

    },

    /**
     * Sets buffer attributes
     * @param {Object} data - An object where the keys are the attribute names
     *      and the values are the attribute data.
     * @example
     * var buffer = new NGL.Buffer();
     * buffer.setAttributes({ attrName: attrData });
     */
    setAttributes: function( data ){

        var attributes = this.geometry.attributes;

        _.each( data, function( d, name ){
            
            attributes[ name ].set( data[ name ] );

        }, this );

    },

    makeIndex: function(){

        this.geometry.addAttribute( 
            "index", new THREE.Uint32Attribute( this.index.length, 1 )
        );

        this.geometry.attributes[ "index" ].array.set( this.index );

    }

};


/**
 * [MeshBuffer description]
 * @class
 * @augments {NGL.Buffer}
 * @param {Float32Array} position
 * @param {Float32Array} color
 * @param {Float32Array} index
 * @param {Float32Array} normal
 */
NGL.MeshBuffer = function ( position, color, index, normal ) {

    this.size = position.length / 3;
    this.attributeSize = this.size;
    this.vertexShader = 'Mesh.vert';
    this.fragmentShader = 'Mesh.frag';
    
    this.index = index;

    NGL.Buffer.call( this );
    
    this.addAttributes({
        "normal": { type: "v3", value: null },
    });
    
    this.setAttributes({
        "position": position,
        "color": color,
        "normal": normal,
    });
    
    this.finalize();
    
}

NGL.MeshBuffer.prototype = Object.create( NGL.Buffer.prototype );


/**
 * [MappedBuffer description]
 * @class
 * @private
 * @augments {NGL.Buffer}
 */
NGL.MappedBuffer = function () {

    this.mappedSize = this.size * this.mappingSize;
    this.attributeSize = this.mappedSize;

    NGL.Buffer.call( this );

    this.addAttributes({
        "mapping": { type: this.mappingType, value: null },
    });

}

NGL.MappedBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.MappedBuffer.prototype.finalize = function(){

    this.makeMapping();

    NGL.Buffer.prototype.finalize.call( this );

},

NGL.MappedBuffer.prototype.setAttributes = function( data ){

    var attributes = this.geometry.attributes;
    var size = this.size;
    var mappingSize = this.mappingSize;

    var a, d, itemSize, array, n, i, j;

    _.each( data, function( d, name ){
        
        d = data[ name ];
        a = attributes[ name ];
        itemSize = a.itemSize;
        array = a.array;
        
        for( var k = 0; k < size; ++k ) {
            
            n = k * itemSize;
            i = n * mappingSize;
            
            for( var l = 0; l < mappingSize; ++l ) {
                
                j = i + (itemSize * l);

                for( var m = 0; m < itemSize; ++m ) {
                    
                    array[ j + m ] = d[ n + m ];

                }

            }

        }

    }, this );

}

NGL.MappedBuffer.prototype.makeMapping = function(){

    var size = this.size;
    var mapping = this.mapping;
    var mappingSize = this.mappingSize;
    var mappingItemSize = this.mappingItemSize;

    var aMapping = this.geometry.attributes[ "mapping" ].array;

    for( var v = 0; v < size; v++ ) {

        aMapping.set( mapping, v * mappingItemSize * mappingSize );
        
    }

}

NGL.MappedBuffer.prototype.makeIndex = function(){

    var size = this.size;
    var chunkSize = NGL.calculateChunkSize( this.mappingSize );
    var mappingSize = this.mappingSize;
    var mappingIndices = this.mappingIndices;
    var mappingIndicesSize = this.mappingIndicesSize;
    var mappingItemSize = this.mappingItemSize;

    this.geometry.addAttribute( 
        "index", new THREE.Uint32Attribute( size * mappingIndicesSize, 1 )
    );

    var index = this.geometry.attributes[ "index" ].array;

    var i, ix, it;

    for( var v = 0; v < size; v++ ) {

        i = v * mappingItemSize * mappingSize;
        ix = v * mappingIndicesSize;
        it = v * mappingSize;
        
        index.set( mappingIndices, ix );

        for( var s=0; s<mappingIndicesSize; ++s ){
            index[ ix + s ] += it;
        }

    }

}


/**
 * [QuadBuffer description]
 * @class 
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.QuadBuffer = function () {

    this.mapping = new Float32Array([
        -1.0,  1.0,
        -1.0, -1.0,
         1.0,  1.0,
         1.0, -1.0
    ]);

    this.mappingIndices = new Uint32Array([
        0, 1, 2,
        1, 3, 2
    ]);

    this.mappingIndicesSize = 6;
    this.mappingType = "v2";
    this.mappingSize = 4;
    this.mappingItemSize = 2;

    NGL.MappedBuffer.call( this );

}

NGL.QuadBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );


/**
 * [BoxBuffer description]
 * @class 
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.BoxBuffer = function () {

    this.mapping = new Float32Array([
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0
    ]);

    this.mappingIndices = new Uint32Array([
        0, 1, 2,
        0, 2, 3,
        1, 5, 6,
        1, 6, 2,
        4, 6, 5,
        4, 7, 6,
        0, 7, 4,
        0, 3, 7,
        0, 5, 1,
        0, 4, 5,
        3, 2, 6,
        3, 6, 7
    ]);

    this.mappingIndicesSize = 36;
    this.mappingType = "v3";
    this.mappingSize = 8;
    this.mappingItemSize = 3;

    NGL.MappedBuffer.call( this );

}

NGL.BoxBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );


/**
 * [AlignedBoxBuffer description]
 * @class
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.AlignedBoxBuffer = function () {

    this.mapping = new Float32Array([
        -1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0
    ]);

    this.mappingIndices = new Uint32Array([
        0, 1, 2,
        1, 4, 2,
        2, 4, 3,
        4, 5, 3
    ]);

    this.mappingIndicesSize = 12;
    this.mappingType = "v3";
    this.mappingSize = 6;
    this.mappingItemSize = 3;

    NGL.MappedBuffer.call( this );

}

NGL.AlignedBoxBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );


////////////////////////
// Impostor Primitives

/**
 * [SphereImpostorBuffer description]
 * @class 
 * @augments {NGL.MappedBuffer}
 * @param {Float32Array} position
 * @param {Float32Array} color
 * @param {Float32Array} radius
 */
NGL.SphereImpostorBuffer = function ( position, color, radius ) {

    this.size = position.length / 3;
    this.vertexShader = 'SphereImpostor.vert';
    this.fragmentShader = 'SphereImpostor.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "color": color,
        "radius": radius,
    });

    this.finalize();

}

NGL.SphereImpostorBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );


NGL.HaloBuffer = function ( position, radius ) {

    this.size = position.length / 3;
    this.vertexShader = 'SphereHalo.vert';
    this.fragmentShader = 'SphereHalo.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        "color"  : { type: "c", value: new THREE.Color( 0x007700 ) },
        'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "radius": radius,
    });

    this.finalize();

    this.material.transparent = true;
    this.material.depthWrite = false;
    this.material.lights = false;
    this.material.blending = THREE.AdditiveBlending;

}

NGL.HaloBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );


/**
 * [CylinderImpostorBuffer description]
 * @class 
 * @augments {NGL.AlignedBoxBuffer}
 * @param {Float32Array} from
 * @param {Float32Array} to
 * @param {Float32Array} color
 * @param {Float32Array} color2
 * @param {Float32Array} radius
 * @param {Float} shift - Moves the cylinder in camera space 
 *      to i.e. get multiple aligned cylinders.
 * @param {Boolean} cap - If true the cylinders are capped.
 */
NGL.CylinderImpostorBuffer = function ( from, to, color, color2, radius, shift, cap ) {

    if( !shift ) shift = 0;

    this.size = from.length / 3;
    this.vertexShader = 'CylinderImpostor.vert';
    this.fragmentShader = 'CylinderImpostor.frag';

    NGL.AlignedBoxBuffer.call( this );

    if( cap ) this.defines.push( "CAP" );

    this.addUniforms({
        'modelViewMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'shift': { type: "f", value: shift },
    });
    
    this.addAttributes({
        "position2": { type: "v3", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
    });

    this.finalize();

}

NGL.CylinderImpostorBuffer.prototype = Object.create( NGL.AlignedBoxBuffer.prototype );


NGL.HyperballStickImpostorBuffer = function ( position1, position2, color1, color2, radius1, radius2, shrink ) {

    this.size = position1.length / 3;
    this.vertexShader = 'HyperballStickImpostor.vert';
    this.fragmentShader = 'HyperballStickImpostor.frag';

    NGL.BoxBuffer.call( this );

    this.addUniforms({
        'modelViewProjectionMatrix': { type: "m4", value: new THREE.Matrix4() },
        'modelViewProjectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'modelViewMatrixInverseTranspose': { type: "m4", value: new THREE.Matrix4() },
        'shrink': { type: "f", value: shrink },
    });
    
    this.addAttributes({
        "inputColor1": { type: "c", value: null },
        "inputColor2": { type: "c", value: null },
        "inputRadius1": { type: "f", value: null },
        "inputRadius2": { type: "f", value: null },
        "inputPosition1": { type: "v3", value: null },
        "inputPosition2": { type: "v3", value: null },
    });

    this.setAttributes({
        "inputColor1": color1,
        "inputColor2": color2,
        "inputRadius1": radius1,
        "inputRadius2": radius2,
        "inputPosition1": position1,
        "inputPosition2": position2,

        "position": position1,
    });

    this.finalize();

}

NGL.HyperballStickImpostorBuffer.prototype = Object.create( NGL.BoxBuffer.prototype );


//////////////////////
// Pixel Primitives

/**
 * [PointBuffer description]
 * @class 
 * @todo  Inherit from NGL.Buffer
 * @param {Float32Array} position
 * @param {Float32Array} color
 */
NGL.PointBuffer = function ( position, color ) {
    
    this.size = position.length / 3;

    this.material = new THREE.ParticleSystemMaterial({
        vertexColors: true,
        sizeAttenuation: false,
        fog: true
    });

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute( 'position', new THREE.Float32Attribute( this.size, 3 ) );
    this.geometry.addAttribute( 'color', new THREE.Float32Attribute( this.size, 3 ) );

    this.geometry.attributes.position.array.set( position );
    this.geometry.attributes.color.set( color );

    this.mesh = new THREE.ParticleSystem( this.geometry, this.material );

}


/**
 * [LineBuffer description]
 * @class 
 * @todo  Inherit from NGL.Buffer
 * @param {Float32Array} from
 * @param {Float32Array} to
 * @param {Float32Array} color
 * @param {Float32Array} color2
 */
NGL.LineBuffer = function ( from, to, color, color2 ) {

    this.size = from.length / 3;

    var n = this.size;
    var n6 = n * 6;
    var nX = n * 2 * 2;

    this.material = new THREE.LineBasicMaterial({
        vertexColors: true,
        fog: true
    });

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute( 'position', new THREE.Float32Attribute( nX, 3 ) );
    this.geometry.addAttribute( 'color', new THREE.Float32Attribute( nX, 3 ) );

    var aPosition = this.geometry.attributes.position.array;
    var aColor = this.geometry.attributes.color.array;

    var i, j;

    var x, y, z, x1, y1, z1, x2, y2, z2;

    for( var v = 0; v < n; v++ ){

        j = v * 3;

        x1 = from[ j + 0 ];
        y1 = from[ j + 1 ];
        z1 = from[ j + 2 ];

        x2 = to[ j + 0 ];
        y2 = to[ j + 1 ];
        z2 = to[ j + 2 ];

        x = ( x1 + x2 ) / 2.0;
        y = ( y1 + y2 ) / 2.0;
        z = ( z1 + z2 ) / 2.0;

        i = v * 2 * 3;
        aPosition[ i + 0 ] = from[ j + 0 ];
        aPosition[ i + 1 ] = from[ j + 1 ];
        aPosition[ i + 2 ] = from[ j + 2 ];
        aPosition[ i + 3 ] = x;
        aPosition[ i + 4 ] = y;
        aPosition[ i + 5 ] = z;
        aColor[ i + 0 ] = color[ j + 0 ];
        aColor[ i + 1 ] = color[ j + 1 ];
        aColor[ i + 2 ] = color[ j + 2 ];
        aColor[ i + 3 ] = color[ j + 0 ];
        aColor[ i + 4 ] = color[ j + 1 ];
        aColor[ i + 5 ] = color[ j + 2 ];

        i2 = i + n6;
        aPosition[ i2 + 0 ] = x;
        aPosition[ i2 + 1 ] = y;
        aPosition[ i2 + 2 ] = z;
        aPosition[ i2 + 3 ] = to[ j + 0 ];
        aPosition[ i2 + 4 ] = to[ j + 1 ];
        aPosition[ i2 + 5 ] = to[ j + 2 ];
        aColor[ i2 + 0 ] = color2[ j + 0 ];
        aColor[ i2 + 1 ] = color2[ j + 1 ];
        aColor[ i2 + 2 ] = color2[ j + 2 ];
        aColor[ i2 + 3 ] = color2[ j + 0 ];
        aColor[ i2 + 4 ] = color2[ j + 1 ];
        aColor[ i2 + 5 ] = color2[ j + 2 ];

    }

    this.mesh = new THREE.Line( this.geometry, this.material, THREE.LinePieces );

}


//////////////////////
// Sprite Primitives

NGL.ParticleSpriteBuffer = function ( position, color, radius ) {

    this.size = position.length / 3;
    this.vertexShader = 'ParticleSprite.vert';
    this.fragmentShader = 'ParticleSprite.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "color": color,
        "radius": radius,
    });

    this.finalize();

    this.material.lights = false;

}

NGL.ParticleSpriteBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );




////////////////
// Text & Font

/**
 * See {@tutorial font} for background info.
 *
 * @param {String} name - Font name, e.g. 'Arial'.
 *
 */
NGL.getFont = function( name ){

    var fnt = NGL.Resources[ 'font/' + name + '.fnt' ].split('\n');
    var font = {};
    var tWidth = 1024;
    var tHeight = 1024;
    var base = 29;
    var lineHeight = 37;

    _.each( fnt, function( line, i ){

        if( line.substr( 0, 5 )=='char ' ){

            var character = {};
            var ls = line.substr(5).split( /\s+/ );
            _.each( ls, function( field, i ){
                var fs = field.split('=');
                character[ fs[0] ] = parseInt( fs[1] );
            });
            var x = character.x;
            var y = character.y;
            var width = character.width;
            var height = character.height;
            character.textureCoords = new Float32Array([
                x/tWidth            ,1 - y/tHeight,                 // top left
                x/tWidth            ,1 - (y+height)/tHeight,        // bottom left
                (x+width)/tWidth    ,1 - y/tHeight,                 // top right
                (x+width)/tWidth    ,1 - (y+height)/tHeight,        // bottom right
            ]);
            character.width2 = (20*width)/tWidth;
            character.height2 = (20*height)/tHeight;
            character.xadvance2 = (20*(character.xadvance))/tWidth;
            character.xoffset2 = (20*(character.xoffset))/tWidth;
            character.yoffset2 = (20*(character.yoffset))/tHeight;
            character.lineHeight = (20*37)/512;
            font[ character['id'] ] = character;

        }else{

            //console.log( i, line );

        }

    })
    
    return font;

}


/**
 * [TextBuffer description]
 * @class 
 * @augments {NGL.QuadBuffer}
 * @param {Float32Array} position
 * @param {Float32Array} size
 * @param {String[]} text
 */
NGL.TextBuffer = function ( position, size, text ) {

    var type = 'Arial';
    var font = NGL.getFont( type );
    var tex = new THREE.Texture( NGL.Resources[ 'font/' + type + '.png' ] );
    tex.needsUpdate = true;

    var n = position.length / 3;
    
    if( !text ){
        text = [];
        for( var i = 0; i < n; i++ ){
            text.push( "#" + i );
        }
    }

    var charCount = _.reduce( text, function( memo, t ){ return memo + t.length; }, 0 );

    this.size = charCount;
    this.vertexShader = 'SDFFont.vert';
    this.fragmentShader = 'SDFFont.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        "color"  : { type: "c", value: new THREE.Color( 0xFFFFFF ) },
        "fontTexture"  : { type: "t", value: tex }
    });

    NGL.textures.push({ uniform: this.uniforms.fontTexture, tex: tex });
    
    this.addAttributes({
        "inputTexCoord": { type: "v2", value: null },
        "inputSize": { type: "f", value: null },
    });

    var aPosition = this.geometry.attributes[ "position" ].array;
    var inputTexCoord = this.geometry.attributes[ "inputTexCoord" ].array;
    var inputSize = this.geometry.attributes[ "inputSize" ].array;
    var inputMapping = this.geometry.attributes[ "mapping" ].array;

    var c;
    var i, j, o;
    var iCharAll = 0;
    var txt, xadvance, iChar, nChar;

    for( var v = 0; v < n; v++ ) {

        o = 3 * v;
        txt = text[ v ];
        xadvance = 0;
        nChar = txt.length;

        for( iChar = 0; iChar < nChar; iChar++, iCharAll++ ) {

            c = font[ txt.charCodeAt( iChar ) ];
            i = iCharAll * 2 * 4;

            // top left
            inputMapping[ i + 0 ] = xadvance + c.xoffset2;
            inputMapping[ i + 1 ] = c.lineHeight - c.yoffset2;
            // bottom left
            inputMapping[ i + 2 ] = xadvance + c.xoffset2;
            inputMapping[ i + 3 ] = c.lineHeight - c.yoffset2 - c.height2;
            // top right
            inputMapping[ i + 4 ] = xadvance + c.xoffset2 + c.width2;
            inputMapping[ i + 5 ] = c.lineHeight - c.yoffset2;
            // bottom right
            inputMapping[ i + 6 ] = xadvance + c.xoffset2 + c.width2;
            inputMapping[ i + 7 ] = c.lineHeight - c.yoffset2 - c.height2;

            inputTexCoord.set( c.textureCoords, i );

            for( var m = 0; m < 4; m++ ) {

                j = iCharAll * 4 * 3 + (3 * m);

                aPosition[ j + 0 ] = position[ o + 0 ];
                aPosition[ j + 1 ] = position[ o + 1 ];
                aPosition[ j + 2 ] = position[ o + 2 ];

                inputSize[ (iCharAll * 4) + m ] = size[ v ];

            }

            xadvance += c.xadvance2;
        }

    }

    this.finalize();

    this.material.transparent = true;
    this.material.depthWrite = false;
    this.material.lights = false;
    this.material.blending = THREE.AdditiveBlending;

}

NGL.TextBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.TextBuffer.prototype.setAttributes = function( data ){ 
    
    // TODO implement; move code from contructor here

    // NGL.QuadBuffer.prototype.setAttributes.call( this, data );

}

NGL.TextBuffer.prototype.makeMapping = function(){ 
    
    // mapping done in the contructor

}


/////////////
// Geometry

// NGL.GeometryBuffer

// // geometries
// this.sphereGeometry = new THREE.IcosahedronGeometry( 2, 1 );
// var matrix = new THREE.Matrix4().makeRotationX( Math.PI/ 2  );
// this.cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, true);
// this.cylinderGeometry.applyMatrix( matrix );
// this.cylinderCappedGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false);
// this.cylinderCappedGeometry.applyMatrix( matrix );


/////////////////
// Alternatives 

NGL.CylinderBoxImpostorBuffer = function ( from, to, color, color2, radius ) {

    this.size = from.length / 3;
    this.vertexShader = 'CylinderBoxImpostor.vert';
    this.fragmentShader = 'CylinderBoxImpostor.frag';

    NGL.BoxBuffer.call( this );

    this.addUniforms({
        'modelViewMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
        "inputQ": { type: "v3", value: null },
        "inputR": { type: "v3", value: null },
    });

    this.setAttributes({
        "color": color,
        "color2": color2,
        "radius": radius,
        "inputQ": from,
        "inputR": to,

        "position": from,
    });

    this.finalize();

}

NGL.CylinderBoxImpostorBuffer.prototype = Object.create( NGL.BoxBuffer.prototype );


NGL.HyperballSphereImpostorBuffer = function ( position, color, radius ) {

    this.size = position.length / 3;
    this.vertexShader = 'HyperballSphereImpostor.vert';
    this.fragmentShader = 'HyperballSphereImpostor.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        'modelViewProjectionMatrix': { type: "m4", value: new THREE.Matrix4() },
        'modelViewProjectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'modelViewMatrixInverseTranspose': { type: "m4", value: new THREE.Matrix4() },
    });
    
    this.addAttributes({
        "aRadius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "color": color,
        "aRadius": radius,
    });

    this.finalize();

}

NGL.HyperballSphereImpostorBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );


/////////////////
// Experimental

NGL.getPathData = function( position, color, size, segments ){
    var n = position.length/3;
    var n1 = n - 1;
    var numpoints = segments*n1 + 2;
    var numpoints3 = numpoints * 3;
    var numpoints1 = numpoints - 1;
    
    var points = [];
    var j;
    for( var v = 0; v < n; ++v ) {
        j = 3 * v;
        points.push( new THREE.Vector3( 
            position[ j + 0 ], position[ j + 1 ], position[ j + 2 ] )
        );
    }
    var path = new THREE.SplineCurve3( points )
    
    var frames = new THREE.TubeGeometry.FrenetFrames( path, numpoints, false );
    var tangents = frames.tangents;
    var normals = frames.normals;
    var binormals = frames.binormals;

    var aPoints = new Float32Array( numpoints3 );
    var aNormals = new Float32Array( numpoints3 );
    var aBinormals = new Float32Array( numpoints3 );
    var aTangents = new Float32Array( numpoints3 );
    var aColor = new Float32Array( numpoints3 );
    var aSize = new Float32Array( numpoints );

    var i3, p, j;
    for ( var i = 0; i < numpoints; i++ ) {
        i3 = i*3;
        p = path.getPointAt( i / numpoints1 );
        // p = path.getPoint( i / numpoints1 );
        
        aPoints[ i3 + 0 ] = p.x;
        aPoints[ i3 + 1 ] = p.y;
        aPoints[ i3 + 2 ] = p.z;
        
        aNormals[ i3 + 0 ] = normals[ i ].x;
        aNormals[ i3 + 1 ] = normals[ i ].y;
        aNormals[ i3 + 2 ] = normals[ i ].z;
        
        aBinormals[ i3 + 0 ] = binormals[ i ].x;
        aBinormals[ i3 + 1 ] = binormals[ i ].y;
        aBinormals[ i3 + 2 ] = binormals[ i ].z;

        aTangents[ i3 + 0 ] = tangents[ i ].x;
        aTangents[ i3 + 1 ] = tangents[ i ].y;
        aTangents[ i3 + 2 ] = tangents[ i ].z;
        
        j = Math.min( Math.floor( i / segments ), n1 );
        j3 = j * 3;
        aColor[ i3 + 0 ] = color[ j3 + 0 ];
        aColor[ i3 + 1 ] = color[ j3 + 1 ];
        aColor[ i3 + 2 ] = color[ j3 + 2 ];
    }

    var curSize, stepSize, l;
    var prevSize = size[0];
    for ( var i = 0; i < n1; i++ ) {
        j = i * segments;
        curSize = size[ i ];
        if( curSize<0 ){
            prevSize = curSize * -1.5;
            curSize = 0;
        }
        stepSize = (prevSize-curSize)/(segments-1);
        for ( var l = 0; l < segments; l++ ) {
            aSize[ j + l ] = prevSize - l * stepSize;
            if( curSize==0 ) aSize[ j + l ] *= -1;
        }
        prevSize = curSize==0 ? Math.abs( size[ i ] ) : curSize;
    }
    
    return {
        "position": aPoints,
        "normal": aNormals,
        "dir": aBinormals,
        "color": aColor,
        "size": aSize,
        "binormals": aBinormals,
        "normals": aNormals,
        "tangents": aTangents
    }
}


// TODO
NGL.TubeImpostorBufferX = function ( position, normal, dir, color, radius ) {

    this.size = from.length / 3;
    this.vertexShader = 'TubeImpostor.vert';
    this.fragmentShader = 'TubeImpostor.frag';

    NGL.AlignedBoxBuffer.call( this );

    this.addUniforms({
        
    });
    
    this.addAttributes({
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "radius": radius,
    });

    this.finalize();

    this.material.transparent = true;
    this.material.depthWrite = false;
    this.material.lights = false;
    this.material.blending = THREE.AdditiveBlending;

}

NGL.TubeImpostorBufferX.prototype = Object.create( NGL.AlignedBoxBuffer.prototype );


// TODO
NGL.CrossBuffer = function ( position, color, size ) {
    
    // screen aligned; pixel buffer

}







