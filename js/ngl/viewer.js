/**
 * @file Viewer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


/**
 * [Resources description]
 * @type {Object}
 * @private
 */
NGL.Resources = {

    // fonts
    // '../fonts/Arial.fnt': null,
    // '../fonts/Arial.png': 'image',
    // '../fonts/DejaVu.fnt': null,
    // '../fonts/DejaVu.png': 'image',
    '../fonts/LatoBlack.fnt': null,
    '../fonts/LatoBlack.png': 'image',

    // sprites
    // '../img/circle.png': 'image',
    // '../img/spark1.png': 'image',
    '../img/radial.png': 'image',

    // shaders
    '../shader/CylinderImpostor.vert': null,
    '../shader/CylinderImpostor.frag': null,
    '../shader/HyperballStickImpostor.vert': null,
    '../shader/HyperballStickImpostor.frag': null,
    '../shader/Line.vert': null,
    '../shader/Line.frag': null,
    '../shader/LineSprite.vert': null,
    '../shader/LineSprite.frag': null,
    '../shader/Mesh.vert': null,
    '../shader/Mesh.frag': null,
    '../shader/ParticleSprite.vert': null,
    '../shader/ParticleSprite.frag': null,
    '../shader/Quad.vert': null,
    '../shader/Quad.frag': null,
    '../shader/Ribbon.vert': null,
    '../shader/Ribbon.frag': null,
    '../shader/SDFFont.vert': null,
    '../shader/SDFFont.frag': null,
    '../shader/SphereHalo.vert': null,
    '../shader/SphereHalo.frag': null,
    '../shader/SphereImpostor.vert': null,
    '../shader/SphereImpostor.frag': null,

    // shader chunks
    '../shader/chunk/fog.glsl': null,
    '../shader/chunk/fog_params.glsl': null,
    '../shader/chunk/light.glsl': null,
    '../shader/chunk/light_params.glsl': null,

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

        var EPS = NGL.EPS;

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

    circularMean: function(){

        // http://en.wikipedia.org/wiki/Center_of_mass#Systems_with_periodic_boundary_conditions

        // Bai, Linge; Breen, David (2008). Calculating Center of Mass in an Unbounded 2D Environment. Journal of Graphics, GPU, and Game Tools 13 (4): 53–60.

        // http://stackoverflow.com/questions/18166507/using-fft-to-find-the-center-of-mass-under-periodic-boundary-conditions

        var twoPi = 2 * Math.PI;

        return function( array, max, stride, offset, indices ){

            stride = stride || 1;
            offset = offset || 0;

            var n = indices ? indices.length : array.length;
            var angle, i, c;

            var cosMean = 0;
            var sinMean = 0;

            if( indices ){

                for( i = 0; i < n; ++i ){

                    // NGL.log( indices[ i ], stride, offset, indices[ i ] * stride + offset, array.length, array[ indices[ i ] * stride + offset ] );

                    c = ( array[ indices[ i ] * stride + offset ] + max ) % max;

                    angle = ( c / max ) * twoPi - Math.PI;

                    cosMean += Math.cos( angle );
                    sinMean += Math.sin( angle );

                }

            }else{

                for( i = offset; i < n; i += stride ){

                    c = ( array[ i ] + max ) % max;

                    angle = ( c / max ) * twoPi - Math.PI;

                    cosMean += Math.cos( angle );
                    sinMean += Math.sin( angle );

                }

            }

            cosMean /= n;
            sinMean /= n;

            var meanAngle = Math.atan2( sinMean, cosMean );

            var mean = ( meanAngle + Math.PI ) / twoPi * max;

            return mean;

        }

    }(),

    calculateCenterArray: function( array1, array2, center, offset ){

        var n = array1.length;
        center = center || new Float32Array( n );
        offset = offset || 0;

        for( var i = 0; i < n; i+=3 ){

            center[ offset + i + 0 ] = ( array1[ i + 0 ] + array2[ i + 0 ] ) / 2.0;
            center[ offset + i + 1 ] = ( array1[ i + 1 ] + array2[ i + 1 ] ) / 2.0;
            center[ offset + i + 2 ] = ( array1[ i + 2 ] + array2[ i + 2 ] ) / 2.0;

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

    uniformArray: function( n, a ){

        var array = new Float32Array( n );

        for( var i = 0; i < n; ++i ){

            array[ i ] = a;

        }

        return array;

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
        var min = new Float32Array( n );

        for( var i = 0; i < n; i++ ){

            min[ i ] = Math.min( array1[ i ],  array2[ i ] );

        }

        return min;

    },

    calculateMeanVector3: function( array ){

        var n = array.length;
        var m = array.length / 3;

        var x = 0;
        var y = 0;
        var z = 0;

        var i;

        for( i = 0; i < n; i += 3 ){

            x += array[ i + 0 ];
            y += array[ i + 1 ];
            z += array[ i + 2 ];

        }

        return new THREE.Vector3( x / m, y / m, z / m );

    },

    isPointOnSegment: function( p, l1, l2 ){

        var len = l1.distanceTo( l2 );

        return p.distanceTo( l1 ) <= len && p.distanceTo( l2 ) <= len;

    },

    pointVectorIntersection: function(){

        var v = new THREE.Vector3();
        var v1 = new THREE.Vector3();

        return function( point, origin, vector ){

            v.copy( vector );
            v1.subVectors( point, origin );
            var distOriginI = Math.cos( v.angleTo( v1 ) ) * v1.length();
            var vectorI = v.normalize().multiplyScalar( distOriginI );
            var pointI = new THREE.Vector3().addVectors( vectorI, origin );

            return pointI;

        }

    }(),

    copyArray: function( src, dst, srcOffset, dstOffset, length ){

        var i;
        var n = length;

        for( i = 0; i < n; ++i ){

            dst[ dstOffset + i ] = src[ srcOffset + i ];

        }

    }

};


NGL.init = function( onload, baseUrl ){

    var debug = NGL.GET( "debug" );
    if( debug !== undefined ) NGL.debug = debug;

    var useWorker = NGL.GET( "useWorker" );
    if( useWorker !== undefined ) NGL.useWorker = useWorker;

    var disableImpostor = NGL.GET( "disableImpostor" );
    if( disableImpostor !== undefined ) NGL.disableImpostor = disableImpostor;

    this.textures = [];

    NGL.initResources( onload, baseUrl );

    return this;

};


NGL.dataURItoImage = function( dataURI ){

    if( typeof importScripts !== 'function' ){

        var img = document.createElement( "img" );
        img.src = dataURI;

        return img;

    }

};


NGL.initResources = function( onLoad, baseUrl ){

    baseUrl = baseUrl || "";

    var onLoadFn = function(){

        NGL.log( "NGL initialized" );

        if( onLoad !== undefined ){

            onLoad();

        }

    };

    var loadingManager = new THREE.LoadingManager( onLoadFn );

    var imageLoader = new THREE.ImageLoader( loadingManager );

    var xhrLoader = new THREE.XHRLoader( loadingManager );

    var resourceKeys = Object.keys( NGL.Resources );
    var i = 0;

    resourceKeys.forEach( function( url ){

        var v = NGL.Resources[ url ];
        var url2 = baseUrl + url;

        if( v==="image" ){

            imageLoader.load( url2, function( image ){

                NGL.Resources[ url ] = image;

            });

        }else if( v!==null ){

            i += 1;
            return;

        }else{

            xhrLoader.load( url2, function( data ){

                NGL.Resources[ url ] = data;

            });

        }

    });

    if( resourceKeys.length === i ){

        onLoadFn();

    }

};


NGL.getShader = function(){

    var re = /^(?!\/\/)\s*#include\s+(\S+)/gmi;
    var cache = {};

    return function( name ){

        var shader = NGL.Resources[ '../shader/' + name ];

        if( !cache[ name ] ){

            cache[ name ] = shader.replace( re, function( match, p1 ){

                var path = '../shader/chunk/' + p1 + '.glsl';
                var chunk = NGL.Resources[ path ] || THREE.ShaderChunk[ p1 ];

                return chunk ? chunk : "";

            });

        }

        return cache[ name ];

    }

}();


NGL.trimCanvas = function( canvas, r, g, b, a ){

    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;

    var ctx = canvas.getContext( '2d' );
    var pixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight ).data;

    var x, y, doBreak;

    doBreak = false;
    for( y = 0; y < canvasHeight; y++ ) {
        for( x = 0; x < canvasWidth; x++ ) {
            var off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var topY = y;

    doBreak = false;
    for( x = 0; x < canvasWidth; x++ ) {
        for( y = 0; y < canvasHeight; y++ ) {
            var off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var topX = x;

    doBreak = false;
    for( y = canvasHeight-1; y >= 0; y-- ) {
        for( x = canvasWidth-1; x >= 0; x-- ) {
            var off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var bottomY = y;

    doBreak = false;
    for( x = canvasWidth-1; x >= 0; x-- ) {
        for( y = canvasHeight-1; y >= 0; y-- ) {
            var off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var bottomX = x;

    var trimedCanvas = document.createElement( 'canvas' );
    trimedCanvas.style.display = "hidden";
    document.body.appendChild( trimedCanvas );

    trimedCanvas.width = bottomX - topX;
    trimedCanvas.height = bottomY - topY;

    var trimedCtx = trimedCanvas.getContext( '2d' );

    trimedCtx.drawImage(
        canvas,
        topX, topY,
        trimedCanvas.width, trimedCanvas.height,
        0, 0,
        trimedCanvas.width, trimedCanvas.height
    );

    return trimedCanvas;

}


//////////
// Stats

NGL.Stats = function(){

    var SIGNALS = signals;

    this.signals = {

        updated: new SIGNALS.Signal(),

    };

    this.begin();

    this.maxDuration = -Infinity;
    this.minDuration = Infinity;
    this.lastDuration = Infinity;

    this.lastFps = Infinity;

}

NGL.Stats.prototype = {

    update: function(){

        this.startTime = this.end();

        this.signals.updated.dispatch();

    },

    begin: function(){

        this.startTime = Date.now();
        this.prevFpsTime = this.startTime;

    },

    end: function(){

        var time = Date.now();

        this.lastDuration = time - this.startTime;

        this.minDuration = Math.min( this.minDuration, this.lastDuration );
        this.maxDuration = Math.max( this.maxDuration, this.lastDuration );

        this.frames += 1;

        if( time > this.prevFpsTime + 1000 ) {

            this.lastFps = Math.round(
                ( this.frames * 1000 ) / ( time - this.startTime )
            );

            this.prevFpsTime = time;

        }

        this.frames = 0;

        return time;

    }

};


///////////
// Viewer

/**
 * [Viewer description]
 * @class
 * @param {String} eid
 */
NGL.Viewer = function( eid ){

    if( eid ){

        this.eid = eid;

        this.container = document.getElementById( eid );

        if ( this.container === document ) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        } else {
            var box = this.container.getBoundingClientRect();
            this.width = box.width;
            this.height = box.height;
        }

    }else{

        this.container = document.createElement( 'div' );

    }

    this.aspect = this.width / this.height;

    this.initParams();

    this.initCamera();

    this.initScene();

    this.initRenderer();

    this.initLights();

    this.initControls();

    this.initStats();

    window.addEventListener(
        'resize', this.onWindowResize.bind( this ), false
    );

    // fog & background
    this.setBackground();
    this.setFog();

    this.boundingBox = new THREE.Box3();

    this.info = {

        memory: {
            programs: 0,
            geometries: 0,
            textures: 0
        },

        render: {
            calls: 0,
            vertices: 0,
            faces: 0,
            points: 0
        }

    };

};

NGL.Viewer.prototype = {

    constructor: NGL.Viewer,

    initParams: function(){

        this.params = {

            fogType: null,
            fogColor: 0x000000,
            fogNear: 50,
            fogFar: 100,
            fogDensity: 0.00025,

            // backgroundColor: 0xFFFFFF,
            backgroundColor: 0x000000,

            cameraType: 1,
            cameraFov: 40,
            cameraZ: -80, // FIXME initial value should be automatically determined

            clipNear: 0,
            clipFar: 100,
            clipDist: 20,

            specular: 0x050505,

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

        this.camera = this.perspectiveCamera;

        this.camera.updateProjectionMatrix();

    },

    initRenderer: function(){

        this.renderer = new THREE.WebGLRenderer( {
            preserveDrawingBuffer: true,
            alpha: true,
            antialias: true
        } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.width, this.height );
        this.renderer.autoClear = false;
        this.renderer.sortObjects = true;

        var gl = this.renderer.context;

        NGL.extensionFragDepth = gl.getExtension( 'EXT_frag_depth' );
        if( !NGL.extensionFragDepth ){
            NGL.info( "EXT_frag_depth not supported" );
        }

        if( !this.renderer.supportsStandardDerivatives() ){
            NGL.warn( "OES_standard_derivatives not supported" );
        }

        if( !gl.getExtension( 'OES_element_index_uint' ) ){
            NGL.indexUint16 = true;
            NGL.info( "OES_element_index_uint not supported" );
        }

        if( this.eid ){
            this.container.appendChild( this.renderer.domElement );
        }

        //

        var scope = this;

        var originalSetProgram = this.renderer.setProgram;

        this.renderer.setProgram = function( camera, lights, fog, material, object ){

            var program = originalSetProgram(
                camera, lights, fog, material, object
            );

            scope.updateObjectUniforms( object, material, camera );

            scope.renderer.loadUniformsGeneric(
                scope.renderer.properties.get( material ).uniformsList
            );

            return program;

        };

        // picking texture

        if( !this.renderer.supportsFloatTextures() ){
            NGL.warn( "OES_texture_float not supported" );
        }

        if( !gl.getExtension( "WEBGL_color_buffer_float" ) ){
            NGL.warn( "WEBGL_color_buffer_float not supported" );
        }

        this.pickingTexture = new THREE.WebGLRenderTarget(
            this.width * window.devicePixelRatio,
            this.height * window.devicePixelRatio,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                stencilBuffer: false,
                format: THREE.RGBAFormat,
                type: this.supportsReadPixelsFloat() ? THREE.FloatType : THREE.UnsignedByteType
            }
        );
        this.pickingTexture.generateMipmaps = false;

    },

    supportsReadPixelsFloat: function(){

        var value = undefined;

        return function(){

            if( value === undefined ){

                var gl = this.renderer.context;

                value = (

                    ( NGL.browser === "Chrome" &&
                        this.renderer.supportsFloatTextures() ) ||

                    ( this.renderer.supportsFloatTextures() &&
                        gl.getExtension( "WEBGL_color_buffer_float" ) )

                );

            }

            return value;

        }

    }(),

    initScene: function(){

        if( !this.scene ){
            this.scene = new THREE.Scene();
        }

        this.rotationGroup = new THREE.Group();
        this.rotationGroup.name = "rotationGroup";
        this.scene.add( this.rotationGroup );

        this.modelGroup = new THREE.Group();
        this.modelGroup.name = "modelGroup";
        this.rotationGroup.add( this.modelGroup );

        this.pickingGroup = new THREE.Group();
        this.pickingGroup.name = "pickingGroup";
        this.rotationGroup.add( this.pickingGroup );

        this.backgroundGroup = new THREE.Group();
        this.backgroundGroup.name = "backgroundGroup";
        this.rotationGroup.add( this.backgroundGroup );

    },

    initLights: function(){

        var directionalLight = new THREE.DirectionalLight( 0xFFFFFF );
        directionalLight.position.copy( new THREE.Vector3( 1, 1, -2.5 ).normalize() );
        directionalLight.intensity = 0.5;

        var ambientLight = new THREE.AmbientLight( 0x101010 );

        var hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0.01 );

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
        this.controls.staticMoving = true;
        // this.controls.dynamicDampingFactor = 0.3;
        this.controls.cylindricalRotation = true;
        this.controls.keys = [ 65, 83, 68 ];

        this.controls.addEventListener(
            'change', this.requestRender.bind( this )
        );

        document.addEventListener(
            'mousemove',
            this.controls.update.bind( this.controls ),
            false
        );

        document.addEventListener(
            'touchmove',
            this.controls.update.bind( this.controls ),
            false
        );

    },

    initStats: function(){

        this.stats = new NGL.Stats();

    },

    add: function( buffer, instanceList ){

        // NGL.time( "Viewer.add" );

        var group, pickingGroup;

        group = buffer.group;
        if( buffer.pickable ){
            pickingGroup = buffer.pickingGroup;
        }

        if( buffer.size > 0 ){

            if( instanceList ){

                instanceList.forEach( function( instance ){

                    this.addBuffer(
                        buffer, group, pickingGroup, instance
                    );

                }, this );

            }else{

                this.addBuffer(
                    buffer, group, pickingGroup
                );

            }

            if( buffer.background ){
                this.backgroundGroup.add( group );
            }else{
                this.modelGroup.add( group );
            }

            if( buffer.pickable ){
                this.pickingGroup.add( pickingGroup );
            }

        }

        this.rotationGroup.updateMatrixWorld();

        this.requestRender();

        // NGL.timeEnd( "Viewer.add" );

    },

    addBuffer: function( buffer, group, pickingGroup, instance ){

        // NGL.time( "Viewer.addBuffer" );

        var renderOrder = buffer.getRenderOrder();

        if( !buffer.material ){
            buffer.material = buffer.getMaterial();
        }

        var mesh = buffer.getMesh( undefined, buffer.material );
        mesh.frustumCulled = false;
        mesh.renderOrder = renderOrder;
        mesh.userData[ "buffer" ] = buffer;
        if( instance ){
            mesh.applyMatrix( instance.matrix );
        }
        group.add( mesh );

        if( buffer.pickable ){

            if( !buffer.pickingMaterial ){
                buffer.pickingMaterial = buffer.getMaterial( "picking" );
            }

            var pickingMesh = buffer.getMesh(
                "picking", buffer.pickingMaterial
            );
            pickingMesh.frustumCulled = false;
            pickingMesh.renderOrder = renderOrder;
            pickingMesh.userData[ "buffer" ] = buffer;
            if( instance ){
                // pickingMesh.applyMatrix( instance.matrix );
                pickingMesh.matrix.copy( mesh.matrix );
                pickingMesh.position.copy( mesh.position );
                pickingMesh.quaternion.copy( mesh.quaternion );
                pickingMesh.scale.copy( mesh.scale );
                pickingMesh.userData[ "instance" ] = instance;
            }
            pickingGroup.add( pickingMesh );

            // NGL.log( pickingMesh )

        }

        if( instance ){
            this.updateBoundingBox( buffer.geometry, instance.matrix );
        }else{
            this.updateBoundingBox( buffer.geometry );
        }

        // NGL.timeEnd( "Viewer.addBuffer" );

    },

    remove: function( buffer ){

        this.rotationGroup.children.forEach( function( group ){
            group.remove( buffer.group );
        } );

        if( buffer.pickable ){
            this.pickingGroup.remove( buffer.pickingGroup );
        }

        this.updateBoundingBox();

        // this.requestRender();

    },

    updateBoundingBox: function( geometry, matrix ){

        var gbb;
        var bb = this.boundingBox;

        if( this.boundingBoxMesh ){
            this.modelGroup.remove( this.boundingBoxMesh );
            this.boundingBoxMesh.material.dispose();
            this.boundingBoxMesh.geometry.dispose();
        }

        if( geometry ){

            if( !geometry.boundingBox ){
                geometry.computeBoundingBox();
            }

            if( matrix ){
                gbb = geometry.boundingBox.clone();
                gbb.applyMatrix4( matrix );
            }else{
                gbb = geometry.boundingBox;
            }

            bb.expandByPoint( gbb.min );
            bb.expandByPoint( gbb.max );

        }else{

            bb.makeEmpty();

            this.rotationGroup.traverse( function ( node ){

                if ( node.geometry !== undefined ){

                    if( !node.geometry.boundingBox ){
                        node.geometry.computeBoundingBox();
                    }

                    if( node.userData[ "instance" ] ){
                        gbb = node.geometry.boundingBox.clone();
                        gbb.applyMatrix4( node.userData[ "instance" ].matrix );
                    }else{
                        gbb = node.geometry.boundingBox;
                    }

                    bb.expandByPoint( gbb.min );
                    bb.expandByPoint( gbb.max );

                }

            } );

        }

        this.controls.maxDistance = bb.size().length() * 10;

        if( NGL.debug ){

            var bbSize = bb.size();
            var boxGeometry = new THREE.BoxGeometry(
                bbSize.x, bbSize.y, bbSize.z
            );
            var wireframeBox = new THREE.WireframeGeometry( boxGeometry );
            this.boundingBoxMesh = new THREE.LineSegments( wireframeBox );
            bb.center( this.boundingBoxMesh.position );
            this.modelGroup.add( this.boundingBoxMesh );

        }

    },

    fullscreen: function(){

        var elem = this.container;

        if( elem.requestFullscreen ){
            elem.requestFullscreen();
        }else if( elem.msRequestFullscreen ){
            elem.msRequestFullscreen();
        }else if( elem.mozRequestFullScreen ){
            elem.mozRequestFullScreen();
        }else if( elem.webkitRequestFullscreen ){
            elem.webkitRequestFullscreen();
        }

    },

    getImage: function( type, quality ){

        return this.renderer.domElement.toBlob( type, quality );

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

        this.requestRender();

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

        this.requestRender();

    },

    setCamera: function( type, fov, near, far ){

        var p = this.params;

        if( type!==null ) p.cameraType = type;
        if( fov ) p.cameraFov = fov;
        if( near ) p.cameraNear = near;
        if( far ) p.cameraFar = far;

        this.camera = this.perspectiveCamera;

        this.perspectiveCamera.fov = p.cameraFov;
        this.perspectiveCamera.near = p.cameraNear;
        this.perspectiveCamera.far = p.cameraFar;

        this.controls.object = this.camera;
        this.camera.updateProjectionMatrix();

        this.requestRender();

    },

    setClip: function( near, far ){

        var p = this.params;

        if( near ) p.clipNear = near;
        if( far ) p.clipFar = far;

        this.requestRender();

    },

    onWindowResize: function(){

        if( this.container === document ){

            this.width = window.innerWidth;
            this.height = window.innerHeight;

        }else{

            var box = this.container.getBoundingClientRect();
            this.width = box.width;
            this.height = box.height;

        }

        this.aspect = this.width / this.height;
        this.perspectiveCamera.aspect = this.aspect;
        this.camera.updateProjectionMatrix();

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.width, this.height );

        this.pickingTexture.setSize(
            this.width * window.devicePixelRatio,
            this.height * window.devicePixelRatio
        );

        this.controls.handleResize();

        this.requestRender();

    },

    updateInfo: function( reset ){

        var info = this.info;
        var memory = info.memory;
        var render = info.render;

        if( reset ){

            memory.programs = 0;
            memory.geometries = 0;
            memory.textures = 0;

            render.calls = 0;
            render.vertices = 0;
            render.faces = 0;
            render.points = 0;

        }else{

            var rInfo = this.renderer.info;
            var rMemory = rInfo.memory;
            var rRender = rInfo.render;

            memory.programs = rMemory.programs;
            memory.geometries = rMemory.geometries;
            memory.textures = rMemory.textures;

            render.calls += rRender.calls;
            render.vertices += rRender.vertices;
            render.faces += rRender.faces;
            render.points += rRender.points;

        }

    },

    animate: function(){

        requestAnimationFrame( this.animate.bind( this ) );

        this.controls.update();
        // this.stats.update();

    },

    screenshot: function( params ){

        NGL.screenshot( this, params );

    },

    pick: function(){

        var pixelBufferFloat = new Float32Array( 4 );
        var pixelBufferUint = new Uint8Array( 4 );

        return function( x, y ){

            var gid, object, instance, bondId;

            var pixelBuffer = this.supportsReadPixelsFloat() ? pixelBufferFloat : pixelBufferUint;

            this.render( null, true );

            var gl = this.renderer.context;

            this.renderer.setRenderTarget( this.pickingTexture );

            gl.readPixels(
                x * window.devicePixelRatio,
                y * window.devicePixelRatio,
                1,
                1,
                gl.RGBA,
                this.supportsReadPixelsFloat() ? gl.FLOAT : gl.UNSIGNED_BYTE,
                pixelBuffer
            );

            this.renderer.setRenderTarget();

            if( this.supportsReadPixelsFloat() ){

                gid =
                    ( ( Math.round( pixelBuffer[0] * 255 ) << 16 ) & 0xFF0000 ) |
                    ( ( Math.round( pixelBuffer[1] * 255 ) << 8 ) & 0x00FF00 ) |
                    ( ( Math.round( pixelBuffer[2] * 255 ) ) & 0x0000FF );

            }else{

                gid =
                    ( pixelBuffer[0] << 16 ) |
                    ( pixelBuffer[1] << 8 ) |
                    ( pixelBuffer[2] );

            }

            object = this.pickingGroup.getObjectById(
                Math.round( pixelBuffer[ 3 ] )
            );

            if( object && object.userData.instance ){

                instance = object.userData.instance;

            }

            if( NGL.debug ){

                var rgba = Array.apply( [], pixelBuffer );

                NGL.log( pixelBuffer );

                NGL.log(
                    "picked color",
                    [
                        ( rgba[0] ).toPrecision(2),
                        ( rgba[1] ).toPrecision(2),
                        ( rgba[2] ).toPrecision(2),
                        ( rgba[3] ).toPrecision(2)
                    ]
                );
                NGL.log( "picked gid", gid );
                NGL.log( "picked instance", instance );
                NGL.log( "picked position", x, y );
                NGL.log( "devicePixelRatio", window.devicePixelRatio );

            }

            return {
                "gid": gid,
                "instance": instance
            };

        };

    }(),

    requestRender: function(){

        if( this._renderPending ){
            // NGL.info( "there is still a 'render' call pending" );
            return;
        }

        this._renderPending = true;
        requestAnimationFrame( this.render.bind( this ) );

    },

    render: function( e, picking, tileing ){

        // NGL.time( "Viewer.render" );

        if( this._rendering ){
            NGL.warn( "tried to call 'render' from within 'render'" );
            return;
        }

        this._rendering = true;

        // clipping

        var cDist = this.camera.position.length();
        if( !cDist ){
            // recover from a broken (NaN) camera position
            this.camera.position.set( 0, 0, this.params.cameraZ );
        }

        var bRadius = this.boundingBox.size().length() * 0.5;
        var nearFactor = ( 50 - this.params.clipNear ) / 50;
        var farFactor = - ( 50 - this.params.clipFar ) / 50;
        var nearClip = cDist - ( bRadius * nearFactor );
        this.camera.near = Math.max(
            0.1,
            // cDist - ( bRadius * nearFactor ),
            this.params.clipDist
        );
        this.camera.far = Math.max(
            1,
            cDist + ( bRadius * farFactor )
        );
        this.nearClip = nearClip;

        // fog

        var fogNearFactor = ( 50 - this.params.fogNear ) / 50;
        var fogFarFactor = - ( 50 - this.params.fogFar ) / 50;
        var fog = new THREE.Fog(
            this.params.fogColor,
            Math.max( 0.1, cDist - ( bRadius * fogNearFactor ) ),
            Math.max( 1, cDist + ( bRadius * fogFarFactor ) )
        );
        this.modelGroup.fog = fog;

        //

        this.camera.updateMatrix();
        this.camera.updateMatrixWorld( true );
        this.camera.matrixWorldInverse.getInverse( this.camera.matrixWorld );
        if( !tileing ) this.camera.updateProjectionMatrix();

        this.updateMaterialUniforms( this.scene, this.camera );
        this.sortProjectedPosition( this.scene, this.camera );

        // render

        this.updateInfo( true );

        if( picking ){

            this.renderer.clearTarget( this.pickingTexture );

            this.renderer.render(
                this.pickingGroup, this.camera, this.pickingTexture
            );
            this.updateInfo();

            // FIXME required, maybe a three.js bug
            this.renderer.setRenderTarget();

            if( NGL.debug ){

                this.renderer.clear();
                this.renderer.render( this.pickingGroup, this.camera );

            }

        }else{

            this.renderer.clear();

            this.renderer.render( this.backgroundGroup, this.camera );
            this.renderer.clearDepth();
            this.updateInfo();

            this.renderer.render( this.modelGroup, this.camera );
            this.updateInfo();

        }

        this._rendering = false;
        this._renderPending = false;

        // NGL.timeEnd( "Viewer.render" );
        // NGL.log( this.info.memory, this.info.render );

    },

    updateMaterialUniforms: function(){

        var projectionMatrixInverse = new THREE.Matrix4();
        var projectionMatrixTranspose = new THREE.Matrix4();

        return function( group, camera ){

            var bgColor = this.params.backgroundColor;
            var nearClip = this.nearClip;

            projectionMatrixInverse.getInverse(
                camera.projectionMatrix
            );

            projectionMatrixTranspose.copy(
                camera.projectionMatrix
            ).transpose();

            group.traverse( function ( o ){

                if( !o.material ) return;

                var u = o.material.uniforms;
                if( !u ) return;

                if( u.backgroundColor ){
                    u.backgroundColor.value.set( bgColor );
                }

                if( u.nearClip ){
                    u.nearClip.value = nearClip;
                }

                if( u.projectionMatrixInverse ){
                    u.projectionMatrixInverse.value.copy(
                        projectionMatrixInverse
                    );
                }

                if( u.projectionMatrixTranspose ){
                    u.projectionMatrixTranspose.value.copy(
                        projectionMatrixTranspose
                    );
                }

            } );

        }

    }(),

    updateObjectUniforms: function(){

        var matrix = new THREE.Matrix4();

        return function( object, material, camera ){

            var o = object;

            if( !o.material ) return;

            var u = o.material.uniforms;
            if( !u ) return;

            if( u.objectId ){
                u.objectId.value = this.supportsReadPixelsFloat() ? o.id : o.id / 255;
            }

            if( u.modelViewMatrixInverse ){
                u.modelViewMatrixInverse.value.getInverse(
                    o._modelViewMatrix
                );
            }

            if( u.modelViewMatrixInverseTranspose ){
                if( u.modelViewMatrixInverse ){
                    u.modelViewMatrixInverseTranspose.value.copy(
                        u.modelViewMatrixInverse.value
                    ).transpose();
                }else{
                    u.modelViewMatrixInverseTranspose.value
                        .getInverse( o._modelViewMatrix )
                        .transpose();
                }
            }

            if( u.modelViewProjectionMatrix ){
                u.modelViewProjectionMatrix.value.multiplyMatrices(
                    camera.projectionMatrix, o._modelViewMatrix
                );
            }

            if( u.modelViewProjectionMatrixInverse ){
                if( u.modelViewProjectionMatrix ){
                    matrix.copy(
                        u.modelViewProjectionMatrix.value
                    );
                    u.modelViewProjectionMatrixInverse.value.getInverse(
                        matrix
                    );
                }else{
                    matrix.multiplyMatrices(
                        camera.projectionMatrix, o._modelViewMatrix
                    );
                    u.modelViewProjectionMatrixInverse.value.getInverse(
                        matrix
                    );
                }
            }

        }

    }(),

    sortProjectedPosition: function(){

        var lastCall = 0;

        var vertex = new THREE.Vector3();
        var matrix = new THREE.Matrix4();
        var modelViewProjectionMatrix = new THREE.Matrix4();

        return function( scene, camera ){

            // NGL.time( "sort" );

            scene.traverseVisible( function ( o ){

                if( ! ( o instanceof THREE.PointCloud ) || ! o.sortParticles ){

                    return;

                }

                matrix.multiplyMatrices(
                    camera.matrixWorldInverse, o.matrixWorld
                );
                modelViewProjectionMatrix.multiplyMatrices(
                    camera.projectionMatrix, matrix
                )

                var attributes = o.geometry.attributes;
                var n = attributes.position.count;

                if( !o.userData.sortData ){
                    o.userData.sortData = {};
                }

                var sortData = o.userData.sortData;

                if( !sortData.__sortArray ){
                    sortData.__sortArray = new Float32Array( n * 2 );
                }

                var sortArray = sortData.__sortArray;

                for( var i = 0; i < n; ++i ){

                    var i2 = 2 * i;

                    vertex.fromArray( attributes.position.array, i * 3 );
                    vertex.applyProjection( modelViewProjectionMatrix );

                    // negate, so that sorting order is reversed
                    sortArray[ i2 ] = -vertex.z;
                    sortArray[ i2 + 1 ] = i;

                }

                THREE.TypedArrayUtils.quicksortIP( sortArray, 2, 0 );

                var index, indexSrc, indexDst, tmpTab;

                for( var name in attributes ){

                    var attr = attributes[ name ];
                    var array = attr.array;
                    var itemSize = attr.itemSize;

                    if( !sortData[ name ] ){
                        sortData[ name ] = new Float32Array(
                            itemSize * n
                        );
                    }

                    tmpTab = sortData[ name ];
                    sortData[ name ] = array;

                    for( var i = 0; i < n; ++i ){

                        index = sortArray[ i * 2 + 1 ];

                        for( var j = 0; j < itemSize; ++j ){
                            indexSrc = index * itemSize + j;
                            indexDst = i * itemSize + j;
                            tmpTab[ indexDst ] = array[ indexSrc ];
                        }

                    }

                    attributes[ name ].array = tmpTab;
                    attributes[ name ].needsUpdate = true;

                }

            } );

            // NGL.timeEnd( "sort" );

        }

    }(),

    clear: function(){

        NGL.log( "scene cleared" );

        this.scene.remove( this.rotationGroup );

        this.initScene();

        this.renderer.clear();

    },

    centerView: function(){

        var t = new THREE.Vector3();

        return function( zoom, center ){

            center = center || this.boundingBox.center();

            // remove any paning/translation
            this.controls.object.position.sub( this.controls.target );
            this.controls.target.copy( this.controls.target0 );

            t.copy( center ).multiplyScalar( -1 );

            if( zoom ){

                if( zoom === true ){

                    // automatic zoom that shows
                    // everything inside the bounding box

                    zoom = this.boundingBox.size().length() /
                        2 / Math.tan( Math.PI * this.camera.fov / 360 );

                }

                zoom = Math.max( zoom, 1.2 * this.params.clipDist );

                this.camera.position.multiplyScalar(
                    zoom / this.camera.position.length()
                );

            }

            this.rotationGroup.position.copy( t );
            this.rotationGroup.updateMatrixWorld();

            this.requestRender();

        }

    }(),

    getOrientation: function(){

        return [
            this.camera.position.toArray(),
            this.camera.up.toArray(),
            this.rotationGroup.position.toArray(),
            this.controls.target.toArray()
        ];

    },

    setOrientation: function( orientation ){

        console.log( "setOrientation" );

        // remove any paning/translation
        this.controls.object.position.sub( this.controls.target );
        this.controls.target.copy( this.controls.target0 );

        this.controls.target.fromArray( orientation[ 3 ] );

        this.rotationGroup.position.fromArray( orientation[ 2 ] );
        this.rotationGroup.updateMatrixWorld();

        this.camera.up.fromArray( orientation[ 1 ] );
        this.camera.position.fromArray( orientation[ 0 ] );

        this.requestRender();

    }

};


/////////////
// Renderer

NGL.TiledRenderer = function( renderer, camera, viewer, params ){

    var p = params || {};

    this.renderer = renderer;
    this.camera = camera;
    this.viewer = viewer;

    this.factor = p.factor!==undefined ? p.factor : 2;
    this.antialias = p.antialias!==undefined ? p.antialias : false;

    this.onProgress = p.onProgress;
    this.onFinish = p.onFinish;

    this.init();

};

NGL.TiledRenderer.prototype = {

    init: function(){

        if( this.antialias ) this.factor *= 2;

        this.n = this.factor * this.factor;

        // canvas

        var canvas = document.createElement( 'canvas' );
        canvas.style.display = "hidden";
        document.body.appendChild( canvas );

        if( this.antialias ){

            canvas.width = this.viewer.width * this.factor / 2;
            canvas.height = this.viewer.height * this.factor / 2;

        }else{

            canvas.width = this.viewer.width * this.factor;
            canvas.height = this.viewer.height * this.factor;

        }

        this.ctx = canvas.getContext( '2d' );
        this.canvas = canvas;

        //

        this.shearMatrix = new THREE.Matrix4();
        this.scaleMatrix = new THREE.Matrix4();

        var halfFov = THREE.Math.degToRad( this.camera.fov * 0.5 );

        this.near = this.camera.near;
        this.top = Math.tan( halfFov ) * this.near;
        this.bottom = -this.top;
        this.left = this.camera.aspect * this.bottom;
        this.right = this.camera.aspect * this.top;
        this.width = Math.abs( this.right - this.left );
        this.height = Math.abs( this.top - this.bottom );

    },

    makeAsymmetricFrustum: function( projectionMatrix, i ){

        var factor = this.factor;
        var near = this.near;
        var width = this.width;
        var height = this.height;

        var x = i % factor;
        var y = Math.floor( i / factor );

        this.shearMatrix.set(
            1, 0, ( x - ( factor - 1 ) * 0.5 ) * width / near, 0,
            0, 1, -( y - ( factor - 1 ) * 0.5 ) * height / near, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        this.scaleMatrix.set(
            factor, 0, 0, 0,
            0, factor, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        projectionMatrix
            .multiply( this.shearMatrix )
            .multiply( this.scaleMatrix );

        return projectionMatrix;

    },

    renderTile: function( i ){

        this.viewer.renderer.setPixelRatio(
            window.devicePixelRatio * this.factor
        );

        this.makeAsymmetricFrustum( this.camera.projectionMatrix, i );

        this.viewer.render( null, null, true );

        var x = ( i % this.factor ) * this.viewer.width;
        var y = Math.floor( i / this.factor ) * this.viewer.height;

        if( this.antialias ){

            this.ctx.drawImage(
                this.renderer.domElement,
                Math.floor( x / 2 ),
                Math.floor( y / 2 ),
                Math.ceil( this.viewer.width / 2 ),
                Math.ceil( this.viewer.height / 2 )
            );

        }else{

            this.ctx.drawImage(
                this.renderer.domElement,
                Math.floor( x ),
                Math.floor( y ),
                Math.ceil( this.viewer.width ),
                Math.ceil( this.viewer.height )
            );

        }

        this.camera.updateProjectionMatrix();

        if( typeof this.onProgress === "function" ){

            this.onProgress( i + 1, this.n, false );

        }

        this.viewer.renderer.setPixelRatio(
            window.devicePixelRatio
        );

    },

    render: function(){

        var n = this.n;

        for( var i = 0; i <= n; ++i ){

            if( i === n ){

                if( typeof this.onFinish === "function" ){

                    this.onFinish( i + 1, n, false );

                }

            }else{

                this.renderTile( i );

            }

        }

    },

    renderAsync: function(){

        var n = this.n;
        var renderTile = this.renderTile.bind( this );
        var onFinish = this.onFinish;

        for( var i = 0; i <= n; ++i ){

            setTimeout( function( i ){

                if( i === n ){

                    if( typeof onFinish === "function" ){

                        onFinish( i + 1, n, false );

                    }

                }else{

                    renderTile( i );

                }

            }, 0, i );

        }

    },

    dispose: function(){

        document.body.removeChild( this.canvas );

    }

};


NGL.screenshot = function( viewer, params ){

    var p = params || {};

    var trim = p.trim!==undefined ? p.trim : false;
    var type = p.type!==undefined ? p.type : "image/png";
    var quality = p.quality!==undefined ? p.quality : 1.0;
    var transparent = p.transparent!==undefined ? p.transparent : false;

    var factor = p.factor!==undefined ? p.factor : false;
    var antialias = p.antialias!==undefined ? p.antialias : false;

    var renderer = viewer.renderer;
    var camera = viewer.camera;

    var originalClearAlpha = renderer.getClearAlpha();
    var backgroundColor = renderer.getClearColor();

    if( transparent ){

        renderer.setClearAlpha( 0 );

    }

    var tiledRenderer = new NGL.TiledRenderer(

        renderer, camera, viewer,
        {
            factor: factor,
            antialias: antialias,
            onProgress: onProgress,
            onFinish: onFinish
        }

    );

    tiledRenderer.renderAsync();

    //

    function onProgress( i, n, finished ){

        if( typeof p.onProgress === "function" ){

            p.onProgress( i, n, finished );

        }

    }

    function onFinish( i, n ){

        save( n );

        if( transparent ){

            renderer.setClearAlpha( originalClearAlpha );

        }

        viewer.requestRender();

    }

    function save( n ){

        var canvas;
        var ext = type.split( "/" )[ 1 ];

        if( trim ){

            var bg = backgroundColor;
            var r = ( bg.r * 255 ) | 0;
            var g = ( bg.g * 255 ) | 0;
            var b = ( bg.b * 255 ) | 0;
            var a = transparent ? 0 : 255;

            canvas = NGL.trimCanvas( tiledRenderer.canvas, r, g, b, a );

        }else{

            canvas = tiledRenderer.canvas;

        }

        canvas.toBlob(

            function( blob ){

                NGL.download( blob, "screenshot." + ext );
                onProgress( n, n, true );

                tiledRenderer.dispose();

            },
            type, quality

        );

    }

};
