/**
 * @file Viewer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import {
    Debug, Log, Browser, WebglErrorMessage,
    ExtensionFragDepth, setExtensionFragDepth,
    SupportsReadPixelsFloat, setSupportsReadPixelsFloat
} from "../globals.js";
import { getShader } from "../shader/shader-utils.js";
import { makeImage } from "./viewer-utils";
import { quicksortIP } from "../math/array-utils.js";


var JitterVectors = [
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

JitterVectors.forEach( function( offsetList ){
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

        var scaleW = this.zoom / ( this.view.width / this.view.fullWidth );
        var scaleH = this.zoom / ( this.view.height / this.view.fullHeight );

        left += this.view.offsetX / scaleW;
        right = left + this.view.width / scaleW;
        top -= this.view.offsetY / scaleH;
        bottom = top - this.view.height / scaleH;

    }

    this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far );

};


function Stats(){

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

Stats.prototype = {

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


/**
 * [Viewer description]
 * @class
 * @param {String} eid
 */
function Viewer( eid, params ){

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

}

Viewer.prototype = {

    constructor: Viewer,

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
            this.container.innerHTML = WebglErrorMessage;
            return false;
        }
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.width, this.height );
        this.renderer.autoClear = false;
        this.renderer.sortObjects = true;

        // var gl = this.renderer.getContext();
        // console.log( gl.getContextAttributes().antialias );
        // console.log( gl.getParameter(gl.SAMPLES) );

        setExtensionFragDepth( this.renderer.extensions.get( "EXT_frag_depth" ) );
        this.indexUint16 = !this.renderer.extensions.get( 'OES_element_index_uint' );

        setSupportsReadPixelsFloat(
            ( Browser === "Chrome" &&
                this.renderer.extensions.get( 'OES_texture_float' ) ) ||
            ( this.renderer.extensions.get( 'OES_texture_float' ) &&
                this.renderer.extensions.get( "WEBGL_color_buffer_float" ) )
        );

        this.container.appendChild( this.renderer.domElement );

        // picking texture

        this.renderer.extensions.get( 'OES_texture_float' );
        this.supportsHalfFloat = this.renderer.extensions.get( 'OES_texture_half_float' );
        this.renderer.extensions.get( "WEBGL_color_buffer_float" );

        this.pickingTarget = new THREE.WebGLRenderTarget(
            this.width * window.devicePixelRatio,
            this.height * window.devicePixelRatio,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                stencilBuffer: false,
                format: THREE.RGBAFormat,
                type: SupportsReadPixelsFloat ? THREE.FloatType : THREE.UnsignedByteType
            }
        );
        this.pickingTarget.texture.generateMipmaps = false;

        // msaa textures

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
                type: this.supportsHalfFloat ? THREE.HalfFloatType : THREE.FloatType
            }
        );

        this.compositeUniforms = {
            "tForeground": { type: "t", value: null },
            "scale": { type: "f", value: 1.0 }
        };

        this.compositeMaterial = new THREE.ShaderMaterial( {
            uniforms: this.compositeUniforms,
            vertexShader: getShader( "Quad.vert" ),
            fragmentShader: getShader( "Quad.frag" ),
            premultipliedAlpha: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
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

        this.stats = new Stats();

    },

    add: function( buffer, instanceList ){

        // Log.time( "Viewer.add" );

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
        if( Debug ) this.updateHelper();

        // this.requestRender();

        // Log.timeEnd( "Viewer.add" );

    },

    addBuffer: function( buffer, instance ){

        // Log.time( "Viewer.addBuffer" );

        var mesh = buffer.getMesh();
        mesh.userData.buffer = buffer;
        if( instance ){
            mesh.applyMatrix( instance.matrix );
            mesh.userData.instance = instance;
        }
        buffer.group.add( mesh );

        var wireframeMesh = buffer.getWireframeMesh();
        wireframeMesh.userData.buffer = buffer;
        if( instance ){
            // wireframeMesh.applyMatrix( instance.matrix );
            wireframeMesh.matrix.copy( mesh.matrix );
            wireframeMesh.position.copy( mesh.position );
            wireframeMesh.quaternion.copy( mesh.quaternion );
            wireframeMesh.scale.copy( mesh.scale );
            wireframeMesh.userData.instance = instance;
        }
        buffer.wireframeGroup.add( wireframeMesh );

        if( buffer.pickable ){

            var pickingMesh = buffer.getPickingMesh();
            pickingMesh.userData.buffer = buffer;
            if( instance ){
                // pickingMesh.applyMatrix( instance.matrix );
                pickingMesh.matrix.copy( mesh.matrix );
                pickingMesh.position.copy( mesh.position );
                pickingMesh.quaternion.copy( mesh.quaternion );
                pickingMesh.scale.copy( mesh.scale );
                pickingMesh.userData.instance = instance;
            }
            buffer.pickingGroup.add( pickingMesh );

        }

        if( instance ){
            this.updateBoundingBox( buffer.geometry, instance.matrix );
        }else{
            this.updateBoundingBox( buffer.geometry );
        }

        // Log.timeEnd( "Viewer.addBuffer" );

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
        if( Debug ) this.updateHelper();

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

                var matrix;
                if( node.userData.instance ){
                    matrix = node.userData.instance.matrix;
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

        return makeImage( this, params );

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

        };

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

        };

    }(),

    animate: function(){

        this.controls.update();

        var delta = performance.now() - this.stats.startTime;

        if( delta > 500 && !this.still && this.sampleLevel < 3 && this.sampleLevel !== -1 ){

            var currentSampleLevel = this.sampleLevel;
            this.sampleLevel = 3;
            this._renderPending = true;
            this.render();
            this.still = true;
            this.sampleLevel = currentSampleLevel;
            if( Debug ) Log.log( "rendered still frame" );

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
            var pixelBuffer = SupportsReadPixelsFloat ? pixelBufferFloat : pixelBufferUint;

            this.render( true );
            this.renderer.readRenderTargetPixels(
                this.pickingTarget, x, y, 1, 1, pixelBuffer
            );

            if( SupportsReadPixelsFloat ){
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

            if( Debug ){
                var rgba = Array.apply( [], pixelBuffer );
                Log.log( pixelBuffer );
                Log.log(
                    "picked color",
                    [
                        ( rgba[0] ).toPrecision(2),
                        ( rgba[1] ).toPrecision(2),
                        ( rgba[2] ).toPrecision(2),
                        ( rgba[3] ).toPrecision(2)
                    ]
                );
                Log.log( "picked gid", gid );
                Log.log( "picked instance", instance );
                Log.log( "picked position", x, y );
                Log.log( "devicePixelRatio", window.devicePixelRatio );
            }

            return {
                "gid": gid,
                "instance": instance
            };

        };

    }(),

    requestRender: function(){

        if( this._renderPending || this.holdRendering ){
            // Log.info( "there is still a 'render' call pending" );
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

    __updateCamera: function(){

        var camera = this.camera;

        camera.updateMatrix();
        camera.updateMatrixWorld( true );
        camera.matrixWorldInverse.getInverse( camera.matrixWorld );
        camera.updateProjectionMatrix();

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

        if( Debug ){
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

        if( Debug ){
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
        var offsetList = JitterVectors[ Math.max( 0, Math.min( this.sampleLevel, 5 ) ) ];

        this.compositeUniforms.scale.value = 1.0 / offsetList.length;
        this.compositeUniforms.tForeground.value = this.sampleTarget;
        this.compositeUniforms.tForeground.needsUpdate = true;
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

        this.compositeUniforms.scale.value = 1.0;
        this.compositeUniforms.tForeground.value = this.holdTarget;
        this.compositeUniforms.tForeground.needsUpdate = true;
        this.compositeMaterial.needsUpdate = true;

        this.renderer.clear();
        this.renderer.render( this.compositeScene, this.compositeCamera );

        camera.view = null;

    },

    render: function( picking ){

        if( this._rendering ){
            Log.warn( "tried to call 'render' from within 'render'" );
            return;
        }

        // Log.time( "Viewer.render" );

        this._rendering = true;

        this.__updateClipping();
        this.__updateCamera();
        this.__updateLights();

        // render

        this.updateInfo( true );

        if( picking ){

            this.__renderPickingGroup();

        }else if( this.sampleLevel > 0 ){

            this.__renderMultiSample();

        }else{

            this.__renderModelGroup();

        }

        this._rendering = false;
        this._renderPending = false;

        // Log.timeEnd( "Viewer.render" );
        // Log.log( this.info.memory, this.info.render );

    },

    updateMaterialUniforms: function(){

        var projectionMatrixInverse = new THREE.Matrix4();
        var projectionMatrixTranspose = new THREE.Matrix4();

        return function( group, camera ){

            var cDist = this.cDist;
            var bRadius = this.bRadius;
            var canvasHeight = this.height;
            var pixelRatio = this.renderer.getPixelRatio();
            var ortho = camera.type === "OrthographicCamera" ? 1.0 : 0.0;

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

                if( u.ortho ){
                    u.ortho.value = ortho;
                }

            } );

        };

    }(),

    sortProjectedPosition: function(){

        var i;
        var lastCall = 0;

        var vertex = new THREE.Vector3();
        var matrix = new THREE.Matrix4();
        var modelViewProjectionMatrix = new THREE.Matrix4();

        return function( scene, camera ){

            // Log.time( "sort" );

            scene.traverseVisible( function ( o ){

                if( !( o instanceof THREE.Points ) || !o.sortParticles ){
                    return;
                }

                var attributes = o.geometry.attributes;
                var n = attributes.position.count;

                if( n === 0 ) return;

                matrix.multiplyMatrices(
                    camera.matrixWorldInverse, o.matrixWorld
                );
                modelViewProjectionMatrix.multiplyMatrices(
                    camera.projectionMatrix, matrix
                );

                if( !o.userData.sortData ){
                    o.userData.sortData = {};
                }

                var sortData = o.userData.sortData;

                if( !sortData.__sortArray ){
                    sortData.__sortArray = new Float32Array( n * 2 );
                }

                var sortArray = sortData.__sortArray;

                for( i = 0; i < n; ++i ){

                    var i2 = 2 * i;

                    vertex.fromArray( attributes.position.array, i * 3 );
                    vertex.applyProjection( modelViewProjectionMatrix );

                    // negate, so that sorting order is reversed
                    sortArray[ i2 ] = -vertex.z;
                    sortArray[ i2 + 1 ] = i;

                }

                quicksortIP( sortArray, 2, 0 );

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

                    for( i = 0; i < n; ++i ){

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

            // Log.timeEnd( "sort" );

        };

    }(),

    clear: function(){

        Log.log( "scene cleared" );

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

        };

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


export default Viewer;
