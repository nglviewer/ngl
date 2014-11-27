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
    '../fonts/Arial.fnt': '',
    '../fonts/Arial.png': 'image',
    '../fonts/DejaVu.fnt': '',
    '../fonts/DejaVu.png': 'image',
    '../fonts/LatoBlack.fnt': '',
    '../fonts/LatoBlack.png': 'image',

    // shaders
    '../shader/CylinderImpostor.vert': '',
    '../shader/CylinderImpostor.frag': '',
    '../shader/HyperballStickImpostor.vert': '',
    '../shader/HyperballStickImpostor.frag': '',
    '../shader/LineSprite.vert': '',
    '../shader/LineSprite.frag': '',
    '../shader/Mesh.vert': '',
    '../shader/Mesh.frag': '',
    '../shader/ParticleSprite.vert': '',
    '../shader/ParticleSprite.frag': '',
    '../shader/Quad.vert': '',
    '../shader/Quad.frag': '',
    '../shader/Ribbon.vert': '',
    '../shader/Ribbon.frag': '',
    '../shader/SDFFont.vert': '',
    '../shader/SDFFont.frag': '',
    '../shader/SphereHalo.vert': '',
    '../shader/SphereHalo.frag': '',
    '../shader/SphereImpostor.vert': '',
    '../shader/SphereImpostor.frag': '',

    // shader chunks
    '../shader/chunk/fog.glsl': '',
    '../shader/chunk/fog_params.glsl': '',
    '../shader/chunk/light.glsl': '',
    '../shader/chunk/light_params.glsl': '',

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

                    //console.log( indices[ i ], stride, offset, indices[ i ] * stride + offset, array.length, array[ indices[ i ] * stride + offset ] );

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


NGL.init = function( onload ){

    this.textures = [];

    NGL.initResources( onload );

    return this;

};


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

};


NGL.getShader = function( name ){

    var shader = NGL.Resources[ '../shader/' + name ];
    var re = /^(?!\/\/)\s*#include\s+(\S+)/gmi;

    return shader.replace( re, function( match, p1 ){

        var path = '../shader/chunk/' + p1 + '.glsl';
        var chunk = NGL.Resources[ path ] || THREE.ShaderChunk[ p1 ];

        return chunk ? chunk : "";

    });

};


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

    window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

    // fog & background
    this.setBackground();
    this.setFog();

    this.boundingBox = new THREE.Box3();

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
            alpha: true,
            antialias: true,
            devicePixelRatio: window.devicePixelRatio
        });
        this.renderer.setSize( this.width, this.height );
        this.renderer.autoClear = false;
        this.renderer.sortObjects = false;

        var _glExtensionFragDepth = this.renderer.context.getExtension(
            'EXT_frag_depth'
        );
        if( !_glExtensionFragDepth ){
            console.info( "EXT_frag_depth not available" );
        }
        NGL.extensionFragDepth = _glExtensionFragDepth;

        var _glStandardDerivatives = this.renderer.context.getExtension(
            'OES_standard_derivatives'
        );
        if( !_glStandardDerivatives ){
            console.error( "OES_standard_derivatives not available" );
        }

        var _glElementIndexUint = this.renderer.context.getExtension(
            'OES_element_index_uint'
        );
        if( !_glElementIndexUint ){
            NGL.indexUint16 = true;
            console.info( "OES_element_index_uint not available" );
        }

        if( this.eid ){
            this.container.appendChild( this.renderer.domElement );
        }

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

        if( !this.scene ){
            this.scene = new THREE.Scene();
            this.pickingScene = new THREE.Scene();
            this.backgroundScene = new THREE.Scene();
        }

        this.modelGroup = new THREE.Group();
        this.modelGroup.name = "modelGroup";
        this.rotationGroup = new THREE.Group();
        this.rotationGroup.name = "rotationGroup";

        this.rotationGroup.add( this.modelGroup );
        this.scene.add( this.rotationGroup );

        // picking

        this.pickingModelGroup = new THREE.Group();
        this.pickingModelGroup.name = "pickingModelGroup";
        this.pickingRotationGroup = new THREE.Group();
        this.pickingRotationGroup.name = "pickingRotationGroup";

        this.pickingRotationGroup.add( this.pickingModelGroup );
        this.pickingScene.add( this.pickingRotationGroup );

        // background

        this.backgroundModelGroup = new THREE.Group();
        this.backgroundModelGroup.name = "backgroundModelGroup";
        this.backgroundRotationGroup = new THREE.Group();
        this.backgroundRotationGroup.name = "backgroundRotationGroup";

        this.backgroundRotationGroup.add( this.backgroundModelGroup );
        this.backgroundScene.add( this.backgroundRotationGroup );

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
        this.controls.keys = [ 65, 83, 68 ];

        this.controls.addEventListener( 'change', this.render.bind( this ) );

    },

    initStats: function(){

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.right = '0px';
        this.container.appendChild( this.stats.domElement );

    },

    add: function( buffer, matrixList ){

        var group, pickingGroup;

        group = new THREE.Group();
        if( buffer.pickable ){
            pickingGroup = new THREE.Group();
        }

        if( matrixList ){

            matrixList.forEach( function( matrix ){

                var mesh = buffer.getMesh();
                mesh.frustumCulled = false;
                mesh.applyMatrix( matrix );
                mesh.userData[ "matrix" ] = matrix;
                group.add( mesh );

                if( buffer.pickable ){

                    var pickingMesh = buffer.getMesh( "picking" );
                    pickingMesh.frustumCulled = false;
                    pickingMesh.applyMatrix( matrix );
                    pickingMesh.userData[ "matrix" ] = matrix;
                    pickingGroup.add( pickingMesh );

                }

                this.updateBoundingBox( buffer.geometry, matrix );

            }, this );

        }else{

            var mesh = buffer.getMesh();
            mesh.frustumCulled = false;
            group.add( mesh );

            if( buffer.pickable ){
                var pickingMesh = buffer.getMesh( "picking" );
                pickingMesh.frustumCulled = false;
                pickingGroup.add( pickingMesh );
            }

            this.updateBoundingBox( buffer.geometry );

        }

        this.modelGroup.add( group );
        if( buffer.pickable ){
            this.pickingModelGroup.add( pickingGroup );
        }

        buffer.group = group;
        if( buffer.pickable ){
            buffer.pickingGroup = pickingGroup;
        }

        this.requestRender();

    },

    addBackground: function( buffer ){

        var mesh = buffer.getMesh( "background" );
        mesh.frustumCulled = false;

        this.backgroundModelGroup.add( mesh );

        this.updateBoundingBox( buffer.geometry );

        buffer.group = mesh;

        this.requestRender();

    },

    remove: function( buffer ){

        this.modelGroup.remove( buffer.group );
        if( buffer.pickable ){
            this.pickingModelGroup.remove( buffer.pickingGroup );
        }

        this.backgroundModelGroup.remove( buffer.group );

        this.updateBoundingBox();

        this.requestRender();

    },

    updateBoundingBox: function( geometry, matrix ){

        var gbb;
        var bb = this.boundingBox;

        if( this.boundingBoxMesh ){
            this.modelGroup.remove( this.boundingBoxMesh );
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

            this.modelGroup.traverse( function ( node ){

                if ( node.geometry !== undefined ){

                    if( !node.geometry.boundingBox ){
                        node.geometry.computeBoundingBox();
                    }

                    if( node.userData[ "matrix" ] ){
                        gbb = node.geometry.boundingBox.clone();
                        gbb.applyMatrix4( node.userData[ "matrix" ] );
                    }else{
                        gbb = node.geometry.boundingBox;
                    }

                    bb.expandByPoint( gbb.min );
                    bb.expandByPoint( gbb.max );

                }

            } );

        }

        this.controls.maxDistance = bb.size().length() * 10;

        if( NGL.GET( "debug" ) ){

            var bbSize = bb.size();
            var material = new THREE.MeshBasicMaterial( {
                color: Math.random() * 0xFFFFFF, wireframe: true
            } );
            var boxGeometry = new THREE.BoxGeometry(
                bbSize.x, bbSize.y, bbSize.z
            );
            this.boundingBoxMesh = new THREE.Mesh( boxGeometry, material );
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

        this.requestRender();

    },

    setClip: function( near, far ){

        var p = this.params;

        if( near ) p.clipNear = near;
        if( far ) p.clipFar = far;

        this.requestRender();

    },

    onWindowResize: function(){

        this.renderer.devicePixelRatio = window.devicePixelRatio;

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
        this.renderer.setSize( this.width, this.height );
        this.composer.setSize( this.width, this.height );
        this.controls.handleResize();

        this.fxaaEffect.uniforms[ 'resolution' ].value.set(
            1 / this.width, 1 / this.height
        );

        this.requestRender();

    },

    animate: function(){

        requestAnimationFrame( this.animate.bind( this ) );

        this.controls.update();

        this.stats.update();

    },

    screenshot: function( factor, type, quality, antialias, transparent, trim, progressCallback ){

        // FIXME don't show rendered parts
        // FIXME controls need to be disabled

        var scope = this;

        if( antialias ) factor *= 2;

        var i;
        var n = factor * factor;

        if( transparent ){

            this.renderer.setClearColor( this.params.backgroundColor, 0 );

        }

        var canvas = document.createElement( 'canvas' );
        canvas.style.display = "hidden";
        document.body.appendChild( canvas );

        if( antialias ){

            canvas.width = this.width * factor / 2;
            canvas.height = this.height * factor / 2;

        }else{

            canvas.width = this.width * factor;
            canvas.height = this.height * factor;

        }

        var ctx = canvas.getContext( '2d' );

        var shearMatrix = new THREE.Matrix4();
        var scaleMatrix = new THREE.Matrix4();

        var near = this.camera.near;
        var top = Math.tan( THREE.Math.degToRad( this.camera.fov * 0.5 ) ) * near;
        var bottom = - top;
        var left = this.camera.aspect * bottom;
        var right = this.camera.aspect * top;
        var width = Math.abs( right - left );
        var height = Math.abs( top - bottom );

        function makeAsymmetricFrustum( projectionMatrix, i ){

            var x = i % factor;
            var y = Math.floor( i / factor );

            shearMatrix.set(
                1, 0, ( x - ( factor - 1 ) * 0.5 ) * width / near, 0,
                0, 1, -( y - ( factor - 1 ) * 0.5 ) * height / near, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );

            scaleMatrix.set(
                factor, 0, 0, 0,
                0, factor, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );

            return projectionMatrix.multiply( shearMatrix ).multiply( scaleMatrix );

        }

        function render( i, n ){

            makeAsymmetricFrustum( scope.camera.projectionMatrix, i );

            scope.render( null, null, true );

            var x = ( i % factor ) * scope.width;
            var y = Math.floor( i / factor ) * scope.height;

            if( antialias ){

                ctx.drawImage(
                    scope.renderer.domElement,
                    Math.round( x / 2 ),
                    Math.round( y / 2 ),
                    Math.round( scope.width / 2 ),
                    Math.round( scope.height / 2 )
                );

            }else{

                ctx.drawImage( scope.renderer.domElement, x, y );

            }

            scope.camera.updateProjectionMatrix();

            if( typeof progressCallback === "function" ){

                progressCallback( i + 1, n, false );

            }

        }

        for( i = 0; i <= n; ++i ){

            setTimeout( (function( i, n ){

                return function(){

                    if( i === n ){

                        save( n );

                        if( transparent ){

                            scope.renderer.setClearColor(
                                scope.params.backgroundColor, 1
                            );

                        }

                    }else{

                        render( i, n );

                    }

                }

            })( i, n ) );

        }

        function save( n ){

            var ext = type.split( "/" )[ 1 ];

            if( trim ){

                var bg = new THREE.Color( scope.params.backgroundColor );
                var r = ( bg.r * 255 ) | 0;
                var g = ( bg.g * 255 ) | 0;
                var b = ( bg.b * 255 ) | 0;
                var a = transparent ? 0 : 255;

                canvas = NGL.trimCanvas( canvas, r, g, b, a );

            }

            canvas.toBlob(
                function( blob ){
                    NGL.download( blob, "screenshot." + ext );
                    document.body.removeChild( canvas );
                    if( typeof progressCallback === "function" ){
                        progressCallback( n, n, true );
                    }
                },
                type, quality
            );

            scope.requestRender();

        }

    },

    requestRender: function(){

        requestAnimationFrame( this.render.bind( this ) );

    },

    render: function( e, picking, tileing ){

        if( this._rendering ){
            console.warn( "tried to call 'render' from within 'render'" );
            return;
        }

        this._rendering = true;

        this.renderer.clear( true, true, true );

        // needed for picking to work on the first pick
        this.pickingRotationGroup.updateMatrixWorld();

        // clipping

        var bRadius = this.boundingBox.size().length() * 0.5;
        var cDist = this.camera.position.length();
        var nearFactor = ( 50 - this.params.clipNear ) / 50;
        var farFactor = - ( 50 - this.params.clipFar ) / 50;
        this.camera.near = Math.max(
            0.1,
            this.params.clipDist,
            cDist - ( bRadius * nearFactor )
        );
        this.camera.far = Math.max(
            1,
            cDist + ( bRadius * farFactor )
        );

        // fog

        var fogNearFactor = ( 50 - this.params.fogNear ) / 50;
        var fogFarFactor = - ( 50 - this.params.fogFar ) / 50;
        this.scene.fog = new THREE.Fog(
            this.params.fogColor,
            Math.max( 0.1, cDist - ( bRadius * fogNearFactor ) ),
            Math.max( 1, cDist + ( bRadius * fogFarFactor ) )
        );

        if( NGL.GET( "disableClipping" ) ){
            this.camera.near = 0.1;
            this.camera.far = 10000;
            this.scene.fog = null;
        }

        this.camera.updateMatrix();
        this.camera.updateMatrixWorld( true );
        this.camera.matrixWorldInverse.getInverse( this.camera.matrixWorld );
        if( !tileing ) this.camera.updateProjectionMatrix();

        if( picking ){
            this.updateDynamicUniforms( this.pickingModelGroup );
        }else{
            this.updateDynamicUniforms( this.modelGroup );
            this.updateDynamicUniforms( this.backgroundModelGroup );
        }

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

            this.renderer.render( this.backgroundScene, this.camera );
            this.renderer.clear( false, true, false );

            if( picking ){
                this.renderer.render( this.pickingScene, this.camera );
            }else{
                this.renderer.render( this.scene, this.camera );
            }

        }

        this._rendering = false;

    },

    updateDynamicUniforms: function(){

        var u;
        var matrix = new THREE.Matrix4();

        return function( group ){

            var camera = this.camera;

            group.traverse( function ( o ){

                if( !o.material ) return;

                u = o.material.uniforms;
                if( !u ) return;

                if( u.modelViewMatrixInverse ){
                    matrix.multiplyMatrices(
                        camera.matrixWorldInverse, o.matrixWorld
                    );
                    u.modelViewMatrixInverse.value.getInverse( matrix );
                }

                if( u.modelViewMatrixInverseTranspose ){
                    if( u.modelViewMatrixInverse ){
                        u.modelViewMatrixInverseTranspose.value.copy(
                            u.modelViewMatrixInverse.value
                        ).transpose();
                    }else{
                        matrix.multiplyMatrices(
                            camera.matrixWorldInverse, o.matrixWorld
                        );
                        u.modelViewMatrixInverseTranspose.value
                            .getInverse( matrix )
                            .transpose();
                    }
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
                    if( u.modelViewProjectionMatrix ){
                        u.modelViewProjectionMatrixInverse.value.copy(
                            u.modelViewProjectionMatrix.value
                        );
                        u.modelViewProjectionMatrixInverse.value.getInverse(
                            u.modelViewProjectionMatrixInverse.value
                        );
                    }else{
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

            } );

        }

    }(),

    clear: function(){

        console.log( "scene cleared" );

        this.scene.remove( this.rotationGroup );
        this.pickingScene.remove( this.pickingRotationGroup );

        this.initScene();

        this.renderer.clear();

    },

    centerView: function(){

        var t = new THREE.Vector3();

        return function( center, zoom ){

            center = center || this.boundingBox.center();

            // remove any paning/translation
            this.controls.object.position.sub( this.controls.target );
            this.controls.target.copy( this.controls.target0 );

            t.copy( center ).multiplyScalar( -1 );

            if( zoom ){

                if( zoom === true ){

                    zoom = this.boundingBox.size().length() /
                        2 / Math.tan( Math.PI * this.camera.fov / 360 );

                }

                zoom = Math.max( zoom, 1.2 * this.params.clipDist );

                this.camera.position.multiplyScalar(
                    zoom / this.camera.position.length()
                );

            }

            this.rotationGroup.position.copy( t );
            this.pickingRotationGroup.position.copy( t );
            this.backgroundRotationGroup.position.copy( t );

            this.rotationGroup.updateMatrixWorld();
            this.pickingRotationGroup.updateMatrixWorld();
            this.backgroundRotationGroup.updateMatrixWorld();

            this.requestRender();

        }

    }(),

    getOrientation: function(){

        return [
            this.camera.position.toArray(),
            this.camera.up.toArray(),
            this.rotationGroup.position.toArray()
        ];

    },

    setOrientation: function( orientation ){

        // remove any paning/translation
        this.controls.object.position.sub( this.controls.target );
        this.controls.target.copy( this.controls.target0 );

        this.camera.position.fromArray( orientation[ 0 ] );
        this.camera.up.fromArray( orientation[ 1 ] );

        this.rotationGroup.position.fromArray( orientation[ 2 ] );
        this.pickingRotationGroup.position.fromArray( orientation[ 2 ] );
        this.backgroundRotationGroup.position.fromArray( orientation[ 2 ] );

        this.rotationGroup.updateMatrixWorld();
        this.pickingRotationGroup.updateMatrixWorld();
        this.backgroundRotationGroup.updateMatrixWorld();

        this.requestRender();

    }

};


////////////////
// Buffer Core

/**
 * The core buffer class.
 * @class
 * @private
 */
NGL.Buffer = function( position, color, pickingColor ){

    // required properties:
    // - size
    // - attributeSize
    // - vertexShader
    // - fragmentShader

    this.pickable = false;
    this.transparent = this.transparent || false;
    this.side = this.side !== undefined ? this.side : THREE.DoubleSide;
    this.opacity = this.opacity !== undefined ? this.opacity : 1.0;

    this.attributes = {};
    this.geometry = new THREE.BufferGeometry();

    this.addAttributes({
        "position": { type: "v3", value: position },
        "color": { type: "c", value: color },
    });

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: pickingColor },
        });

        this.pickable = true;

    }

    this.uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
        {
            "opacity": { type: "f", value: this.opacity },
        }
    ]);

};

NGL.Buffer.prototype = {

    constructor: NGL.Buffer,

    finalize: function(){

        this.makeIndex();

        if( NGL.indexUint16 ){

            this.geometry.drawcalls = this.geometry.computeOffsets();

        }

    },

    getMesh: function( type ){

        var material = this.getMaterial( type );

        if( type === "wireframe" || this.wireframe ){

            return new THREE.Line(
                this.geometry, material, THREE.LinePieces
            );

        }else{

            return new THREE.Mesh( this.geometry, material );

        }

    },

    getMaterial: function( type ){

        var material;
        var uniforms = THREE.UniformsUtils.clone( this.uniforms );

        if( type === "picking" ){

            material = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                attributes: this.attributes,
                vertexShader: NGL.getShader( this.vertexShader ),
                fragmentShader: NGL.getShader( this.fragmentShader ),
                depthTest: true,
                transparent: false,
                depthWrite: true,
                lights: true,
                fog: false
            });

            material.side = this.side;
            material.defines[ "PICKING" ] = 1;

        }else if( type === "wireframe" || this.wireframe ){

            material = new THREE.LineBasicMaterial({
                uniforms: uniforms,
                attributes: this.attributes,
                vertexColors: true,
                fog: true
            });

        }else{

            material = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                attributes: this.attributes,
                vertexShader: NGL.getShader( this.vertexShader ),
                fragmentShader: NGL.getShader( this.fragmentShader ),
                depthTest: true,
                transparent: this.transparent,
                depthWrite: true,
                lights: true,
                fog: true
            });

            material.side = this.side;

            if( type === "background" ){

                material.defines[ "NOLIGHT" ] = 1;

            }

        }

        return material;

    },

    addUniforms: function( uniforms ){

        this.uniforms = THREE.UniformsUtils.merge([ this.uniforms, uniforms ]);

    },

    addAttributes: function( attributes ){

        var itemSize = {
            "f": 1, "v2": 2, "v3": 3, "c": 3
        };

        Object.keys( attributes ).forEach( function( name ){

            var buf;
            var a = attributes[ name ];

            this.attributes[ name ] = {
                "type": a.type, "value": null
            };

            if( a.value ){

                if( this.attributeSize * itemSize[ a.type ] !== a.value.length ){
                    console.error( "attribute value has wrong length" );
                }

                buf = a.value;

            }else{

                buf = new Float32Array(
                    this.attributeSize * itemSize[ a.type ]
                );

            }

            this.geometry.addAttribute(
                name,
                new THREE.BufferAttribute( buf, itemSize[ a.type ] )
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

        if( this.index ){

            this.geometry.addAttribute(
                "index",
                new THREE.BufferAttribute( this.index, 1 )
            );

        }

    },

    setVisibility: function( value ){

        this.group.visible = value;
        if( this.pickable ){
            this.pickingGroup.visible = value;
        }

    },

    dispose: function(){

        this.group.traverse( function ( o ){
            if( o.material ){
                o.material.dispose();
            }
        } );

        if( this.pickable ){
            this.pickingGroup.traverse( function ( o ){
                if( o.material ){
                    o.material.dispose();
                }
            } );
        }

        this.geometry.dispose();

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
NGL.MeshBuffer = function( position, color, index, normal, pickingColor, wireframe, transparent, side, opacity ){

    this.wireframe = wireframe || false;
    this.transparent = transparent !== undefined ? transparent : false;
    this.side = side !== undefined ? side : THREE.DoubleSide;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    this.size = position.length / 3;
    this.attributeSize = this.size;
    this.vertexShader = 'Mesh.vert';
    this.fragmentShader = 'Mesh.frag';

    this.index = index;

    NGL.Buffer.call( this, position, color, pickingColor );

    this.addAttributes({
        "normal": { type: "v3", value: normal },
    });

    this.finalize();

};

NGL.MeshBuffer.prototype = Object.create( NGL.Buffer.prototype );


/**
 * [MappedBuffer description]
 * @class
 * @private
 * @augments {NGL.Buffer}
 */
NGL.MappedBuffer = function(){

    this.mappedSize = this.size * this.mappingSize;
    this.attributeSize = this.mappedSize;

    NGL.Buffer.call( this );

    this.addAttributes({
        "mapping": { type: this.mappingType, value: null },
    });

};

NGL.MappedBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.MappedBuffer.prototype.finalize = function(){

    this.makeMapping();

    NGL.Buffer.prototype.finalize.call( this );

};

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

};

NGL.MappedBuffer.prototype.makeMapping = function(){

    var size = this.size;
    var mapping = this.mapping;
    var mappingSize = this.mappingSize;
    var mappingItemSize = this.mappingItemSize;

    var aMapping = this.geometry.attributes[ "mapping" ].array;

    for( var v = 0; v < size; v++ ) {

        aMapping.set( mapping, v * mappingItemSize * mappingSize );

    }

};

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

};


/**
 * [QuadBuffer description]
 * @class
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.QuadBuffer = function(){

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

};

NGL.QuadBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );


/**
 * [BoxBuffer description]
 * @class
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.BoxBuffer = function(){

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

};

NGL.BoxBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );


/**
 * [AlignedBoxBuffer description]
 * @class
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.AlignedBoxBuffer = function(){

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

};

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
NGL.SphereImpostorBuffer = function( position, color, radius, pickingColor ){

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

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: null },
        });

        this.setAttributes({
            "pickingColor": pickingColor,
        });

        this.pickable = true;

    }

    this.finalize();

};

NGL.SphereImpostorBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );


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
NGL.CylinderImpostorBuffer = function( from, to, color, color2, radius, shift, cap, pickingColor, pickingColor2 ){

    if( !shift ) shift = 0;

    this.cap = cap === undefined ? true : cap;

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

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: null },
            "pickingColor2": { type: "c", value: null },
        });

        this.setAttributes({
            "pickingColor": pickingColor,
            "pickingColor2": pickingColor2,
        });

        this.pickable = true;

    }

    this.finalize();

    // FIXME
    // if( cap ){
    //     this.material.defines[ "CAP" ] = 1;
    // }

};

NGL.CylinderImpostorBuffer.prototype = Object.create( NGL.AlignedBoxBuffer.prototype );

NGL.CylinderImpostorBuffer.prototype.getMaterial = function( type ){

    var material = NGL.Buffer.prototype.getMaterial.call( this, type );

    if( this.cap ){
        material.defines[ "CAP" ] = 1;
    }

    return material;

}


NGL.HyperballStickImpostorBuffer = function( position1, position2, color, color2, radius1, radius2, shrink, pickingColor, pickingColor2 ){

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
        "color": { type: "c", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
        "radius2": { type: "f", value: null },
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
    });

    this.setAttributes({
        "color": color,
        "color2": color2,
        "radius": radius1,
        "radius2": radius2,
        "position1": position1,
        "position2": position2,

        "position": NGL.Utils.calculateCenterArray( position1, position2 ),
    });

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: null },
            "pickingColor2": { type: "c", value: null },
        });

        this.setAttributes({
            "pickingColor": pickingColor,
            "pickingColor2": pickingColor2,
        });

        this.pickable = true;

    }

    this.finalize();

};

NGL.HyperballStickImpostorBuffer.prototype = Object.create( NGL.BoxBuffer.prototype );


////////////////////////
// Geometry Primitives


/**
 * [GeometryBuffer description]
 * @class
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.GeometryBuffer = function( position, color, pickingColor ){

    var geo = this.geo;

    var n = position.length / 3;
    var m = geo.vertices.length;
    var o = geo.faces.length;

    this.size = n * m;
    this.positionCount = n;

    this.geoPosition = NGL.Utils.positionFromGeometry( geo );
    this.geoNormal = NGL.Utils.normalFromGeometry( geo );
    this.geoIndex = NGL.Utils.indexFromGeometry( geo );

    this.meshPosition = new Float32Array( this.size * 3 );
    this.meshNormal = new Float32Array( this.size * 3 );
    this.meshIndex = new Uint32Array( n * o * 3 );
    this.meshColor = new Float32Array( this.size * 3 );
    this.meshPickingColor = new Float32Array( this.size * 3 );

    this.transformedGeoPosition = new Float32Array( m * 3 );
    this.transformedGeoNormal = new Float32Array( m * 3 );

    this.makeIndex();

    this.setAttributes({
        "position": position,
        "color": color,
        "pickingColor": pickingColor
    });

    this.meshBuffer = new NGL.MeshBuffer(
        this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor
    );

    this.pickable = this.meshBuffer.pickable;
    this.geometry = this.meshBuffer.geometry;

};

NGL.GeometryBuffer.prototype = {

    applyPositionTransform: function(){},

    setAttributes: function(){

        var matrix = new THREE.Matrix4();
        var normalMatrix = new THREE.Matrix3();

        return function( data ){

            var position, color, pickingColor;

            if( data[ "position" ] ){
                position = data[ "position" ];
                var geoPosition = this.geoPosition;
                var meshPosition = this.meshPosition;
                var transformedGeoPosition = this.transformedGeoPosition;
            }

            if( data[ "color" ] ){
                color = data[ "color" ];
                var meshColor = this.meshColor;
            }

            if( data[ "pickingColor" ] ){
                pickingColor = data[ "pickingColor" ];
                var meshPickingColor = this.meshPickingColor;
            }

            var updateNormals = ( this.updateNormals && position ) || !this.meshBuffer;

            if( updateNormals ){
                var geoNormal = this.geoNormal;
                var meshNormal = this.meshNormal;
                var transformedGeoNormal = this.transformedGeoNormal;
            }

            var n = this.positionCount;
            var m = this.geo.vertices.length;

            var i, j, k, l, i3;

            for( i = 0; i < n; ++i ){

                k = i * m * 3;
                i3 = i * 3;

                if( position ){

                    transformedGeoPosition.set( geoPosition );
                    matrix.makeTranslation(
                        position[ i3 + 0 ], position[ i3 + 1 ], position[ i3 + 2 ]
                    );
                    this.applyPositionTransform( matrix, i, i3 );
                    matrix.applyToVector3Array( transformedGeoPosition );

                    meshPosition.set( transformedGeoPosition, k );

                }

                if( updateNormals ){

                    transformedGeoNormal.set( geoNormal );
                    normalMatrix.getNormalMatrix( matrix );
                    normalMatrix.applyToVector3Array( transformedGeoNormal );

                    meshNormal.set( transformedGeoNormal, k );

                }

                if( color ){

                    for( j = 0; j < m; ++j ){

                        l = k + 3 * j;

                        meshColor[ l + 0 ] = color[ i3 + 0 ];
                        meshColor[ l + 1 ] = color[ i3 + 1 ];
                        meshColor[ l + 2 ] = color[ i3 + 2 ];

                    }

                }

                if( pickingColor ){

                    for( j = 0; j < m; ++j ){

                        l = k + 3 * j;

                        meshPickingColor[ l + 0 ] = pickingColor[ i3 + 0 ];
                        meshPickingColor[ l + 1 ] = pickingColor[ i3 + 1 ];
                        meshPickingColor[ l + 2 ] = pickingColor[ i3 + 2 ];

                    }

                }

            }

            var meshData = {};

            if( position ){
                meshData[ "position" ] = meshPosition;
            }

            if( updateNormals ){
                meshData[ "normal" ] = meshNormal;
            }

            if( color ){
                meshData[ "color" ] = meshColor;
            }

            if( pickingColor ){
                meshData[ "pickingColor" ] = meshPickingColor;
            }

            if( this.meshBuffer ){
                this.meshBuffer.setAttributes( meshData );
            }

        }

    }(),

    makeIndex: function(){

        var geoIndex = this.geoIndex;
        var meshIndex = this.meshIndex;

        var n = this.positionCount;
        var m = this.geo.vertices.length;
        var o = this.geo.faces.length;

        var p, i, j, q;
        var o3 = o * 3;

        for( i = 0; i < n; ++i ){

            j = i * o3;
            q = j + o3;

            meshIndex.set( geoIndex, j );
            for( p = j; p < q; ++p ) meshIndex[ p ] += i * m;

        }

    },

    getMesh: function( type ){

        return this.meshBuffer.getMesh( type );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

}


NGL.SphereGeometryBuffer = function( position, color, radius, pickingColor, detail ){

    detail = detail!==undefined ? detail : 1;

    this.geo = new THREE.IcosahedronGeometry( 1, detail );

    this.setPositionTransform( radius );

    NGL.GeometryBuffer.call( this, position, color, pickingColor );

};

NGL.SphereGeometryBuffer.prototype = Object.create( NGL.GeometryBuffer.prototype );

NGL.SphereGeometryBuffer.prototype.setPositionTransform = function( radius ){

    var r;
    var scale = new THREE.Vector3();

    this.applyPositionTransform = function( matrix, i ){

        r = radius[ i ];
        scale.set( r, r, r );
        matrix.scale( scale );

    }

};

NGL.SphereGeometryBuffer.prototype.setAttributes = function( data ){

    if( data[ "radius" ] ){
        this.setPositionTransform( data[ "radius" ] );
    }

    NGL.GeometryBuffer.prototype.setAttributes.call( this, data );

}


NGL.CylinderGeometryBuffer = function( from, to, color, color2, radius, pickingColor, pickingColor2, radiusSegments ){

    radiusSegments = radiusSegments || 10;

    this.updateNormals = true;

    var matrix = new THREE.Matrix4().makeRotationX( Math.PI/ 2  );

    this.geo = new THREE.CylinderGeometry(1, 1, 1, radiusSegments, 1, true);
    this.geo.applyMatrix( matrix );

    var n = from.length;
    var m = radius.length;

    this._position = new Float32Array( n * 2 );
    this._color = new Float32Array( n * 2 );
    this._pickingColor = new Float32Array( n * 2 );
    this._from = new Float32Array( n * 2 );
    this._to = new Float32Array( n * 2 );
    this._radius = new Float32Array( m * 2 );

    this.__center = new Float32Array( n );

    this.setAttributes({
        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
        "pickingColor": pickingColor,
        "pickingColor2": pickingColor2
    }, true );

    this.setPositionTransform( this._from, this._to, this._radius );

    NGL.GeometryBuffer.call(
        this, this._position, this._color, this._pickingColor
    );

};

NGL.CylinderGeometryBuffer.prototype = Object.create( NGL.GeometryBuffer.prototype );

NGL.CylinderGeometryBuffer.prototype.setPositionTransform = function( from, to, radius ){

    var r;
    var scale = new THREE.Vector3();
    var eye = new THREE.Vector3();
    var target = new THREE.Vector3();
    var up = new THREE.Vector3( 0, 1, 0 );

    this.applyPositionTransform = function( matrix, i, i3 ){

        eye.fromArray( from, i3 );
        target.fromArray( to, i3 );
        matrix.lookAt( eye, target, up );

        r = radius[ i ];
        scale.set( r, r, eye.distanceTo( target ) );
        matrix.scale( scale );

    }

};

NGL.CylinderGeometryBuffer.prototype.setAttributes = function( data, init ){

    if( !this.meshBuffer && !init ){

        NGL.GeometryBuffer.prototype.setAttributes.call( this, data );
        return;

    }

    var n = this._position.length / 2;
    var m = this._radius.length / 2;
    var geoData = {};

    if( data[ "position1" ] && data[ "position2" ] ){

        NGL.Utils.calculateCenterArray(
            data[ "position1" ], data[ "position2" ], this.__center
        );
        NGL.Utils.calculateCenterArray(
            data[ "position1" ], this.__center, this._position
        );
        NGL.Utils.calculateCenterArray(
            this.__center, data[ "position2" ], this._position, n
        );

        this._from.set( data[ "position1" ] );
        this._from.set( this.__center, n );

        this._to.set( this.__center );
        this._to.set( data[ "position2" ], n );

        geoData[ "position" ] = this._position;

    }

    if( data[ "color" ] && data[ "color2" ] ){

        this._color.set( data[ "color" ] );
        this._color.set( data[ "color2" ], n );

        geoData[ "color" ] = this._color;

    }

    if( data[ "pickingColor" ] && data[ "pickingColor2" ] ){

        this._pickingColor.set( data[ "pickingColor" ] );
        this._pickingColor.set( data[ "pickingColor2" ], n );

        geoData[ "pickingColor" ] = this._pickingColor;

    }

    if( data[ "radius" ] ){

        this._radius.set( data[ "radius" ] );
        this._radius.set( data[ "radius" ], m );

    }

    if( ( data[ "position1" ] && data[ "position2" ] ) || data[ "radius" ] ){

        this.setPositionTransform( this._from, this._to, this._radius );

    }

    if( this.meshBuffer ){

        NGL.GeometryBuffer.prototype.setAttributes.call( this, geoData );

    }

}


//////////////////////
// Pixel Primitives

/**
 * [PointBuffer description]
 * @class
 * @todo  Inherit from NGL.Buffer
 * @param {Float32Array} position
 * @param {Float32Array} color
 */
NGL.PointBuffer = function( position, color ){

    this.size = position.length / 3;

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute(
        'position', new THREE.BufferAttribute( position, 3 )
    );
    this.geometry.addAttribute(
        'color', new THREE.BufferAttribute( color, 3 )
    );

};

NGL.PointBuffer.prototype = {

    setAttributes: function( data ){

        // TODO

    },

    getMesh: function( type ){

        return new THREE.PointCloud(
            this.geometry, this.getMaterial( type )
        );

    },

    getMaterial: function( type ){

        return new THREE.PointCloudMaterial({
            vertexColors: true,
            sizeAttenuation: false,
            fog: true
        });

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


/**
 * [LineBuffer description]
 * @class
 * @todo  Inherit from NGL.Buffer
 * @param {Float32Array} from
 * @param {Float32Array} to
 * @param {Float32Array} color
 * @param {Float32Array} color2
 */
NGL.LineBuffer = function( from, to, color, color2 ){

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
            i = v * 2 * 3;

            if( from && to ){

                x1 = from[ j + 0 ];
                y1 = from[ j + 1 ];
                z1 = from[ j + 2 ];

                x2 = to[ j + 0 ];
                y2 = to[ j + 1 ];
                z2 = to[ j + 2 ];

                x = ( x1 + x2 ) / 2.0;
                y = ( y1 + y2 ) / 2.0;
                z = ( z1 + z2 ) / 2.0;

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

    getMesh: function( type ){

        return new THREE.Line(
            this.geometry, this.getMaterial( type ), THREE.LinePieces
        );

    },

    getMaterial: function( type ){

        return new THREE.LineBasicMaterial({
            attributes: this.attributes,
            vertexColors: true,
            fog: true
        });

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


NGL.TraceBuffer = function( position, color ){

    this.size = position.length / 3;

    var n = this.size;
    var n1 = n - 1;

    this.from = new Float32Array( n1 * 3 );
    this.to = new Float32Array( n1 * 3 );
    this.lineColor = new Float32Array( n1 * 3 );
    this.lineColor2 = new Float32Array( n1 * 3 );

    this.setAttributes({
        position: position,
        color: color
    });

    this.lineBuffer = new NGL.LineBuffer(
        this.from, this.to, this.lineColor, this.lineColor2
    );

    this.pickable = this.lineBuffer.pickable;
    this.geometry = this.lineBuffer.geometry;

};

NGL.TraceBuffer.prototype = {

    setAttributes: function( data ){

        var position, color;
        var from, to, lineColor, lineColor2;

        if( data[ "position" ] ){
            position = data[ "position" ];
            from = this.from;
            to = this.to;
        }

        if( data[ "color" ] ){
            color = data[ "color" ];
            lineColor = this.lineColor;
            lineColor2 = this.lineColor2;
        }

        var n = this.size;
        var n1 = n - 1;

        for( var i=0, v; i<n1; ++i ){

            v = 3 * i;

            if( position ){

                from[ v + 0 ] = position[ v + 0 ];
                from[ v + 1 ] = position[ v + 1 ];
                from[ v + 2 ] = position[ v + 2 ];

                to[ v + 0 ] = position[ v + 3 ];
                to[ v + 1 ] = position[ v + 4 ];
                to[ v + 2 ] = position[ v + 5 ];

            }

            if( color ){

                lineColor[ v + 0 ] = color[ v + 0 ];
                lineColor[ v + 1 ] = color[ v + 1 ];
                lineColor[ v + 2 ] = color[ v + 2 ];

                lineColor2[ v + 0 ] = color[ v + 3 ];
                lineColor2[ v + 1 ] = color[ v + 4 ];
                lineColor2[ v + 2 ] = color[ v + 5 ];

            }

        }

        var lineData = {};

        if( position ){
            lineData[ "from" ] = from;
            lineData[ "to" ] = to;
        }

        if( color ){
            lineData[ "color" ] = lineColor;
            lineData[ "color2" ] = lineColor2;
        }

        if( this.lineBuffer ){
            this.lineBuffer.setAttributes( lineData );
        }

    },

    getMesh: function( type ){

        return this.lineBuffer.getMesh( type );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


//////////////////////
// Sprite Primitives

NGL.ParticleSpriteBuffer = function( position, color, radius ){

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

};

NGL.ParticleSpriteBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );


NGL.RibbonBuffer = function( position, normal, dir, color, size, pickingColor, transparent, side, opacity ){

    this.vertexShader = 'Ribbon.vert';
    this.fragmentShader = 'Ribbon.frag';
    this.size = ( position.length/3 ) - 1;

    this.transparent = transparent !== undefined ? transparent : false;
    this.side = side !== undefined ? side : THREE.DoubleSide;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    var n = this.size;
    var n4 = n * 4;

    this.attributes = {
        "inputDir": { type: 'v3', value: null },
        "inputSize": { type: 'f', value: null },
        "inputNormal": { type: 'v3', value: null },
        "inputColor": { type: 'v3', value: null }
    };
    if( pickingColor ){
        this.attributes[ "pickingColor" ] = { type: 'v3', value: null };
    }

    this.uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
        {
            "opacity": { type: "f", value: this.opacity },
        }
    ]);

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute(
        'position', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'inputDir', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'inputSize', new THREE.BufferAttribute( new Float32Array( n4 ), 1 )
    );
    this.geometry.addAttribute(
        'normal', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'inputColor', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    if( pickingColor ){
        this.geometry.addAttribute(
            'pickingColor', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
        );
        this.pickable = true;
    }

    this.setAttributes({
        position: position,
        normal: normal,
        dir: dir,
        color: color,
        size: size,
        pickingColor: pickingColor
    });

    NGL.Buffer.prototype.finalize.call( this );

};

NGL.RibbonBuffer.prototype = {

    setAttributes: function( data ){

        var n = this.size;
        var n4 = n * 4;

        var attributes = this.geometry.attributes;

        var position, normal, size, dir, color, pickingColor;
        var aPosition, inputNormal, inputSize, inputDir, inputColor, inputPickingColor;

        if( data[ "position" ] ){
            position = data[ "position" ];
            aPosition = attributes[ "position" ].array;
            attributes[ "position" ].needsUpdate = true;
        }

        if( data[ "normal" ] ){
            normal = data[ "normal" ];
            inputNormal = attributes[ "normal" ].array;
            attributes[ "normal" ].needsUpdate = true;
        }

        if( data[ "size" ] ){
            size = data[ "size" ];
            inputSize = attributes[ "inputSize" ].array;
            attributes[ "inputSize" ].needsUpdate = true;
        }

        if( data[ "dir" ] ){
            dir = data[ "dir" ];
            inputDir = attributes[ "inputDir" ].array;
            attributes[ "inputDir" ].needsUpdate = true;
        }

        if( data[ "color" ] ){
            color = data[ "color" ];
            inputColor = attributes[ "inputColor" ].array;
            attributes[ "inputColor" ].needsUpdate = true;
        }

        if( data[ "pickingColor" ] ){
            pickingColor = data[ "pickingColor" ];
            inputPickingColor = attributes[ "pickingColor" ].array;
            attributes[ "pickingColor" ].needsUpdate = true;
        }

        var v, i, k, p, l, v3;
        var prevSize = size ? size[0] : null;

        for( v = 0; v < n; ++v ){

            v3 = v * 3;
            k = v * 3 * 4;
            l = v * 4;

            if( position ){

                aPosition[ k + 0 ] = position[ v3 + 0 ];
                aPosition[ k + 1 ] = position[ v3 + 1 ];
                aPosition[ k + 2 ] = position[ v3 + 2 ];

                aPosition[ k + 3 ] = position[ v3 + 0 ];
                aPosition[ k + 4 ] = position[ v3 + 1 ];
                aPosition[ k + 5 ] = position[ v3 + 2 ];

                aPosition[ k + 6 ] = position[ v3 + 3 ];
                aPosition[ k + 7 ] = position[ v3 + 4 ];
                aPosition[ k + 8 ] = position[ v3 + 5 ];

                aPosition[ k + 9 ] = position[ v3 + 3 ];
                aPosition[ k + 10 ] = position[ v3 + 4 ];
                aPosition[ k + 11 ] = position[ v3 + 5 ];

            }

            if( normal ){

                inputNormal[ k + 0 ] = normal[ v3 + 0 ];
                inputNormal[ k + 1 ] = normal[ v3 + 1 ];
                inputNormal[ k + 2 ] = normal[ v3 + 2 ];

                inputNormal[ k + 3 ] = normal[ v3 + 0 ];
                inputNormal[ k + 4 ] = normal[ v3 + 1 ];
                inputNormal[ k + 5 ] = normal[ v3 + 2 ];

                inputNormal[ k + 6 ] = normal[ v3 + 3 ];
                inputNormal[ k + 7 ] = normal[ v3 + 4 ];
                inputNormal[ k + 8 ] = normal[ v3 + 5 ];

                inputNormal[ k + 9 ] = normal[ v3 + 3 ];
                inputNormal[ k + 10 ] = normal[ v3 + 4 ];
                inputNormal[ k + 11 ] = normal[ v3 + 5 ];

            }


            for( i = 0; i<4; ++i ){
                p = k + 3 * i;

                if( color ){

                    inputColor[ p + 0 ] = color[ v3 + 0 ];
                    inputColor[ p + 1 ] = color[ v3 + 1 ];
                    inputColor[ p + 2 ] = color[ v3 + 2 ];

                }

                if( pickingColor ){

                    inputPickingColor[ p + 0 ] = pickingColor[ v3 + 0 ];
                    inputPickingColor[ p + 1 ] = pickingColor[ v3 + 1 ];
                    inputPickingColor[ p + 2 ] = pickingColor[ v3 + 2 ];

                }

            }

            if( size ){

                if( prevSize!=size[ v ] ){
                    inputSize[ l + 0 ] = Math.abs( prevSize );
                    inputSize[ l + 1 ] = Math.abs( prevSize );
                    inputSize[ l + 2 ] = Math.abs( size[ v ] );
                    inputSize[ l + 3 ] = Math.abs( size[ v ] );
                }else{
                    inputSize[ l + 0 ] = Math.abs( size[ v ] );
                    inputSize[ l + 1 ] = Math.abs( size[ v ] );
                    inputSize[ l + 2 ] = Math.abs( size[ v ] );
                    inputSize[ l + 3 ] = Math.abs( size[ v ] );
                }
                prevSize = size[ v ];

            }

            if( dir ){

                inputDir[ k + 0 ] = dir[ v3 + 0 ];
                inputDir[ k + 1 ] = dir[ v3 + 1 ];
                inputDir[ k + 2 ] = dir[ v3 + 2 ];

                inputDir[ k + 3 ] = -dir[ v3 + 0 ];
                inputDir[ k + 4 ] = -dir[ v3 + 1 ];
                inputDir[ k + 5 ] = -dir[ v3 + 2 ];

                inputDir[ k + 6 ] = dir[ v3 + 3 ];
                inputDir[ k + 7 ] = dir[ v3 + 4 ];
                inputDir[ k + 8 ] = dir[ v3 + 5 ];

                inputDir[ k + 9 ] = -dir[ v3 + 3 ];
                inputDir[ k + 10 ] = -dir[ v3 + 4 ];
                inputDir[ k + 11 ] = -dir[ v3 + 5 ];

            }

        }

    },

    makeIndex: function(){

        var n = this.size;
        var n4 = n * 4;

        var quadIndices = new Uint32Array([
            0, 1, 2,
            1, 3, 2
        ]);

        this.geometry.addAttribute(
            'index', new THREE.BufferAttribute(
                new Uint32Array( n4 * 3 ), 1
            )
        );

        var index = this.geometry.attributes[ "index" ].array;

        var s, v, ix, it;

        for( v = 0; v < n; ++v ){

            ix = v * 6;
            it = v * 4;

            index.set( quadIndices, ix );
            for( s = 0; s < 6; ++s ){
                index[ ix + s ] += it;
            }

        }

    },

    getMesh: NGL.Buffer.prototype.getMesh,

    getMaterial: NGL.Buffer.prototype.getMaterial,

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


////////////////////
// Mesh Primitives

NGL.TubeMeshBuffer = function( position, normal, binormal, tangent, color, size, radialSegments, pickingColor, rx, ry, capped, wireframe, transparent, side, opacity ){

    this.rx = rx || 1.5;
    this.ry = ry || 0.5;

    this.wireframe = wireframe || false;
    this.transparent = transparent !== undefined ? transparent : false;
    this.side = side !== undefined ? side : THREE.DoubleSide;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    this.radialSegments = radialSegments || 4;
    this.capVertices = capped ? this.radialSegments : 0;
    this.capTriangles = capped ? this.radialSegments - 2 : 0;
    this.size = position.length / 3;

    var n = this.size;
    var n1 = n - 1;
    var radialSegments1 = this.radialSegments + 1;

    var x = n * this.radialSegments * 3 + 2 * this.capVertices * 3;

    this.meshPosition = new Float32Array( x );
    this.meshColor = new Float32Array( x );
    this.meshNormal = new Float32Array( x );
    this.meshPickingColor = new Float32Array( x );
    this.meshIndex = new Uint32Array(
        n1 * 2 * radialSegments * 3 + 2 * this.capTriangles * 3
    );

    this.makeIndex();

    this.setAttributes({
        "position": position,
        "normal": normal,
        "binormal": binormal,
        "tangent": tangent,
        "color": color,
        "size": size,
        "pickingColor": pickingColor
    });

    this.meshBuffer = new NGL.MeshBuffer(
        this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor, this.wireframe,
        this.transparent, this.side, this.opacity
    );

    this.pickable = this.meshBuffer.pickable;
    this.geometry = this.meshBuffer.geometry;

}

NGL.TubeMeshBuffer.prototype = {

    setAttributes: function(){

        var vTangent = new THREE.Vector3();
        var vMeshNormal = new THREE.Vector3();

        return function( data ){

            var rx = this.rx;
            var ry = this.ry;

            var n = this.size;
            var n1 = n - 1;
            var capVertices = this.capVertices;
            var radialSegments = this.radialSegments;

            var position, normal, binormal, tangent, color, size, pickingColor;
            var meshPosition, meshColor, meshNormal, meshPickingColor

            if( data[ "position" ] ){
                position = data[ "position" ];
                normal = data[ "normal" ];
                binormal = data[ "binormal" ];
                tangent = data[ "tangent" ];
                size = data[ "size" ];
                meshPosition = this.meshPosition;
                meshNormal = this.meshNormal;
            }

            if( data[ "color" ] ){
                color = data[ "color" ];
                meshColor = this.meshColor;
            }

            if( data[ "pickingColor" ] ){
                pickingColor = data[ "pickingColor" ];
                meshPickingColor = this.meshPickingColor;
            }

            var i, j, k, l, s, t;
            var v, cx, cy;
            var cx1, cy1, cx2, cy2;
            var radius;
            var irs, irs1;

            var normX, normY, normZ;
            var biX, biY, biZ;
            var posX, posY, posZ;

            var cxArr = [];
            var cyArr = [];
            var cx1Arr = [];
            var cy1Arr = [];
            var cx2Arr = [];
            var cy2Arr = [];

            if( position ){

                for( j = 0; j < radialSegments; ++j ){

                    v = ( j / radialSegments ) * 2 * Math.PI;

                    cxArr[ j ] = rx * Math.cos( v );
                    cyArr[ j ] = ry * Math.sin( v );

                    cx1Arr[ j ] = rx * Math.cos( v - 0.01 );
                    cy1Arr[ j ] = ry * Math.sin( v - 0.01 );
                    cx2Arr[ j ] = rx * Math.cos( v + 0.01 );
                    cy2Arr[ j ] = ry * Math.sin( v + 0.01 );

                }

            }

            for( i = 0; i < n; ++i ){

                k = i * 3;
                l = k * radialSegments;

                if( position ){

                    vTangent.set(
                        tangent[ k + 0 ], tangent[ k + 1 ], tangent[ k + 2 ]
                    );

                    normX = normal[ k + 0 ];
                    normY = normal[ k + 1 ];
                    normZ = normal[ k + 2 ];

                    biX = binormal[ k + 0 ];
                    biY = binormal[ k + 1 ];
                    biZ = binormal[ k + 2 ];

                    posX = position[ k + 0 ];
                    posY = position[ k + 1 ];
                    posZ = position[ k + 2 ];

                    radius = size[ i ];

                }

                for( j = 0; j < radialSegments; ++j ){

                    s = l + j * 3

                    if( position ){

                        cx = -radius * cxArr[ j ]; // TODO: Hack: Negating it so it faces outside.
                        cy = radius * cyArr[ j ];

                        cx1 = -radius * cx1Arr[ j ];
                        cy1 = radius * cy1Arr[ j ];
                        cx2 = -radius * cx2Arr[ j ];
                        cy2 = radius * cy2Arr[ j ];

                        meshPosition[ s + 0 ] = posX + cx * normX + cy * biX;
                        meshPosition[ s + 1 ] = posY + cx * normY + cy * biY;
                        meshPosition[ s + 2 ] = posZ + cx * normZ + cy * biZ;

                        // TODO half of these are symmetric
                        vMeshNormal.set(
                            // ellipse tangent approximated as vector from/to adjacent points
                            ( cx2 * normX + cy2 * biX ) -
                                ( cx1 * normX + cy1 * biX ),
                            ( cx2 * normY + cy2 * biY ) -
                                ( cx1 * normY + cy1 * biY ),
                            ( cx2 * normZ + cy2 * biZ ) -
                                ( cx1 * normZ + cy1 * biZ )
                        ).cross( vTangent );

                        meshNormal[ s + 0 ] = vMeshNormal.x;
                        meshNormal[ s + 1 ] = vMeshNormal.y;
                        meshNormal[ s + 2 ] = vMeshNormal.z;

                    }

                    if( color ){

                        meshColor[ s + 0 ] = color[ k + 0 ];
                        meshColor[ s + 1 ] = color[ k + 1 ];
                        meshColor[ s + 2 ] = color[ k + 2 ];

                    }

                    if( pickingColor ){

                        meshPickingColor[ s + 0 ] = pickingColor[ k + 0 ];
                        meshPickingColor[ s + 1 ] = pickingColor[ k + 1 ];
                        meshPickingColor[ s + 2 ] = pickingColor[ k + 2 ];

                    }

                }

            }

            // front cap

            k = 0;
            l = n * 3 * radialSegments;

            for( j = 0; j < radialSegments; ++j ){

                s = k + j * 3;
                t = l + j * 3;

                if( position ){

                    meshPosition[ t + 0 ] = meshPosition[ s + 0 ];
                    meshPosition[ t + 1 ] = meshPosition[ s + 1 ];
                    meshPosition[ t + 2 ] = meshPosition[ s + 2 ];

                    meshNormal[ t + 0 ] = tangent[ k + 0 ];
                    meshNormal[ t + 1 ] = tangent[ k + 1 ];
                    meshNormal[ t + 2 ] = tangent[ k + 2 ];

                }

                if( color ){

                    meshColor[ t + 0 ] = meshColor[ s + 0 ];
                    meshColor[ t + 1 ] = meshColor[ s + 1 ];
                    meshColor[ t + 2 ] = meshColor[ s + 2 ];

                }

                if( pickingColor ){

                    meshPickingColor[ t + 0 ] = meshPickingColor[ s + 0 ];
                    meshPickingColor[ t + 1 ] = meshPickingColor[ s + 1 ];
                    meshPickingColor[ t + 2 ] = meshPickingColor[ s + 2 ];

                }

            }

            // back cap

            k = ( n - 1 ) * 3 * radialSegments;
            l = ( n + 1 ) * 3 * radialSegments;

            for( j = 0; j < radialSegments; ++j ){

                s = k + j * 3;
                t = l + j * 3;

                if( position ){

                    meshPosition[ t + 0 ] = meshPosition[ s + 0 ];
                    meshPosition[ t + 1 ] = meshPosition[ s + 1 ];
                    meshPosition[ t + 2 ] = meshPosition[ s + 2 ];

                    meshNormal[ t + 0 ] = tangent[ n1 * 3 + 0 ];
                    meshNormal[ t + 1 ] = tangent[ n1 * 3 + 1 ];
                    meshNormal[ t + 2 ] = tangent[ n1 * 3 + 2 ];

                }

                if( color ){

                    meshColor[ t + 0 ] = meshColor[ s + 0 ];
                    meshColor[ t + 1 ] = meshColor[ s + 1 ];
                    meshColor[ t + 2 ] = meshColor[ s + 2 ];

                }

                if( pickingColor ){

                    meshPickingColor[ t + 0 ] = meshPickingColor[ s + 0 ];
                    meshPickingColor[ t + 1 ] = meshPickingColor[ s + 1 ];
                    meshPickingColor[ t + 2 ] = meshPickingColor[ s + 2 ];

                }

            }


            var meshData = {};

            if( position ){
                meshData[ "position" ] = meshPosition;
                meshData[ "normal" ] = meshNormal;
            }

            if( color ){
                meshData[ "color" ] = meshColor;
            }

            if( pickingColor ){
                meshData[ "pickingColor" ] = meshPickingColor;
            }

            if( this.meshBuffer ){
                this.meshBuffer.setAttributes( meshData );
            }

        }

    }(),

    makeIndex: function(){

        var meshIndex = this.meshIndex;

        var n = this.size;
        var n1 = n - 1;
        var capTriangles = this.capTriangles;
        var radialSegments = this.radialSegments;
        var radialSegments1 = this.radialSegments + 1;

        var i, k, irs, irs1, l, j;

        for( i = 0; i < n1; ++i ){

            k = i * radialSegments * 3 * 2

            irs = i * radialSegments;
            irs1 = ( i + 1 ) * radialSegments;

            for( j = 0; j < radialSegments; ++j ){

                l = k + j * 3 * 2;

                // meshIndex[ l + 0 ] = irs + ( ( j + 0 ) % radialSegments );
                meshIndex[ l ] = irs + j;
                meshIndex[ l + 1 ] = irs + ( ( j + 1 ) % radialSegments );
                // meshIndex[ l + 2 ] = irs1 + ( ( j + 0 ) % radialSegments );
                meshIndex[ l + 2 ] = irs1 + j;

                // meshIndex[ l + 3 ] = irs1 + ( ( j + 0 ) % radialSegments );
                meshIndex[ l + 3 ] = irs1 + j;
                meshIndex[ l + 4 ] = irs + ( ( j + 1 ) % radialSegments );
                meshIndex[ l + 5 ] = irs1 + ( ( j + 1 ) % radialSegments );

            }

        }

        // capping

        var strip = [ 0 ];

        for( j = 1; j < radialSegments1 / 2; ++j ){

            strip.push( j );
            if( radialSegments - j !== j ){
                strip.push( radialSegments - j );
            }

        }

        // front cap

        l = n1 * radialSegments * 3 * 2;
        k = n * radialSegments;

        for( j = 0; j < strip.length - 2; ++j ){

            if( j % 2 === 0 ){
                meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 0 ];
                meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
                meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 2 ];
            }else{
                meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 2 ];
                meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
                meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 0 ];
            }

        }

        // back cap

        l = n1 * radialSegments * 3 * 2 + 3 * capTriangles;
        k = n * radialSegments + radialSegments;

        for( j = 0; j < strip.length - 2; ++j ){

            if( j % 2 === 0 ){
                meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 0 ];
                meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
                meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 2 ];
            }else{
                meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 2 ];
                meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
                meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 0 ];
            }

        }

    },

    getMesh: function( type ){

        return this.meshBuffer.getMesh( type );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


///////////////////
// API Primitives

NGL.SphereBuffer = function( position, color, radius, pickingColor, detail, disableImpostor ){

    if( !NGL.extensionFragDepth || disableImpostor ){

        return new NGL.SphereGeometryBuffer( position, color, radius, pickingColor, detail );

    }else{

        return new NGL.SphereImpostorBuffer( position, color, radius, pickingColor );

    }

};


NGL.CylinderBuffer = function( from, to, color, color2, radius, shift, cap, pickingColor, pickingColor2, radiusSegments, disableImpostor ){

    if( !NGL.extensionFragDepth || disableImpostor ){

        // FIXME cap support missing

        return new NGL.CylinderGeometryBuffer(
            from, to, color, color2, radius, pickingColor, pickingColor2, radiusSegments
        );

    }else{

        return new NGL.CylinderImpostorBuffer(
            from, to, color, color2, radius, shift, cap, pickingColor, pickingColor2
        );

    }

};


NGL.HyperballStickBuffer = function( from, to, color, color2, radius1, radius2, shrink, pickingColor, pickingColor2, disableImpostor ){

    if( !NGL.extensionFragDepth || disableImpostor ){

        return new NGL.CylinderGeometryBuffer(
            from, to, color, color2,
            NGL.Utils.calculateMinArray( radius1, radius2 ),
            0, false, pickingColor, pickingColor2
        );

    }else{

        return new NGL.HyperballStickImpostorBuffer(
            from, to, color, color2, radius1, radius2, shrink,
            pickingColor, pickingColor2
        );

    }

};


////////////////
// Text & Font


NGL.getFont = function( name ){

    var fnt = NGL.Resources[ '../fonts/' + name + '.fnt' ].split('\n');
    var font = {};
    var m, tWidth, tHeight, base, lineHeight;

    fnt.forEach( function( line ){

        if( line.substr( 0, 5 ) === 'char ' ){

            var character = {};
            var ls = line.substr( 5 ).split( /\s+/ );
            ls.forEach( function( field ){
                var fs = field.split( '=' );
                character[ fs[ 0 ] ] = parseInt( fs[ 1 ] );
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
            character.width2 = (10*width)/tWidth;
            character.height2 = (10*height)/tHeight;
            character.xadvance2 = (10*(character.xadvance))/tWidth;
            character.xoffset2 = (10*(character.xoffset))/tWidth;
            character.yoffset2 = (10*(character.yoffset))/tHeight;
            character.lineHeight = (10*lineHeight)/tHeight;
            font[ character[ 'id' ] ] = character;

        }else if( line.substr( 0, 7 ) === 'common ' ){

            // common lineHeight=38 base=30 scaleW=512 scaleH=512 pages=1 packed=0

            m = line.match( /scaleW=([0-9]+)/ );
            if( m !== null ) tWidth = m[ 1 ];

            m = line.match( /scaleH=([0-9]+)/ );
            if( m !== null ) tHeight = m[ 1 ];

            m = line.match( /base=([0-9]+)/ );
            if( m !== null ) base = m[ 1 ];

            m = line.match( /lineHeight=([0-9]+)/ );
            if( m !== null ) lineHeight = m[ 1 ];

        }else{

            //console.log( i, line );

        }

    })

    return font;

};


NGL.TextBuffer = function( position, size, color, text, font, antialias ){

    this.antialias = antialias || false;

    var fontName = font || 'Arial';
    this.font = NGL.getFont( fontName );

    this.tex = new THREE.Texture(
        NGL.Resources[ '../fonts/' + fontName + '.png' ]
    );
    this.tex.needsUpdate = true;

    var n = position.length / 3;

    var charCount = 0;
    for( var i = 0; i < n; ++i ){
        charCount += text[ i ].length;
    }

    this.text = text;
    this.size = charCount;
    this.positionCount = n;

    this.vertexShader = 'SDFFont.vert';
    this.fragmentShader = 'SDFFont.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        "fontTexture"  : { type: "t", value: this.tex }
    });

    this.addAttributes({
        "inputTexCoord": { type: "v2", value: null },
        "inputSize": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "size": size,
        "color": color
    });

    this.finalize();

};

NGL.TextBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.TextBuffer.prototype.getMaterial = function(){

    var material = NGL.Buffer.prototype.getMaterial.call( this );

    if( this.antialias ){

        material.transparent = true;
        material.depthWrite = false;
        material.blending = THREE.AdditiveBlending;
        material.defines[ "ANTIALIAS" ] = 1;

    }

    material.lights = false;
    material.uniforms.fontTexture.value = this.tex;
    material.needsUpdate = true;

    return material;

};

NGL.TextBuffer.prototype.setAttributes = function( data ){

    var position, size, color;
    var aPosition, inputSize, aColor;

    var text = this.text;
    var attributes = this.geometry.attributes;

    if( data[ "position" ] ){
        position = data[ "position" ];
        aPosition = attributes[ "position" ].array;
        attributes[ "position" ].needsUpdate = true;
    }

    if( data[ "size" ] ){
        size = data[ "size" ];
        inputSize = attributes[ "inputSize" ].array;
        attributes[ "inputSize" ].needsUpdate = true;
    }

    if( data[ "color" ] ){
        color = data[ "color" ];
        aColor = attributes[ "color" ].array;
        attributes[ "color" ].needsUpdate = true;
    }

    var n = this.positionCount;

    var i, j, o;
    var iCharAll = 0;
    var txt, iChar, nChar;

    for( var v = 0; v < n; v++ ) {

        o = 3 * v;
        txt = text[ v ];
        nChar = txt.length;

        for( iChar = 0; iChar < nChar; iChar++, iCharAll++ ) {

            i = iCharAll * 2 * 4;

            for( var m = 0; m < 4; m++ ) {

                j = iCharAll * 4 * 3 + (3 * m);

                if( data[ "position" ] ){

                    aPosition[ j + 0 ] = position[ o + 0 ];
                    aPosition[ j + 1 ] = position[ o + 1 ];
                    aPosition[ j + 2 ] = position[ o + 2 ];

                }

                if( data[ "size" ] ){

                    inputSize[ (iCharAll * 4) + m ] = size[ v ];

                }

                if( color ){

                    aColor[ j + 0 ] = color[ o + 0 ];
                    aColor[ j + 1 ] = color[ o + 1 ];
                    aColor[ j + 2 ] = color[ o + 2 ];

                }

            }

        }

    }

};

NGL.TextBuffer.prototype.makeMapping = function(){

    var font = this.font;
    var text = this.text;

    var inputTexCoord = this.geometry.attributes[ "inputTexCoord" ].array;
    var inputMapping = this.geometry.attributes[ "mapping" ].array;

    var n = this.positionCount;

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

            xadvance += c.xadvance2;

        }

    }

};


///////////
// Helper

NGL.BufferVectorHelper = function( position, vector, color, scale ){

    scale = scale || 1;

    var n = position.length/3;
    var n2 = n * 2;

    this.size = n;

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute(
        'position',
        new THREE.BufferAttribute( new Float32Array( n2 * 3 ), 3 )
    );

    this.color = color;
    this.scale = scale;

    this.setAttributes({
        position: position,
        vector: vector
    });

};

NGL.BufferVectorHelper.prototype = {

    setAttributes: function( data ){

        var n = this.size;

        var attributes = this.geometry.attributes;

        var position;
        var aPosition;

        if( data[ "position" ] ){
            position = data[ "position" ];
            aPosition = attributes[ "position" ].array;
            attributes[ "position" ].needsUpdate = true;
        }

        if( data[ "vector" ] ){
            this.vector = data[ "vector" ];
        }

        var scale = this.scale;
        var vector = this.vector;

        var i, j;

        if( data[ "position" ] ){

            for( var v = 0; v < n; v++ ){

                i = v * 2 * 3;
                j = v * 3;

                aPosition[ i + 0 ] = position[ j + 0 ];
                aPosition[ i + 1 ] = position[ j + 1 ];
                aPosition[ i + 2 ] = position[ j + 2 ];
                aPosition[ i + 3 ] = position[ j + 0 ] + vector[ j + 0 ] * scale;
                aPosition[ i + 4 ] = position[ j + 1 ] + vector[ j + 1 ] * scale;
                aPosition[ i + 5 ] = position[ j + 2 ] + vector[ j + 2 ] * scale;

            }

        }

    },

    getMesh: function(){

        var material = new THREE.LineBasicMaterial( {
            color: this.color, fog: true
        } );

        return new THREE.Line( this.geometry, material, THREE.LinePieces );;

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

}


