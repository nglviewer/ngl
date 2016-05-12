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

    // shaders
    'shader/CylinderImpostor.vert': null,
    'shader/CylinderImpostor.frag': null,
    'shader/HyperballStickImpostor.vert': null,
    'shader/HyperballStickImpostor.frag': null,
    'shader/Line.vert': null,
    'shader/Line.frag': null,
    // 'shader/LineSprite.vert': null,
    // 'shader/LineSprite.frag': null,
    'shader/Mesh.vert': null,
    'shader/Mesh.frag': null,
    // 'shader/ParticleSprite.vert': null,
    // 'shader/ParticleSprite.frag': null,
    'shader/Point.vert': null,
    'shader/Point.frag': null,
    'shader/Quad.vert': null,
    'shader/Quad.frag': null,
    'shader/Ribbon.vert': null,
    'shader/SDFFont.vert': null,
    'shader/SDFFont.frag': null,
    // 'shader/SphereHalo.vert': null,
    // 'shader/SphereHalo.frag': null,
    'shader/SphereImpostor.vert': null,
    'shader/SphereImpostor.frag': null,

    // shader chunks
    'shader/chunk/dull_interior_fragment.glsl': null,
    'shader/chunk/fog_fragment.glsl': null,
    'shader/chunk/nearclip_fragment.glsl': null,
    'shader/chunk/nearclip_vertex.glsl': null,
    'shader/chunk/opaque_back_fragment.glsl': null,

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
        var TypedArray = n * 3 > 65535 ? Uint32Array : Uint16Array;
        var index = new TypedArray( n * 3 );

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

        for( var i = 0; i < n; ++i ){

            var v = i * 3;
            var k = i * m * 3;

            var a = array[ v + 0 ];
            var b = array[ v + 1 ];
            var c = array[ v + 2 ];

            for( var j = 0; j < m; ++j ){

                var l = k + j * 3;

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


NGL.getShader = function(){

    var re = /^(?!\/\/)\s*#include\s+(\S+)/gmi;
    var cache = {};

    function getDefines( defines ){

        if( defines === undefined ) return "";

        var lines = [];

        for ( var name in defines ) {

            var value = defines[ name ];

            if ( value === false ) continue;

            lines.push( '#define ' + name + ' ' + value );

        }

        return lines.join( '\n' ) + "\n";

    }

    //

    return function( name, defines ){

        defines = defines || {};

        var hash = name + "|";
        for( var key in defines ){
            hash += key + ":" + defines[ key ];
        }

        if( !cache[ hash ] ){

            var definesText = getDefines( defines );

            var shaderText = NGL.Resources[ 'shader/' + name ];
            if( !shaderText ){
                throw "empty shader, '" + name + "'";
            }
            shaderText = shaderText.replace( re, function( match, p1 ){

                var path = 'shader/chunk/' + p1 + '.glsl';
                var chunk = NGL.Resources[ path ] || THREE.ShaderChunk[ p1 ];

                return chunk ? chunk : "";

            });

            cache[ hash ] = definesText + shaderText;

        }

        return cache[ hash ];

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


NGL.JitterVectors = [
    [
        [ 0, 0 ]
    ],
    [
        [ 4, 4 ], [ - 4, - 4 ]
    ],
    [
        [ - 2, - 6 ], [ 6, - 2 ], [ - 6, 2 ], [ 2, 6 ]
    ],
    [
        [ 1, - 3 ], [ - 1, 3 ], [ 5, 1 ], [ - 3, - 5 ],
        [ - 5, 5 ], [ - 7, - 1 ], [ 3, 7 ], [ 7, - 7 ]
    ],
    [
        [ 1, 1 ], [ - 1, - 3 ], [ - 3, 2 ], [ 4, - 1 ],
        [ - 5, - 2 ], [ 2, 5 ], [ 5, 3 ], [ 3, - 5 ],
        [ - 2, 6 ], [ 0, - 7 ], [ - 4, - 6 ], [ - 6, 4 ],
        [ - 8, 0 ], [ 7, - 4 ], [ 6, 7 ], [ - 7, - 8 ]
    ],
    [
        [ - 4, - 7 ], [ - 7, - 5 ], [ - 3, - 5 ], [ - 5, - 4 ],
        [ - 1, - 4 ], [ - 2, - 2 ], [ - 6, - 1 ], [ - 4, 0 ],
        [ - 7, 1 ], [ - 1, 2 ], [ - 6, 3 ], [ - 3, 3 ],
        [ - 7, 6 ], [ - 3, 6 ], [ - 5, 7 ], [ - 1, 7 ],
        [ 5, - 7 ], [ 1, - 6 ], [ 6, - 5 ], [ 4, - 4 ],
        [ 2, - 3 ], [ 7, - 2 ], [ 1, - 1 ], [ 4, - 1 ],
        [ 2, 1 ], [ 6, 2 ], [ 0, 4 ], [ 4, 4 ],
        [ 2, 5 ], [ 7, 5 ], [ 5, 6 ], [ 3, 7 ]
    ]
];
NGL.JitterVectors.forEach( function( offsetList ){
    offsetList.forEach( function( offset ){
        // 0.0625 = 1 / 16
        offset[ 0 ] *= 0.0625;
        offset[ 1 ] *= 0.0625;
    } );
} );


THREE.OrthographicCamera.prototype.setViewOffset = function( fullWidth, fullHeight, x, y, width, height ) {

    this.view = {
        fullWidth: fullWidth,
        fullHeight: fullHeight,
        offsetX: x,
        offsetY: y,
        width: width,
        height: height
    };

    this.updateProjectionMatrix();

};

THREE.OrthographicCamera.prototype.updateProjectionMatrix = function () {

    var dx = ( this.right - this.left ) / ( 2 * this.zoom );
    var dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
    var cx = ( this.right + this.left ) / 2;
    var cy = ( this.top + this.bottom ) / 2;

    var left = cx - dx;
    var right = cx + dx;
    var top = cy + dy;
    var bottom = cy - dy;

    if( this.view ){
        left -= this.view.offsetX / this.zoom;
        right -= this.view.offsetX / this.zoom;
        top -= this.view.offsetY / this.zoom;
        bottom -= this.view.offsetY / this.zoom;
    }

    this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far );

};


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
    this.avgDuration = 14;
    this.lastDuration = Infinity;

    this.prevFpsTime = 0;
    this.lastFps = Infinity;
    this.lastFrames = 1;
    this.frames = 0;
    this.count = 0;

}

NGL.Stats.prototype = {

    update: function(){

        this.startTime = this.end();
        this.signals.updated.dispatch();

    },

    begin: function(){

        this.startTime = performance.now();
        this.lastFrames = this.frames;

    },

    end: function(){

        var time = performance.now();

        this.count += 1;
        this.frames += 1;

        this.lastDuration = time - this.startTime;
        this.minDuration = Math.min( this.minDuration, this.lastDuration );
        this.maxDuration = Math.max( this.maxDuration, this.lastDuration );
        this.avgDuration -= this.avgDuration / 30;
        this.avgDuration += this.lastDuration / 30;

        if( time > this.prevFpsTime + 1000 ) {
            this.lastFps = this.frames;
            this.prevFpsTime = time;
            this.frames = 0;
        }

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
NGL.Viewer = function( eid, params ){

    var SIGNALS = signals;

    this.signals = {

        orientationChanged: new SIGNALS.Signal(),

    };

    if( eid ){
        this.container = document.getElementById( eid );
    }else{
        this.container = document.createElement( 'div' );
    }

    if ( this.container === document ) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    } else {
        var box = this.container.getBoundingClientRect();
        this.width = box.width;
        this.height = box.height;
    }

    this.initParams();
    this.initStats();
    // this.holdRendering = true;

    this.initCamera();
    this.initScene();
    if( this.initRenderer() === false ) return;
    this.initControls();
    this.initHelper();

    this._render = this.render.bind( this );
    this._animate = this.animate.bind( this );

    // fog & background
    this.setBackground();
    this.setFog();

    this.boundingBox = new THREE.Box3();
    this.distVector = new THREE.Vector3();

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

            fogColor: new THREE.Color( 0x000000 ),
            fogNear: 50,
            fogFar: 100,

            backgroundColor: new THREE.Color( 0x000000 ),

            cameraType: "perspective",
            cameraFov: 40,
            cameraZ: -80, // FIXME initial value should be automatically determined

            clipNear: 0,
            clipFar: 100,
            clipDist: 10,

            spinAxis: null,
            spinAngle: 0.01,

            lightColor: new THREE.Color( 0xdddddd ),
            lightIntensity: 1.0,
            ambientColor: new THREE.Color( 0xdddddd ),
            ambientIntensity: 0.2,

            holdRendering: false,
            sampleLevel: 0

        };

    },

    initCamera: function(){

        var p = this.params;
        var lookAt = new THREE.Vector3( 0, 0, 0 );

        this.perspectiveCamera = new THREE.PerspectiveCamera(
            p.cameraFov, this.width / this.height, 0.1, 10000
        );
        this.perspectiveCamera.position.z = p.cameraZ;
        this.perspectiveCamera.lookAt( lookAt );

        this.orthographicCamera = new THREE.OrthographicCamera(
            this.width / -2, this.width / 2,
            this.height / 2, this.height / -2,
            0.1, 10000
        );
        this.orthographicCamera.position.z = p.cameraZ;
        this.orthographicCamera.lookAt( lookAt );

        if( p.cameraType === "orthographic" ){
            this.camera = this.orthographicCamera;
        }else{  // p.cameraType === "perspective"
            this.camera = this.perspectiveCamera;
        }
        this.camera.updateProjectionMatrix();

    },

    initRenderer: function(){

        try{
            this.renderer = new THREE.WebGLRenderer( {
                preserveDrawingBuffer: true,
                alpha: true,
                antialias: true
            } );
        }catch( e ){
            this.container.innerHTML = NGL.webglErrorMessage;
            return false;
        }
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.width, this.height );
        this.renderer.autoClear = false;
        this.renderer.sortObjects = true;

        // var gl = this.renderer.getContext();
        // console.log( gl.getContextAttributes().antialias );
        // console.log( gl.getParameter(gl.SAMPLES) );

        NGL.extensionFragDepth = this.renderer.extensions.get( "EXT_frag_depth" );
        NGL.indexUint16 = !this.renderer.extensions.get( 'OES_element_index_uint' );

        NGL.supportsReadPixelsFloat = (
            ( NGL.browser === "Chrome" &&
                this.renderer.extensions.get( 'OES_texture_float' ) ) ||
            ( this.renderer.extensions.get( 'OES_texture_float' ) &&
                this.renderer.extensions.get( "WEBGL_color_buffer_float" ) )
        );

        this.container.appendChild( this.renderer.domElement );

        // picking texture

        this.renderer.extensions.get( 'OES_texture_float' );
        NGL.supportsHalfFloat = this.renderer.extensions.get( 'OES_texture_half_float' );
        this.renderer.extensions.get( "WEBGL_color_buffer_float" );

        this.pickingTarget = new THREE.WebGLRenderTarget(
            this.width * window.devicePixelRatio,
            this.height * window.devicePixelRatio,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                stencilBuffer: false,
                format: THREE.RGBAFormat,
                type: NGL.supportsReadPixelsFloat ? THREE.FloatType : THREE.UnsignedByteType
            }
        );
        this.pickingTarget.texture.generateMipmaps = false;

        // msaa textures

        this.sampleLevel = 0;

        this.sampleTarget = new THREE.WebGLRenderTarget(
            this.width * window.devicePixelRatio,
            this.height * window.devicePixelRatio,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat,
            }
        );

        this.holdTarget = new THREE.WebGLRenderTarget(
            this.width * window.devicePixelRatio,
            this.height * window.devicePixelRatio,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat,
                type: NGL.supportsHalfFloat ? THREE.HalfFloatType : THREE.FloatType
            }
        );

        this.compositeUniforms = {
            "tForeground": { type: "t", value: null },
            "scale": { type: "f", value: 1.0 }
        };

        this.compositeMaterial = new THREE.ShaderMaterial( {
            uniforms: this.compositeUniforms,
            vertexShader: NGL.getShader( "Quad.vert" ),
            fragmentShader: NGL.getShader( "Quad.frag" ),
            transparent: true,
            blending: THREE.CustomBlending,
            blendSrc: THREE.OneFactor,
            blendDst: THREE.OneFactor,
            blendSrcAlpha: THREE.OneFactor,
            blendDstAlpha: THREE.OneFactor,
            blendEquation: THREE.AddEquation,
            depthTest: false,
            depthWrite: false
        } );

        this.compositeCamera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
        this.compositeScene = new THREE.Scene().add( new THREE.Mesh(
            new THREE.PlaneGeometry( 2, 2 ), this.compositeMaterial
        ) );

    },

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

        this.helperGroup = new THREE.Group();
        this.helperGroup.name = "helperGroup";
        this.rotationGroup.add( this.helperGroup );

        // fog

        this.modelGroup.fog = new THREE.Fog();

        // light

        this.pointLight = new THREE.SpotLight(
            this.params.lightColor, this.params.lightIntensity
        );
        this.modelGroup.add( this.pointLight );

        this.ambientLight = new THREE.AmbientLight(
            this.params.ambientLight, this.params.ambientIntensity
        );
        this.modelGroup.add( this.ambientLight );

    },

    initHelper: function(){

        var indices = new Uint16Array( [
            0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6,
            6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7
        ] );
        var positions = new Float32Array( 8 * 3 );

        var bbGeometry = new THREE.BufferGeometry();
        bbGeometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
        bbGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        var bbMaterial = new THREE.LineBasicMaterial( { color: "skyblue", linewidth: 2 } );

        this.boundingBoxMesh = new THREE.LineSegments( bbGeometry, bbMaterial );
        this.helperGroup.add( this.boundingBoxMesh );

    },

    updateHelper: function(){

        var position = this.boundingBoxMesh.geometry.attributes.position;
        var array = position.array;

        var bb = this.boundingBox;
        var min = bb.min;
        var max = bb.max;

        array[  0 ] = max.x; array[  1 ] = max.y; array[  2 ] = max.z;
        array[  3 ] = min.x; array[  4 ] = max.y; array[  5 ] = max.z;
        array[  6 ] = min.x; array[  7 ] = min.y; array[  8 ] = max.z;
        array[  9 ] = max.x; array[ 10 ] = min.y; array[ 11 ] = max.z;
        array[ 12 ] = max.x; array[ 13 ] = max.y; array[ 14 ] = min.z;
        array[ 15 ] = min.x; array[ 16 ] = max.y; array[ 17 ] = min.z;
        array[ 18 ] = min.x; array[ 19 ] = min.y; array[ 20 ] = min.z;
        array[ 21 ] = max.x; array[ 22 ] = min.y; array[ 23 ] = min.z;

        position.needsUpdate = true;

        if( !bb.isEmpty() ){
            this.boundingBoxMesh.geometry.computeBoundingSphere();
        }

    },

    initControls: function(){

        function preventDefault( e ){
            e.preventDefault();
        }
        this.renderer.domElement.addEventListener(
            'mousewheel', preventDefault, false
        );
        this.renderer.domElement.addEventListener(  // firefox
            'MozMousePixelScroll', preventDefault, false
        );
        this.renderer.domElement.addEventListener(
            'touchmove', preventDefault, false
        );

        this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
        this.controls.rotateSpeed = 2.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.staticMoving = true;
        // this.controls.dynamicDampingFactor = 0.3;
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

        this.controls.addEventListener(
            'change',
            function(){
                this.signals.orientationChanged.dispatch();
            }.bind( this ),
            false
        );

    },

    initStats: function(){

        this.stats = new NGL.Stats();

    },

    add: function( buffer, instanceList ){

        // NGL.time( "Viewer.add" );

        if( instanceList ){

            instanceList.forEach( function( instance ){

                this.addBuffer( buffer, instance );

            }, this );

        }else{

            this.addBuffer( buffer );

        }

        if( buffer.background ){
            this.backgroundGroup.add( buffer.group );
            this.backgroundGroup.add( buffer.wireframeGroup );
        }else{
            this.modelGroup.add( buffer.group );
            this.modelGroup.add( buffer.wireframeGroup );
        }

        if( buffer.pickable ){
            this.pickingGroup.add( buffer.pickingGroup );
        }

        this.rotationGroup.updateMatrixWorld();
        if( NGL.debug ) this.updateHelper();

        // this.requestRender();

        // NGL.timeEnd( "Viewer.add" );

    },

    addBuffer: function( buffer, instance ){

        // NGL.time( "Viewer.addBuffer" );

        var mesh = buffer.getMesh();
        mesh.userData[ "buffer" ] = buffer;
        if( instance ){
            mesh.applyMatrix( instance.matrix );
            mesh.userData[ "instance" ] = instance;
        }
        buffer.group.add( mesh );

        var wireframeMesh = buffer.getWireframeMesh();
        wireframeMesh.userData[ "buffer" ] = buffer;
        if( instance ){
            // wireframeMesh.applyMatrix( instance.matrix );
            wireframeMesh.matrix.copy( mesh.matrix );
            wireframeMesh.position.copy( mesh.position );
            wireframeMesh.quaternion.copy( mesh.quaternion );
            wireframeMesh.scale.copy( mesh.scale );
            wireframeMesh.userData[ "instance" ] = instance;
        }
        buffer.wireframeGroup.add( wireframeMesh );

        if( buffer.pickable ){

            var pickingMesh = buffer.getPickingMesh();
            pickingMesh.userData[ "buffer" ] = buffer;
            if( instance ){
                // pickingMesh.applyMatrix( instance.matrix );
                pickingMesh.matrix.copy( mesh.matrix );
                pickingMesh.position.copy( mesh.position );
                pickingMesh.quaternion.copy( mesh.quaternion );
                pickingMesh.scale.copy( mesh.scale );
                pickingMesh.userData[ "instance" ] = instance;
            }
            buffer.pickingGroup.add( pickingMesh );

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
            group.remove( buffer.wireframeGroup );
        } );

        if( buffer.pickable ){
            this.pickingGroup.remove( buffer.pickingGroup );
        }

        this.updateBoundingBox();
        if( NGL.debug ) this.updateHelper();

        // this.requestRender();

    },

    updateBoundingBox: function( geometry, matrix ){

        var gbb;
        var bb = this.boundingBox;

        function updateGeometry( geometry, matrix ){

            if( geometry.attributes.position.count === 0 ) return;

            if( !geometry.boundingBox ){
                geometry.computeBoundingBox();
            }

            if( matrix ){
                gbb = geometry.boundingBox.clone();
                gbb.applyMatrix4( matrix );
            }else{
                gbb = geometry.boundingBox;
            }

            if( gbb.min.equals( gbb.max ) ){
                // mainly to give a single impostor geometry some volume
                // as it is only expanded in the shader on the GPU
                gbb.expandByScalar( 5 );
            }

            bb.expandByPoint( gbb.min );
            bb.expandByPoint( gbb.max );

        }

        function updateNode( node ){

            if( node.geometry !== undefined ){

                var matrix = undefined;
                if( node.userData[ "instance" ] ){
                    matrix = node.userData[ "instance" ].matrix;
                }

                updateGeometry( node.geometry, matrix );

            }

        }

        if( geometry ){

            updateGeometry( geometry, matrix );

        }else{

            bb.makeEmpty();
            this.modelGroup.traverse( updateNode );
            this.backgroundGroup.traverse( updateNode );

        }

        this.controls.maxDistance = bb.size().length() * 10;

    },

    getImage: function(){

        var renderer = this.renderer;

        return new Promise( function( resolve, reject ){
            renderer.domElement.toBlob( resolve, "image/png" );
        } );

    },

    makeImage: function( params ){

        return NGL.makeImage( this, params );

    },

    setLight: function( color, intensity, ambientColor, ambientIntensity ){

        var p = this.params;

        if( color !== undefined ) p.lightColor.set( color );
        if( intensity !== undefined ) p.lightIntensity = intensity;
        if( ambientColor !== undefined ) p.ambientColor.set( ambientColor );
        if( ambientIntensity !== undefined ) p.ambientIntensity = ambientIntensity;

        this.requestRender();

    },

    setFog: function( color, near, far ){

        var p = this.params;

        if( color !== undefined ) p.fogColor.set( color );
        if( near !== undefined ) p.fogNear = near;
        if( far !== undefined ) p.fogFar = far;

        this.requestRender();

    },

    setBackground: function( color ){

        var p = this.params;

        if( color ) p.backgroundColor.set( color );

        this.setFog( p.backgroundColor );
        this.renderer.setClearColor( p.backgroundColor, 0 );
        this.renderer.domElement.style.backgroundColor = p.backgroundColor.getStyle();

        this.requestRender();

    },

    setSampling: function( level ){

        if( level !== undefined ){
            this.params.sampleLevel = level;
            this.sampleLevel = level;
        }

        this.requestRender();

    },

    setCamera: function( type, fov ){

        var p = this.params;

        if( type ) p.cameraType = type;
        if( fov ) p.cameraFov = fov;

        if( p.cameraType === "orthographic" ){
            if( this.camera !== this.orthographicCamera ){
                this.camera = this.orthographicCamera;
                this.camera.position.copy( this.perspectiveCamera.position );
                this.camera.up.copy( this.perspectiveCamera.up );
                this.__updateZoom();
            }
        }else{  // p.cameraType === "perspective"
            if( this.camera !== this.perspectiveCamera ){
                this.camera = this.perspectiveCamera;
                this.camera.position.copy( this.orthographicCamera.position );
                this.camera.up.copy( this.orthographicCamera.up );
            }
        }

        this.perspectiveCamera.fov = p.cameraFov;
        this.controls.object = this.camera;
        this.camera.lookAt( this.controls.target );
        this.camera.updateProjectionMatrix();

        this.requestRender();

    },

    setClip: function( near, far, dist ){

        var p = this.params;

        if( near !== undefined ) p.clipNear = near;
        if( far !== undefined ) p.clipFar = far;
        if( dist !== undefined ) p.clipDist = dist;

        this.requestRender();

    },

    setSpin: function( axis, angle ){

        var p = this.params;

        if( axis !== undefined ) p.spinAxis = axis;
        if( angle !== undefined ) p.spinAngle = angle;

    },

    setSize: function( width, height ){

        this.width = width;
        this.height = height;

        this.perspectiveCamera.aspect = this.width / this.height;
        this.orthographicCamera.left = -this.width / 2;
        this.orthographicCamera.right = this.width / 2;
        this.orthographicCamera.top = this.height / 2;
        this.orthographicCamera.bottom = -this.height / 2;
        this.camera.updateProjectionMatrix();

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.width, this.height );

        this.pickingTarget.setSize(
            this.width * window.devicePixelRatio,
            this.height * window.devicePixelRatio
        );
        this.sampleTarget.setSize(
            this.width * window.devicePixelRatio,
            this.height * window.devicePixelRatio
        );
        this.holdTarget.setSize(
            this.width * window.devicePixelRatio,
            this.height * window.devicePixelRatio
        );

        this.controls.handleResize();

        if( this.params.sampleLevel === -1 ){
            this.sampleLevel = 0;
        }

        this.requestRender();

    },

    handleResize: function(){

        if( this.container === document ){

            this.setSize( window.innerWidth, window.innerHeight );

        }else{

            var box = this.container.getBoundingClientRect();
            this.setSize( box.width, box.height );

        }

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

    rotate: function(){

        var eye = new THREE.Vector3();
        var quaternion = new THREE.Quaternion();
        var eyeDirection = new THREE.Vector3();
        var upDirection = new THREE.Vector3();
        var sidewaysDirection = new THREE.Vector3();
        var moveDirection = new THREE.Vector3();

        return function( axis, angle ){

            eye.copy( this.camera.position ).sub( this.controls.target );
            eyeDirection.copy( eye ).normalize();
            upDirection.copy( this.camera.up ).normalize();
            sidewaysDirection.crossVectors( upDirection, eyeDirection ).normalize();

            eyeDirection.setLength( axis.z );
            upDirection.setLength( axis.y );
            sidewaysDirection.setLength( axis.x );
            moveDirection.copy( sidewaysDirection.sub( upDirection ).add( eyeDirection ) );

            quaternion.setFromAxisAngle( moveDirection.normalize(), angle );
            eye.applyQuaternion( quaternion );

            this.camera.up.applyQuaternion( quaternion );
            this.camera.position.addVectors( this.controls.target, eye );
            this.camera.lookAt( this.controls.target );

        }

    }(),

    zoom: function(){

        var eye = new THREE.Vector3();
        var eyeDirection = new THREE.Vector3();

        return function( distance ){

            eye.copy( this.camera.position ).sub( this.controls.target );
            eyeDirection.copy( eye ).normalize();

            eyeDirection.setLength( distance );
            eye.add( eyeDirection );

            this.camera.position.addVectors( this.controls.target, eye );
            this.camera.lookAt( this.controls.target );

            this.__updateZoom();

        }

    }(),

    animate: function(){

        this.controls.update();

        if( performance.now() - this.stats.startTime > 500 && !this.still && this.sampleLevel < 3 ){

            var currentSampleLevel = this.sampleLevel;
            this.sampleLevel = 3;
            this._renderPending = true;
            this.render();
            this.still = true;
            this.sampleLevel = currentSampleLevel;
            if( NGL.debug ) NGL.log( "rendered still frame" );

        }else if( this.params.sampleLevel === -1 ){

            if( this.stats.avgDuration > 30 ){
                this.sampleLevel = Math.max( 0, this.sampleLevel - 1 );
                if( NGL.debug ) NGL.log( "sample level down", this.sampleLevel );
                this.stats.count = 0;
            }else if( this.stats.avgDuration < 17 && this.stats.count > 60 ){
                this.sampleLevel = Math.min( 5, this.sampleLevel + 1 );
                if( NGL.debug ) NGL.log( "sample level up", this.sampleLevel );
                this.stats.count = 0;
            }

        }

        // spin

        var p = this.params;

        if( p.spinAxis && p.spinAngle ){
            this.rotate( p.spinAxis, p.spinAngle * this.stats.lastDuration / 16 );
            this.requestRender();
        }

        requestAnimationFrame( this._animate );

    },

    pick: function(){

        var pixelBufferFloat = new Float32Array( 4 );
        var pixelBufferUint = new Uint8Array( 4 );

        return function( x, y ){

            x *= window.devicePixelRatio;
            y *= window.devicePixelRatio;

            var gid, object, instance, bondId;
            var pixelBuffer = NGL.supportsReadPixelsFloat ? pixelBufferFloat : pixelBufferUint;

            this.render( null, true );
            this.renderer.readRenderTargetPixels(
                this.pickingTarget, x, y, 1, 1, pixelBuffer
            );

            if( NGL.supportsReadPixelsFloat ){
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

        if( this._renderPending || this.holdRendering ){
            // NGL.info( "there is still a 'render' call pending" );
            return;
        }

        // start gathering stats anew after inactivity
        if( performance.now() - this.stats.startTime > 22 ){
            this.stats.begin();
            this.still = false;
        }

        this._renderPending = true;

        requestAnimationFrame( function(){
            this.render();
            this.stats.update();
        }.bind( this ) );

    },

    __updateClipping: function(){

        var p = this.params;
        var camera = this.camera;

        // clipping

        var cDist = this.distVector.copy( camera.position )
                        .sub( this.controls.target ).length();
        // console.log( "cDist", cDist )
        if( !cDist ){
            // recover from a broken (NaN) camera position
            camera.position.set( 0, 0, p.cameraZ );
            cDist = Math.abs( p.cameraZ );
        }
        this.cDist = cDist;

        var bRadius = Math.max( 10, this.boundingBox.size( this.distVector ).length() * 0.5 );
        bRadius += this.boundingBox.center( this.distVector )
            .add( this.rotationGroup.position )
            .length();
        if( bRadius === Infinity || bRadius === -Infinity || isNaN( bRadius ) ){
            // console.warn( "something wrong with bRadius" );
            bRadius = 50;
        }
        this.bRadius = bRadius;

        var nearFactor = ( 50 - p.clipNear ) / 50;
        var farFactor = - ( 50 - p.clipFar ) / 50;
        camera.near = Math.max( 0.1, p.clipDist, cDist - ( bRadius * nearFactor ) );
        camera.far = Math.max( 1, cDist + ( bRadius * farFactor ) );

        // fog

        var fogNearFactor = ( 50 - p.fogNear ) / 50;
        var fogFarFactor = - ( 50 - p.fogFar ) / 50;
        var fog = this.modelGroup.fog;
        fog.color.set( p.fogColor );
        fog.near = Math.max( 0.1, cDist - ( bRadius * fogNearFactor ) );
        fog.far = Math.max( 1, cDist + ( bRadius * fogFarFactor ) );

    },

    __updateZoom: function(){

        this.__updateClipping();
        var fov = THREE.Math.degToRad( this.perspectiveCamera.fov );
        var near = this.camera.near;
        var far = this.camera.far;
        var hyperfocus = ( near + far ) / 2;
        var height = 2 * Math.tan( fov / 2 ) * hyperfocus;
        this.orthographicCamera.zoom = this.height / height;

    },

    __updateCamera: function( tileing ){

        var camera = this.camera;

        camera.updateMatrix();
        camera.updateMatrixWorld( true );
        camera.matrixWorldInverse.getInverse( camera.matrixWorld );
        if( !tileing ) this.camera.updateProjectionMatrix();

        this.updateMaterialUniforms( this.scene, camera );
        this.sortProjectedPosition( this.scene, camera );

    },

    __updateLights: function(){

        var p = this.params;
        var camera = this.camera;

        var pointLight = this.pointLight;
        pointLight.position.copy( camera.position ).multiplyScalar( 100 );
        pointLight.updateMatrixWorld();
        pointLight.color.set( p.lightColor );
        pointLight.intensity = p.lightIntensity;

        var ambientLight = this.ambientLight;
        ambientLight.color.set( p.ambientColor );
        ambientLight.intensity = p.ambientIntensity;

    },

    __renderPickingGroup: function(){

        this.renderer.clearTarget( this.pickingTarget );
        this.renderer.render(
            this.pickingGroup, this.camera, this.pickingTarget
        );
        this.updateInfo();
        this.renderer.setRenderTarget( null );  // back to standard render target

        if( NGL.debug ){
            this.renderer.clear();
            this.renderer.render( this.pickingGroup, this.camera );
            this.renderer.render( this.helperGroup, this.camera );
        }

    },

    __renderModelGroup: function( renderTarget ){

        if( renderTarget ){
            this.renderer.clearTarget( renderTarget );
        }else{
            this.renderer.clear();
        }

        this.renderer.render( this.backgroundGroup, this.camera, renderTarget );
        if( renderTarget ){
            this.renderer.clearTarget( renderTarget, false, true, false );
        }else{
            this.renderer.clearDepth();
        }
        this.updateInfo();

        this.renderer.render( this.modelGroup, this.camera, renderTarget );
        this.updateInfo();

        if( NGL.debug ){
            this.renderer.render( this.helperGroup, this.camera, renderTarget );
        }

    },

    __renderMultiSample: function(){

        // based on the Manual Multi-Sample Anti-Aliasing Render Pass
        // contributed to three.js by bhouston / http://clara.io/
        //
        // This manual approach to MSAA re-renders the scene ones for
        // each sample with camera jitter and accumulates the results.
        // References: https://en.wikipedia.org/wiki/Multisample_anti-aliasing

        var camera = this.camera;
        var offsetList = NGL.JitterVectors[ Math.max( 0, Math.min( this.sampleLevel, 5 ) ) ];

        this.compositeUniforms[ "scale" ].value = 1.0 / offsetList.length;
        this.compositeUniforms[ "tForeground" ].value = this.sampleTarget;
        this.compositeUniforms[ "tForeground" ].needsUpdate = true;
        this.compositeMaterial.needsUpdate = true;

        // this.renderer.setRenderTarget( this.sampleTarget );
        var width = this.sampleTarget.width;
        var height = this.sampleTarget.height;

        // render the scene multiple times, each slightly jitter offset
        // from the last and accumulate the results.
        for ( var i = 0; i < offsetList.length; ++i ){

            var offset = offsetList[ i ];
            camera.setViewOffset(
                width, height, offset[ 0 ], offset[ 1 ], width, height
            );
            this.__updateCamera();

            this.__renderModelGroup( this.sampleTarget );
            this.renderer.render(
                this.compositeScene, this.compositeCamera, this.holdTarget, ( i === 0 )
            );

        }

        this.renderer.setRenderTarget( null );

        this.compositeUniforms[ "scale" ].value = 1.0;
        this.compositeUniforms[ "tForeground" ].value = this.holdTarget;
        this.compositeUniforms[ "tForeground" ].needsUpdate = true;
        this.compositeMaterial.needsUpdate = true;

        this.renderer.clear();
        this.renderer.render( this.compositeScene, this.compositeCamera );

        camera.view = null;

    },

    render: function( e, picking, tileing ){

        if( this._rendering ){
            NGL.warn( "tried to call 'render' from within 'render'" );
            return;
        }

        // NGL.time( "Viewer.render" );

        this._rendering = true;

        // var p = this.params;
        var camera = this.camera;

        this.__updateClipping();
        this.__updateCamera( tileing );
        this.__updateLights();

        // render

        this.updateInfo( true );

        if( picking ){

            this.__renderPickingGroup();

        }else if( this.sampleLevel > 0 && !tileing ){

            this.__renderMultiSample();

        }else{

            this.__renderModelGroup();

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

            var cDist = this.cDist;
            var bRadius = this.bRadius;
            var canvasHeight = this.height;
            var pixelRatio = this.renderer.getPixelRatio();

            projectionMatrixInverse.getInverse(
                camera.projectionMatrix
            );

            projectionMatrixTranspose.copy(
                camera.projectionMatrix
            ).transpose();

            group.traverse( function( o ){

                var m = o.material;
                if( !m ) return;

                var u = o.material.uniforms;
                if( !u ) return;

                if( m.clipNear ){
                    var nearFactor = ( 50 - m.clipNear ) / 50;
                    var nearClip = cDist - ( bRadius * nearFactor );
                    u.nearClip.value = nearClip;
                }

                if( u.canvasHeight ){
                    u.canvasHeight.value = canvasHeight;
                }

                if( u.pixelRatio ){
                    u.pixelRatio.value = pixelRatio;
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

    sortProjectedPosition: function(){

        var lastCall = 0;

        var vertex = new THREE.Vector3();
        var matrix = new THREE.Matrix4();
        var modelViewProjectionMatrix = new THREE.Matrix4();

        return function( scene, camera ){

            // NGL.time( "sort" );

            scene.traverseVisible( function ( o ){

                if( !( o instanceof THREE.Points ) || !o.sortParticles ){
                    return;
                }

                matrix.multiplyMatrices(
                    camera.matrixWorldInverse, o.matrixWorld
                );
                modelViewProjectionMatrix.multiplyMatrices(
                    camera.projectionMatrix, matrix
                );

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
        var eye = new THREE.Vector3();
        var eyeDirection = new THREE.Vector3();
        var bbSize = new THREE.Vector3();

        return function( zoom, center ){

            center = center || this.boundingBox.center();

            // remove any paning/translation
            this.controls.object.position.sub( this.controls.target );
            this.controls.target.copy( this.controls.target0 );

            // center
            t.copy( center ).multiplyScalar( -1 );
            this.rotationGroup.position.copy( t );
            this.rotationGroup.updateMatrixWorld();

            if( zoom ){

                if( zoom === true ){

                    // automatic zoom that shows
                    // everything inside the bounding box
                    // TODO take extent towards the camera into account

                    this.boundingBox.size( bbSize );
                    var maxSize = Math.max( bbSize.x, bbSize.y, bbSize.z );
                    var minSize = Math.min( bbSize.x, bbSize.y, bbSize.z );
                    // var avgSize = ( bbSize.x + bbSize.y + bbSize.z ) / 3;
                    var objSize = maxSize + ( minSize / 2 );
                    zoom = objSize;

                }

                var fov = THREE.Math.degToRad( this.perspectiveCamera.fov );
                var aspect = this.width / this.height;

                zoom = zoom / 2 / aspect / Math.tan( fov / 2 );
                zoom = Math.max( zoom, 1.2 * this.params.clipDist );

                eye.copy( this.camera.position ).sub( this.controls.target );
                eyeDirection.copy( eye ).normalize();

                eyeDirection.setLength( zoom );
                eye.copy( eyeDirection );

                this.camera.position.addVectors( this.controls.target, eye );

                this.__updateZoom();
            }

            this.requestRender();

            this.signals.orientationChanged.dispatch();

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

        // remove any paning/translation
        this.controls.object.position.sub( this.controls.target );
        this.controls.target.copy( this.controls.target0 );

        this.controls.target.fromArray( orientation[ 3 ] );

        this.rotationGroup.position.fromArray( orientation[ 2 ] );
        this.rotationGroup.updateMatrixWorld();

        this.camera.up.fromArray( orientation[ 1 ] );
        this.camera.position.fromArray( orientation[ 0 ] );

        this.requestRender();

        this.signals.orientationChanged.dispatch();

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
        var aspect = this.viewer.width / this.viewer.height;

        this.near = this.camera.near;
        this.top = Math.tan( halfFov ) * this.near;
        this.bottom = -this.top;
        this.left = aspect * this.bottom;
        this.right = aspect * this.top;
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


NGL.makeImage = function( viewer, params ){

    var p = params || {};

    var trim = p.trim!==undefined ? p.trim : false;
    var factor = p.factor!==undefined ? p.factor : 1;
    var antialias = p.antialias!==undefined ? p.antialias : false;
    var transparent = p.transparent!==undefined ? p.transparent : false;

    var renderer = viewer.renderer;
    var camera = viewer.camera;

    var originalClearAlpha = renderer.getClearAlpha();
    var backgroundColor = renderer.getClearColor();

    function setLineWidthAndPixelSize( invert ){
        var _factor = factor;
        if( antialias ) _factor *= 2;
        if( invert ) _factor = 1 / _factor;
        viewer.scene.traverse( function( o ){
            var m = o.material;
            if( m && m.linewidth ){
                m.linewidth *= _factor;
            }
            if( m && m.uniforms && m.uniforms.size ){
                if( m.uniforms.size[ "__seen" ] === undefined ){
                    m.uniforms.size.value *= _factor;
                    m.uniforms.size[ "__seen" ] = true;
                }
            }
        } );
        viewer.scene.traverse( function( o ){
            var m = o.material;
            if( m && m.uniforms && m.uniforms.size ){
                delete m.uniforms.size[ "__seen" ];
            }
        } );
    }

    function trimCanvas( canvas ){
        if( trim ){
            var bg = backgroundColor;
            var r = ( transparent ? 0 : bg.r * 255 ) | 0;
            var g = ( transparent ? 0 : bg.g * 255 ) | 0;
            var b = ( transparent ? 0 : bg.b * 255 ) | 0;
            var a = ( transparent ? 0 : 255 ) | 0;
            return NGL.trimCanvas( canvas, r, g, b, a );
        }else{
            return canvas;
        }
    }

    function onProgress( i, n, finished ){
        if( typeof p.onProgress === "function" ){
            p.onProgress( i, n, finished );
        }
    }

    return new Promise( function( resolve, reject ){

        var tiledRenderer = new NGL.TiledRenderer(
            renderer, camera, viewer,
            {
                factor: factor,
                antialias: antialias,
                onProgress: onProgress,
                onFinish: onFinish
            }
        );

        renderer.setClearAlpha( transparent ? 0 : 1 );
        setLineWidthAndPixelSize();
        tiledRenderer.renderAsync();

        function onFinish( i, n ){
            var canvas = trimCanvas( tiledRenderer.canvas );
            canvas.toBlob(
                function( blob ){
                    renderer.setClearAlpha( originalClearAlpha );
                    setLineWidthAndPixelSize( true );
                    viewer.requestRender();
                    tiledRenderer.dispose();
                    onProgress( n, n, true );
                    resolve( blob );
                },
                "image/png"
            );
        }

    } );

};
