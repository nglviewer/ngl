/**
 * @file Core
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * monkey patch for dat.GUI to remove a folder
 */
dat.GUI.prototype.removeFolder = function( name ){

    var f = this.__folders[ name ];
    f.close();
    f.__ul.parentNode.parentNode.parentNode.removeChild( f.__ul.parentNode.parentNode );
    this.__folders[ name ] = undefined;
    this.onResize();

};


/**
 * [NGL description]
 * @namespace NGL
 * @type {Object}
 */
NGL = {
    REVISION: '1dev',
    EPS: 0.0000001,
    disableImpostor: false
};


/**
 * [Resources description]
 * @type {Object}
 * @private
 */
NGL.Resources = {

    // fonts
    '../font/Arial.png': 'image',
    '../font/Arial.fnt': '',

    // shaders
    '../shader/BezierRaymarch.vert': '',
    '../shader/BezierRaymarch.frag': '',
    '../shader/HelixImpostor.vert': '',
    '../shader/HelixImpostor.frag': '',
    '../shader/HelixImpostor2.vert': '',
    '../shader/HelixImpostor2.frag': '',
    '../shader/HyperballSphereImpostor.vert': '',
    '../shader/HyperballSphereImpostor.frag': '',
    '../shader/HyperballStickImpostor.vert': '',
    '../shader/HyperballStickImpostor.frag': '',
    '../shader/Ribbon.vert': '',
    '../shader/Ribbon.frag': '',
    '../shader/SphereImpostor.vert': '',
    '../shader/SphereImpostor.frag': '',
    '../shader/SphereMesh.vert': '',
    '../shader/SphereMesh.frag': '',
    '../shader/SphereHalo.vert': '',
    '../shader/SphereHalo.frag': '',
    '../shader/CylinderImpostor.vert': '',
    '../shader/CylinderImpostor.frag': '',
    '../shader/CylinderBoxImpostor.vert': '',
    '../shader/CylinderBoxImpostor.frag': '',
    '../shader/SDFFont.vert': '',
    '../shader/SDFFont.frag': '',
    '../shader/LineSprite.vert': '',
    '../shader/LineSprite.frag': '',
    '../shader/Mesh.vert': '',
    '../shader/Mesh.frag': '',
    '../shader/ParticleSprite.vert': '',
    '../shader/ParticleSprite.frag': '',
    '../shader/Quad.vert': '',
    '../shader/Quad.frag': '',
    '../shader/QuadricImpostor.vert': '',
    '../shader/QuadricImpostor.frag': '',
    '../shader/BendCylinderImpostor.vert': '',
    '../shader/BendCylinderImpostor.frag': '',

    // shader chunks
    '../shader/chunk/light_params.glsl': '',
    '../shader/chunk/light.glsl': '',
    '../shader/chunk/fog.glsl': '',
    '../shader/chunk/fog_params.glsl': '',

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

    calculateCenterArray: function( array1, array2 ){

        var n = array1.length;
        var center = new Float32Array( n );

        for( var i = 0; i < n; i+=3 ){

            center[ i + 0 ] = ( array1[ i + 0 ] + array2[ i + 0 ] ) / 2.0;
            center[ i + 1 ] = ( array1[ i + 1 ] + array2[ i + 1 ] ) / 2.0;
            center[ i + 2 ] = ( array1[ i + 2 ] + array2[ i + 2 ] ) / 2.0;

        }

        return center;

    },

    calculateDirectionArray: function( array1, array2 ){

        var n = array1.length;
        var direction = new Float32Array( n );

        for( var i = 0; i < n; i+=3 ){

            direction[ i + 0 ] = array2[ i + 0 ] - array1[ i + 0 ];
            direction[ i + 1 ] = array2[ i + 1 ] - array1[ i + 1 ];
            direction[ i + 2 ] = array2[ i + 2 ] - array1[ i + 2 ];

        }

        return direction;

    },

    positionFromGeometry: function( geometry ){

        var vertices = geometry.vertices;

        var j, v3;
        var n = vertices.length;
        var position = new Float32Array( n * 3 );

        for( var v = 0; v < n; v++ ){

            j = v * 3;
            v3 = vertices[ v ];

            position[ j + 0 ] = v3.x;
            position[ j + 1 ] = v3.y;
            position[ j + 2 ] = v3.z;
            
        }

        return position;

    },

    colorFromGeometry: function( geometry ){

        var faces = geometry.faces;
        var vn = geometry.vertices.length;

        var j, f, c;
        var n = faces.length;
        var color = new Float32Array( vn * 3 );

        for( var v = 0; v < n; v++ ){

            f = faces[ v ];
            c = f.color;

            j = f.a * 3;
            color[ j + 0 ] = c.r;
            color[ j + 1 ] = c.g;
            color[ j + 2 ] = c.b;

            j = f.b * 3;
            color[ j + 0 ] = c.r;
            color[ j + 1 ] = c.g;
            color[ j + 2 ] = c.b;

            j = f.c * 3;
            color[ j + 0 ] = c.r;
            color[ j + 1 ] = c.g;
            color[ j + 2 ] = c.b;
            
        }

        return color;

    },

    indexFromGeometry: function( geometry ){

        var faces = geometry.faces;

        var j, f;
        var n = faces.length;
        var index = new Uint32Array( n * 3 );

        for( var v = 0; v < n; v++ ){

            j = v * 3;
            f = faces[ v ];

            index[ j + 0 ] = f.a;
            index[ j + 1 ] = f.b;
            index[ j + 2 ] = f.c;
            
        }

        return index;

    },

    normalFromGeometry: function( geometry ){

        var faces = geometry.faces;
        var vn = geometry.vertices.length;

        var j, f, nn, n1, n2, n3;
        var n = faces.length;
        var normal = new Float32Array( vn * 3 );

        for( var v = 0; v < n; v++ ){

            f = faces[ v ];
            nn = f.vertexNormals;
            n1 = nn[ 0 ];
            n2 = nn[ 1 ];
            n3 = nn[ 2 ];

            j = f.a * 3;
            normal[ j + 0 ] = n1.x;
            normal[ j + 1 ] = n1.y;
            normal[ j + 2 ] = n1.z;

            j = f.b * 3;
            normal[ j + 0 ] = n2.x;
            normal[ j + 1 ] = n2.y;
            normal[ j + 2 ] = n2.z;

            j = f.c * 3;
            normal[ j + 0 ] = n3.x;
            normal[ j + 1 ] = n3.y;
            normal[ j + 2 ] = n3.z;
            
        }

        return normal;

    },

    uniformArray3: function( n, a, b, c ){

        var array = new Float32Array( n * 3 );

        var j;

        for( var i = 0; i < n; ++i ){

            j = i * 3;

            array[ j + 0 ] = a;
            array[ j + 1 ] = b;
            array[ j + 2 ] = c;

        }

        return array;

    },

    randomColorArray: function( n ){

        var array = new Float32Array( n * 3 );

        var j;

        for( var i = 0; i < n; ++i ){

            j = i * 3;

            array[ j + 0 ] = Math.random();
            array[ j + 1 ] = Math.random();
            array[ j + 2 ] = Math.random();

        }

        return array;

    },

    replicateArray3Entries: function( array, m ){

        var n = array.length / 3;

        var repArr = new Float32Array( n * m * 3 );

        var i, j, k, l, v;
        var a, b, c;

        for( i = 0; i < n; ++i ){

            v = i * 3;
            k = i * m * 3;

            a = array[ v + 0 ];
            b = array[ v + 1 ];
            c = array[ v + 2 ];

            for( j = 0; j < m; ++j ){

                l = k + j * 3;

                repArr[ l + 0 ] = a;
                repArr[ l + 1 ] = b;
                repArr[ l + 2 ] = c;

            }

        }

        return repArr;

    },

    calculateMeanArray: function( array1, array2 ){

        var n = array1.length;
        var mean = new Float32Array( n );

        for( var i = 0; i < n; i++ ){

            mean[ i ] = ( array1[ i ] + array2[ i ] ) / 2.0;

        }

        return mean;

    },

    calculateMinArray: function( array1, array2 ){

        var n = array1.length;
        var mean = new Float32Array( n );

        for( var i = 0; i < n; i++ ){

            mean[ i ] = Math.min( array1[ i ],  array2[ i ] );

        }

        return mean;

    }

};




/**
 * Initialize the global NGL object, i.e. get resources
 */
NGL.init = function( onload ){

    NGL.materialCache = {};

    this.textures = [];

    NGL.initResources( onload );

    return this;

}


/**
 * Get resources for the global NGL object
 * @private
 */
NGL.initResources = function( onLoad ){

    var loadingManager = new THREE.LoadingManager( function(){

        console.log( "NGL initialized" );

        if( onLoad !== undefined ){

            onLoad();

        }

    });

    var imageLoader = new THREE.ImageLoader( loadingManager );

    var xhrLoader = new THREE.XHRLoader( loadingManager );

    Object.keys( NGL.Resources ).forEach( function( url ){
        
        var v = NGL.Resources[ url ];

        if( v=="image" ){

            imageLoader.load( url, function( image ){

                NGL.Resources[ url ] = image;

            });
            
        }else{

            xhrLoader.load( url, function( data ){

                NGL.Resources[ url ] = data;

            });
            
        }
        
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

    if( !NGL.materialCache[ key ] ){
        NGL.materialCache[ key ] = new THREE.MeshLambertMaterial( params )
    }

    return NGL.materialCache[ key ];

};


/**
 * [getShader description]
 * @private
 * @param  {String} name
 * @return {String}
 */
NGL.getShader = function( name ){

    var shader = NGL.Resources[ '../shader/' + name ];
    var re = /^(?!\/\/)\s*#include\s+(\S+)/gmi;

    return shader.replace( re, function( match, p1 ){

        var path = '../shader/chunk/' + p1 + '.glsl';
        var chunk = NGL.Resources[ path ] || THREE.ShaderChunk[ p1 ];

        return chunk ? chunk : "";

    });

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

    this.dotScreenEffect = false;
    this.fxaaEffect = false;
    this.ssaoEffect = false;

    this.fogType = "";
    this.fogNear = 0;
    this.fogFar = 100;
    this.fogDensity = 0.00025;
    this.fogColor = '#000000';
    this.backgroundColor = '#000000';
    this.cameraPerspective = true;
    this.cameraFov = 40;
    this.clipNear = 0;
    this.clipFar = 100;

    var gui = new dat.GUI({ autoPlace: false });
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '0px';
    gui.domElement.style.right = '0px';
    this.viewer.container.appendChild( gui.domElement );
    this.gui = gui;

    var view = gui.addFolder( 'View' );
    view.add( this, 'clear' );
    view.add( this, 'screenshot' );
    view.add( this, 'fullscreen' );
    view.add( this, 'dotScreenEffect' ).onChange(
        function( value ){ 
            viewer.dotScreenEffect.enabled = value;
            viewer.render();
        }
    );
    view.add( this, 'fxaaEffect' ).onChange(
        function( value ){ 
            viewer.fxaaEffect.enabled = value;
            viewer.render();
        }
    );
    // view.add( this, 'ssaoEffect' ).onChange(
    //     function( value ){ 
    //         viewer.ssaoEffect.enabled = value;
    //         viewer.render();
    //     }
    // );

    var settings = gui.addFolder( 'Settings' );
    settings.add(this, 'fogType', ['', 'linear', 'exp2']).onChange(
        function( value ){ viewer.setFog( value ); }
    );
    settings.add(this, 'fogNear').min(0).max(100).step(1).onChange(
        function( value ){ viewer.setFog( null, null, value ); }
    );
    settings.add(this, 'fogFar').min(0).max(100).step(1).onChange(
        function( value ){ viewer.setFog( null, null, null, value ); }
    );
    settings.add(this, 'fogDensity').min(0).max(0.1).step(0.005).onChange(
        function( value ){ viewer.setFog( null, null, null, null, value ); }
    );
    settings.addColor(this, 'fogColor').onChange(
        function( value ){ viewer.setFog( null, value ); }
    ).listen();
    settings.addColor(this, 'backgroundColor').onChange(
        function( value ){ viewer.setBackground( value ); this.fogColor = value; }
    );
    settings.add(this, 'cameraPerspective').onChange(
        function( value ){ viewer.setCamera( value ); }
    );
    settings.add(this, 'cameraFov').min(0).max(180).step(1).onChange(
        function( value ){ viewer.setCamera( null, value ); }
    );
    settings.add(this, 'clipNear').min(0).max(100).step(1).onChange(
        function( value ){ viewer.setClip( value, null ); }
    );
    settings.add(this, 'clipFar').min(0).max(100).step(1).onChange(
        function( value ){ viewer.setClip( null, value ); }
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

    this.initScene( true );

    this.initRenderer();

    this.initLights();

    this.initControls();

    this.initStats();

    window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

    // fog & background
    this.setBackground();
    this.setFog();

    this.gui = new NGL.GUI( this );

    this.gui2 = new dat.GUI({ autoPlace: false });
    this.gui2.domElement.style.position = 'absolute';
    this.gui2.domElement.style.top = '0px';
    this.gui2.domElement.style.left = '0px';
    this.container.appendChild( this.gui2.domElement );

}

NGL.Viewer.prototype = {
    
    constructor: NGL.Viewer,

    initParams: function(){

        this.params = {
        
            fogType: null,
            fogColor: 0x000000,
            fogNear: 0,
            fogFar: 100,
            fogDensity: 0.00025,

            // backgroundColor: 0xFFFFFF,
            backgroundColor: 0x000000,

            cameraType: 1,
            cameraFov: 40,
            cameraZ: -80, // FIXME initial value should be automatically determined

            clipNear: 0,
            clipFar: 100,

            specular: 0x050505,

            disableImpostor: false

        };

    },

    initCamera: function(){

        var p = this.params;
        var lookAt = new THREE.Vector3( 0, 0, 0 );

        this.perspectiveCamera = new THREE.PerspectiveCamera( 
            p.cameraFov, this.aspect, 0.1, 10000
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
            antialias: true, // TODO artifacts in impostor shader
        });
        this.renderer.setSize( this.width, this.height );
        this.renderer.autoClear = true;

        var _glExtensionFragDepth = this.renderer.context.getExtension('EXT_frag_depth');
        if( !_glExtensionFragDepth ){
            NGL.disableImpostor = true;
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

    initScene: function( makeScene ){

        if( makeScene ){
            this.scene = new THREE.Scene();
        }

        this.modelGroup = new THREE.Object3D();
        this.modelGroup.name = "modelGroup";
        this.rotationGroup = new THREE.Object3D();
        this.rotationGroup.name = "rotationGroup";

        this.rotationGroup.add( this.modelGroup );
        this.scene.add( this.rotationGroup );

    },

    initLights: function(){
        
        var directionalLight = new THREE.DirectionalLight( 0xFFFFFF );
        directionalLight.position.copy( new THREE.Vector3( 1, 1, -2.5 ).normalize() );
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
        this.controls.keys = [ 65, 83, 68 ];

        this.controls.addEventListener( 'change', this.render.bind( this ) );

    },

    initStats: function(){

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.right = '0px';
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

        //console.log( this.modelGroup );

        this.modelGroup.add( buffer.mesh );

        

        this.render();

    },

    remove: function( buffer ){

        this.modelGroup.remove( buffer.mesh );

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
    setFog: function( type, color, near, far, density, foo ){

        var p = this.params;

        if( type!==null ) p.fogType = type;
        if( color ) p.fogColor = color;
        if( near ) p.fogNear = near;
        if( far ) p.fogFar = far;
        if( density ) p.fogDensity = density;

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

        if( type!==null ) p.cameraType = type;
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

    setClip: function( near, far ){

        var p = this.params;

        if( near ) p.clipNear = near;
        if( far ) p.clipFar = far;

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

        this.stats.update();

    },

    /**
     * Renders the scene.
     */
    render: function(){

        if( this._rendering ){
            console.warn( "tried to call 'render' from within 'render'" );
            return;
        }

        this._rendering = true;

        this.rotationGroup.updateMatrix();
        this.rotationGroup.updateMatrixWorld( true );

        this.modelGroup.updateMatrix();
        this.modelGroup.updateMatrixWorld( true );

        this.camera.updateMatrix();
        this.camera.updateMatrixWorld( true );
        this.camera.matrixWorldInverse.getInverse( this.camera.matrixWorld );
        this.camera.updateProjectionMatrix();

        this.updateBoundingBox();
        this.updateDynamicUniforms();

        // needed for font texture, but I don't know why
        NGL.textures.forEach( function( v ){
            v.uniform.value = v.tex;
        });

        if( this.ssaoEffect.enabled || this.fxaaEffect.enabled || 
            this.dotScreenEffect.enabled ){

            if( this.ssaoEffect.enabled ){
                this.depthPassPlugin.enabled = true;
                this.renderer.autoClear = false;
                this.renderer.render( this.scene, this.camera );
            }
            this.depthPassPlugin.enabled = false;
            this.composer.render();
            
        }else{

            this.renderer.render( this.scene, this.camera );

        }
        
        this.rendererStats.update( this.renderer );

        this._rendering = false;

    },

    updateBoundingBox: function(){

        var box = new THREE.Box3();
        var vec = new THREE.Vector3();

        var camera = this.camera;

        this.modelGroup.traverse( function ( node ) {

            // console.log( node );

            if ( node.geometry !== undefined ) {

                if ( node.geometry.boundingBox === null ) {

                    node.geometry.computeBoundingBox();

                }

                vec.copy( node.geometry.boundingBox.min );
                vec.applyMatrix4( node.matrixWorld );
                box.expandByPoint( vec );

                vec.copy( node.geometry.boundingBox.max );
                vec.applyMatrix4( node.matrixWorld );
                box.expandByPoint( vec );

            }

        } );

        if( box.empty() ) return;

        var boxGeo = new THREE.BufferGeometry();
        boxGeo.addAttribute( 
            'position', 
            new THREE.BufferAttribute( new Float32Array([

                box.min.x, box.min.y, box.min.z,
                box.max.x, box.max.y, box.max.z

            ]), 3 )
        );

        if( !this.boxHelper ){

            this.boxHelper = new THREE.BoxHelper( new THREE.Mesh( boxGeo ), 0xff0000 );
            // this.scene.add( this.boxHelper );

        }else{

            this.boxHelper.update( new THREE.Mesh( boxGeo ) );

        }

        var boxPos = new Float32Array( 
            this.boxHelper.geometry.attributes.position.array
        );

        var modelViewMatrix = new THREE.Matrix4();
        modelViewMatrix.multiplyMatrices( 
            camera.matrixWorldInverse, this.boxHelper.matrixWorld
        );

        modelViewMatrix.applyToVector3Array( boxPos );

        // var projScreenMatrix = new THREE.Matrix4();
        // projScreenMatrix.multiplyMatrices( 
        //     camera.projectionMatrix, camera.matrixWorldInverse
        // );

        var boxPos2 = new Float32Array( boxPos );
        var boxMin2 = Infinity;
        var boxMax2 = -Infinity;
        var z2;
        camera.projectionMatrix.applyToVector3Array( boxPos2 );

        var boxMin = Infinity;
        var boxMax = -Infinity;

        var z;

        for( var i = 0, n = boxPos.length; i < n; i += 3 ){

            z = boxPos[ i + 2 ];
            if( z < boxMin ) boxMin = z;
            if( z > boxMax ) boxMax = z;

            z2 = boxPos2[ i + 2 ];
            if( z2 < boxMin2 ) boxMin2 = z2;
            if( z2 > boxMax2 ) boxMax2 = z2;

        }

        var cz = camera.position.z;
        // console.log( camera )
        // console.log( this.controls )
        // console.log( cz );
        // console.log( boxMin, boxMax, boxMin2, boxMax2 );
        // console.log( boxMin + cz, boxMax + cz, boxMin2 + cz, boxMax2 + cz );

        if( boxMin!==Infinity && boxMin!==-Infinity && !isNaN( boxMin ) &&
            boxMax!==Infinity && boxMax!==-Infinity && !isNaN( boxMax ) ){

            var boxSize = Math.abs( boxMax - boxMin );
            // var boxSize2 = Math.abs( boxMax2 - boxMin2 );

            camera.near = ( boxMax > 0 ) ? 0.1 : Math.abs( boxMax );
            camera.far = Math.abs( boxMin );

            var p = this.params;

            // console.log( camera.near, camera.far, p.fogNear, p.fogFar );
            // console.log(
            //     camera.near + boxSize * ( this.params.fogNear / 100 ),
            //     camera.far - boxSize * ( 1 - ( this.params.fogFar / 100 ) )
            // );

            // TODO change fog shader
            if( p.fogType=="linear" ){
                // this.scene.fog = new THREE.Fog( 
                //     p.fogColor,
                //     camera.near + boxSize * ( this.params.fogNear / 100 ),
                //     camera.far - boxSize * ( 1 - ( this.params.fogFar / 100 ) )
                // );
                this.scene.fog = new THREE.Fog( 
                    p.fogColor,
                    0 - ( -Math.abs( cz ) + 50 ),
                    100 - ( -Math.abs( cz ) + 50 )
                );
                // this.scene.fog = new THREE.Fog( 
                //     p.fogColor,
                //     boxMax2 * -1 + boxSize2 * ( this.params.fogNear / 100 ),
                //     boxMin2 * -1 - boxSize2 * ( 1 - ( this.params.fogFar / 100 ) )
                // );
            }else if( p.fogType=="exp2" ){
                this.scene.fog = new THREE.FogExp2( p.fogColor, p.fogDensity );
            }else{
                this.scene.fog = null;
            }

            this.modelGroup.children.forEach( function( o ){
                if( o.material ) o.material.needsUpdate = true;
            });
            
            Object.keys( NGL.materialCache ).forEach( function( key ){
                var m = NGL.materialCache[ key ];
                m.needsUpdate = true;
            });

            camera.near += boxSize * ( this.params.clipNear / 100 );
            camera.far -= boxSize * ( 1 - ( this.params.clipFar / 100 ) );

            // console.log( boxSize * ( this.params.clipNear / 100 ) );

            camera.updateMatrix();
            camera.updateMatrixWorld( true );
            camera.matrixWorldInverse.getInverse( camera.matrixWorld );
            camera.updateProjectionMatrix();

        }

        // console.log( this.boxHelper );
        //console.log( camera.near, camera.far, boxMax, boxMin, Math.abs( boxMax - boxMin ) );
        // console.log( this.scene.fog );

    },

    updateDynamicUniforms: function(){

        var i, o, u;
        var matrix = new THREE.Matrix4();
        var objects = this.modelGroup.children;
        var nObjects = objects.length;
        var camera = this.camera;

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
        
        this.initScene();

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
            vertexShader: NGL.getShader( this.vertexShader ),
            fragmentShader: NGL.getShader( this.fragmentShader ),
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

        Object.keys( attributes ).forEach( function( name ){

            var a = attributes[ name ];

            this.attributes[ name ] = { 
                "type": a.type, "value": null
            };

            this.geometry.addAttribute( 
                name, 
                new THREE.BufferAttribute(
                    new Float32Array( this.attributeSize * itemSize[ a.type ] ),
                    itemSize[ a.type ]
                )
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

        Object.keys( data ).forEach( function( name ){
            
            attributes[ name ].set( data[ name ] );

            attributes[ name ].needsUpdate = true;
            this.attributes[ name ].needsUpdate = true;

        }, this );

    },

    makeIndex: function(){

        this.geometry.addAttribute( 
            "index",
            new THREE.BufferAttribute(
                new Uint32Array( this.index.length ), 1
            )
        );

        this.geometry.attributes[ "index" ].array.set( this.index );

    },

    remove: function(){

        this.geometry.dispose();
        this.material.dispose();

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
NGL.MeshBuffer = function( position, color, index, normal ){

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
    
    // this.material.transparent = true;
    // this.material.depthWrite = true;
    // this.material.lights = false;
    this.material.side = THREE.DoubleSide;
    // this.material.blending = THREE.AdditiveBlending;
    // this.material.blending = THREE.MultiplyBlending;

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

    Object.keys( data ).forEach( function( name ){
        
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

        a.needsUpdate = true;
        this.attributes[ name ].needsUpdate = true;

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
    var mappingSize = this.mappingSize;
    var mappingIndices = this.mappingIndices;
    var mappingIndicesSize = this.mappingIndicesSize;
    var mappingItemSize = this.mappingItemSize;

    this.geometry.addAttribute( 
        "index",
        new THREE.BufferAttribute(
            new Uint32Array( size * mappingIndicesSize ), 1
        )
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
NGL.SphereImpostorBuffer = function( position, color, radius ){

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


NGL.HaloBuffer = function( position, radius ){

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
NGL.CylinderImpostorBuffer = function( from, to, color, color2, radius, shift, cap ){

    if( !shift ) shift = 0;

    this.size = from.length / 3;
    this.vertexShader = 'CylinderImpostor.vert';
    this.fragmentShader = 'CylinderImpostor.frag';

    NGL.AlignedBoxBuffer.call( this );

    this.addUniforms({
        'modelViewMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'shift': { type: "f", value: shift },
    });
    
    this.addAttributes({
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": NGL.Utils.calculateCenterArray( from, to ),

        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
    });

    this.finalize();

    this.material.defines[ "CAP" ] = 1;

}

NGL.CylinderImpostorBuffer.prototype = Object.create( NGL.AlignedBoxBuffer.prototype );


NGL.HyperballStickImpostorBuffer = function( position1, position2, color1, color2, radius1, radius2, shrink ){

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

        "position": NGL.Utils.calculateCenterArray( position1, position2 ),
    });

    this.finalize();

}

NGL.HyperballStickImpostorBuffer.prototype = Object.create( NGL.BoxBuffer.prototype );


////////////////////////
// Geometry Primitives


/**
 * [GeometryBuffer description]
 * @class 
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.GeometryBuffer = function( position, color ){

    updateNormals = this.updateNormals;

    var geo = this.geo;
    geo.computeVertexNormals( true );

    var n = position.length / 3;
    var m = geo.vertices.length;
    var o = geo.faces.length;

    this.size = n * m;

    var geoPosition = NGL.Utils.positionFromGeometry( geo );
    var geoNormal = NGL.Utils.normalFromGeometry( geo );
    var geoIndex = NGL.Utils.indexFromGeometry( geo );

    var bufferPosition = new Float32Array( this.size * 3 );
    var bufferNormal = new Float32Array( this.size * 3 );
    var bufferIndex = new Uint32Array( n * o * 3 );
    var bufferColor = new Float32Array( this.size * 3 );

    var _geoPosition = new Float32Array( m * 3 );
    var _geoIndex = new Uint32Array( o * 3 );
    var _geoNormal = new Float32Array( m * 3 );

    var i, j, k, l, i3, p;
    var o3 = o * 3;
    var r;

    var matrix = new THREE.Matrix4();
    var normalMatrix = new THREE.Matrix3();

    for( i = 0; i < n; ++i ){

        k = i * m * 3;
        i3 = i * 3;

        _geoPosition.set( geoPosition );
        matrix.makeTranslation(
            position[ i3 + 0 ], position[ i3 + 1 ], position[ i3 + 2 ]
        );
        this.applyPositionTransform( matrix, i, i3 );
        matrix.applyToVector3Array( _geoPosition );

        _geoNormal.set( geoNormal );
        if( updateNormals ){
            normalMatrix.getNormalMatrix( matrix );
            normalMatrix.applyToVector3Array( _geoNormal );
        }

        _geoIndex.set( geoIndex );
        for( p = 0; p < o3; ++p ) _geoIndex[ p ] += i * m;

        bufferPosition.set( _geoPosition, k );
        bufferNormal.set( _geoNormal, k );
        bufferIndex.set( _geoIndex, i * o * 3 );

        for( j = 0; j < m; ++j ){

            l = k + 3 * j;

            bufferColor[ l + 0 ] = color[ i3 + 0 ];
            bufferColor[ l + 1 ] = color[ i3 + 1 ];
            bufferColor[ l + 2 ] = color[ i3 + 2 ];

        }

    }

    this.attributeSize = this.size;
    this.vertexShader = 'Mesh.vert';
    this.fragmentShader = 'Mesh.frag';
    
    this.index = bufferIndex;

    NGL.Buffer.call( this );
    
    this.addAttributes({
        "normal": { type: "v3", value: null },
    });
    
    this.setAttributes({
        "position": bufferPosition,
        "color": bufferColor,
        "normal": bufferNormal,
    });
    
    this.finalize();

}

NGL.GeometryBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.GeometryBuffer.prototype.applyPositionTransform = function(){}

NGL.GeometryBuffer.prototype.applyNormalTransform = function(){}


NGL.SphereGeometryBuffer = function( position, color, radius ){

    this.geo = new THREE.IcosahedronGeometry( 1, 2 );

    var r;
    var scale = new THREE.Vector3();

    this.applyPositionTransform = function( matrix, i ){

        r = radius[ i ];
        scale.set( r, r, r );
        matrix.scale( scale );

    }

    NGL.GeometryBuffer.call( this, position, color );

}

NGL.SphereGeometryBuffer.prototype = Object.create( NGL.GeometryBuffer.prototype );


NGL.CylinderGeometryBuffer = function( from, to, color, color2, radius ){

    this.updateNormals = true;

    var matrix = new THREE.Matrix4().makeRotationX( Math.PI/ 2  );
    this.geo = new THREE.CylinderGeometry(1, 1, 1, 16, 1, true);
    this.geo.applyMatrix( matrix );

    var position = NGL.Utils.calculateCenterArray( from, to );
    // var direction = NGL.Utils.calculateDirectionArray( from, to );

    var r;
    var scale = new THREE.Vector3();
    var eye = new THREE.Vector3();
    var target = new THREE.Vector3();
    var up = new THREE.Vector3( 0, 1, 0 );

    this.applyPositionTransform = function( matrix, i, i3 ){

        eye.set( from[ i3 + 0 ], from[ i3 + 1 ], from[ i3 + 2 ] );
        target.set( to[ i3 + 0 ], to[ i3 + 1 ], to[ i3 + 2 ] );
        matrix.lookAt( eye, target, up );

        r = radius[ i ];
        scale.set( r, r, eye.distanceTo( target ) );
        matrix.scale( scale );

    }

    NGL.GeometryBuffer.call( this, position, color );

}

NGL.CylinderGeometryBuffer.prototype = Object.create( NGL.GeometryBuffer.prototype );



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

    this.material = new THREE.PointCloudMaterial({
        vertexColors: true,
        sizeAttenuation: false,
        fog: true
    });

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute(
        'position', new THREE.BufferAttribute( position, 3 )
    );
    this.geometry.addAttribute(
        'color', new THREE.BufferAttribute( color, 3 )
    );

    this.mesh = new THREE.PointCloud( this.geometry, this.material );

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

    this.attributes = {
        "position": { type: "v3", value: null },
        "color": { type: "c", value: null },
    };

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute( 
        'position', new THREE.BufferAttribute( new Float32Array( nX * 3 ), 3 )
    );
    this.geometry.addAttribute( 
        'color', new THREE.BufferAttribute( new Float32Array( nX * 3 ), 3 )
    );

    this.setAttributes({
        from: from,
        to: to,
        color: color,
        color2: color2
    });

    this.material = new THREE.LineBasicMaterial({
        attributes: this.attributes,
        vertexColors: true,
        fog: true
    });

    this.mesh = new THREE.Line( this.geometry, this.material, THREE.LinePieces );

};

NGL.LineBuffer.prototype = {

    setAttributes: function( data ){

        var from, to, color, color2;
        var aPosition, aColor;

        var attributes = this.geometry.attributes;

        if( data[ "from" ] && data[ "to" ] ){
            from = data[ "from" ];
            to = data[ "to" ];
            aPosition = attributes[ "position" ].array;
            attributes[ "position" ].needsUpdate = true;
            this.attributes[ "position" ].needsUpdate = true;
        }

        if( data[ "color" ] && data[ "color2" ] ){
            color = data[ "color" ];
            color2 = data[ "color2" ];
            aColor = attributes[ "color" ].array;
            attributes[ "color" ].needsUpdate = true;
            this.attributes[ "color" ].needsUpdate = true;
        }

        var n = this.size;
        var n6 = n * 6;

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
            if( from && to ){
                aPosition[ i + 0 ] = from[ j + 0 ];
                aPosition[ i + 1 ] = from[ j + 1 ];
                aPosition[ i + 2 ] = from[ j + 2 ];
                aPosition[ i + 3 ] = x;
                aPosition[ i + 4 ] = y;
                aPosition[ i + 5 ] = z;
            }
            if( color && color2 ){
                aColor[ i + 0 ] = color[ j + 0 ];
                aColor[ i + 1 ] = color[ j + 1 ];
                aColor[ i + 2 ] = color[ j + 2 ];
                aColor[ i + 3 ] = color[ j + 0 ];
                aColor[ i + 4 ] = color[ j + 1 ];
                aColor[ i + 5 ] = color[ j + 2 ];
            }

            i2 = i + n6;
            if( from && to ){
                aPosition[ i2 + 0 ] = x;
                aPosition[ i2 + 1 ] = y;
                aPosition[ i2 + 2 ] = z;
                aPosition[ i2 + 3 ] = to[ j + 0 ];
                aPosition[ i2 + 4 ] = to[ j + 1 ];
                aPosition[ i2 + 5 ] = to[ j + 2 ];
            }
            if( color && color2 ){
                aColor[ i2 + 0 ] = color2[ j + 0 ];
                aColor[ i2 + 1 ] = color2[ j + 1 ];
                aColor[ i2 + 2 ] = color2[ j + 2 ];
                aColor[ i2 + 3 ] = color2[ j + 0 ];
                aColor[ i2 + 4 ] = color2[ j + 1 ];
                aColor[ i2 + 5 ] = color2[ j + 2 ];
            }

        }

    },

    remove: function(){

        this.geometry.dispose();
        this.material.dispose();

    }

};


NGL.TraceBuffer = function ( position, color ) {

    this.size = position.length / 3;

    var n = this.size;
    var n1 = n - 1;

    from = new Float32Array( n1 * 3 );
    to = new Float32Array( n1 * 3 );
    lineColor = new Float32Array( n1 * 3 );
    lineColor2 = new Float32Array( n1 * 3 );

    for( var i=0, v; i<n1; ++i ){

        v = 3 * i;

        from[ v + 0 ] = position[ v + 0 ];
        from[ v + 1 ] = position[ v + 1 ];
        from[ v + 2 ] = position[ v + 2 ];

        to[ v + 0 ] = position[ v + 3 ];
        to[ v + 1 ] = position[ v + 4 ];
        to[ v + 2 ] = position[ v + 5 ];

        lineColor[ v + 0 ] = color[ v + 0 ];
        lineColor[ v + 1 ] = color[ v + 1 ];
        lineColor[ v + 2 ] = color[ v + 2 ];

        lineColor2[ v + 0 ] = color[ v + 3 ];
        lineColor2[ v + 1 ] = color[ v + 4 ];
        lineColor2[ v + 2 ] = color[ v + 5 ];

    }

    this.lineBuffer = new NGL.LineBuffer(
        from, to, lineColor, lineColor2
    );

    this.mesh = this.lineBuffer.mesh;
    this.geometry = this.lineBuffer.geometry;
    this.material = this.lineBuffer.material;

};

NGL.TraceBuffer.prototype = {

    remove: function(){

        this.geometry.dispose();
        this.material.dispose();

    }

};


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


///////////////////
// API Primitives

NGL.SphereBuffer = function( position, color, radius ){

    if( NGL.disableImpostor ){

        return new NGL.SphereGeometryBuffer( position, color, radius );

    }else{

        return new NGL.SphereImpostorBuffer( position, color, radius );

    }

}


NGL.CylinderBuffer = function( from, to, color, color2, radius ){

    if( NGL.disableImpostor ){

        return new NGL.CylinderGeometryBuffer( from, to, color, color2, radius );

    }else{

        return new NGL.CylinderImpostorBuffer( from, to, color, color2, radius );

    }

}


NGL.HyperballStickBuffer = function( from, to, color1, color2, radius1, radius2, shrink ){

    if( NGL.disableImpostor ){

        return new NGL.CylinderGeometryBuffer(
            from, to, color1, color2,
            NGL.Utils.calculateMinArray( radius1, radius2 )
        );

    }else{

        return new NGL.HyperballStickImpostorBuffer(
            from, to, color1, color2, radius1, radius2, shrink
        );

    }

}


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

    fnt.forEach( function( line ){

        if( line.substr( 0, 5 )=='char ' ){

            var character = {};
            var ls = line.substr(5).split( /\s+/ );
            ls.forEach( function( field ){
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

    var charCount = 0;
    text.forEach( function( t ){ charCount += t.length; } );

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







