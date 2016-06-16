/**
 * @file Viewer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import {
    PerspectiveCamera, OrthographicCamera,
    Box3, Vector3, Quaternion, Color,
    WebGLRenderer, WebGLRenderTarget,
    NearestFilter, AdditiveBlending,
    RGBAFormat, FloatType, HalfFloatType, UnsignedByteType,
    ShaderMaterial,
    PlaneGeometry,
    Scene, Mesh, Group,
    Fog, SpotLight, AmbientLight,
    BufferGeometry, BufferAttribute,
    LineBasicMaterial, LineSegments
} from "../../lib/three.es6.js";

import {
    Debug, Log, Browser, WebglErrorMessage,
    ExtensionFragDepth, setExtensionFragDepth,
    SupportsReadPixelsFloat, setSupportsReadPixelsFloat
} from "../globals.js";
import { degToRad } from "../math/math-utils.js";
import Stats from "./stats.js";
import TrackballControls from "../controls/trackball-controls.js";
import { getShader } from "../shader/shader-utils.js";
import {
    makeImage as _makeImage, sortProjectedPosition, updateMaterialUniforms
} from "./viewer-utils";

import Signal from "../../lib/signals.es6.js";


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


OrthographicCamera.prototype.setViewOffset = function( fullWidth, fullHeight, x, y, width, height ) {

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

OrthographicCamera.prototype.updateProjectionMatrix = function () {

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
        var biasW = ( this.right - this.left ) / this.view.width;
        var biasH = ( this.top - this.bottom ) / this.view.height;

        left += biasW * ( this.view.offsetX / scaleW );
        right = left + biasW * ( this.view.width / scaleW );
        top -= biasH * ( this.view.offsetY / scaleH );
        bottom = top - biasH * ( this.view.height / scaleH );

    }

    this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far );

};


/**
 * [Viewer description]
 * @class
 * @param {String} eid
 */
function Viewer( eid, params ){

    var _signals = {
        orientationChanged: new Signal(),
    };

    var container;
    if( eid ){
        container = document.getElementById( eid );
    }else{
        container = document.createElement( 'div' );
    }

    var width, height;
    if ( container === document ) {
        width = window.innerWidth;
        height = window.innerHeight;
    } else {
        var box = container.getBoundingClientRect();
        width = box.width;
        height = box.height;
    }

    var rendering, renderPending, sampleLevel, isStill, cDist, bRadius;

    var parameters;
    initParams();

    var stats;
    initStats();

    var perspectiveCamera, orthographicCamera, camera;
    initCamera();

    var scene, pointLight, ambientLight;
    var rotationGroup, modelGroup, pickingGroup, backgroundGroup, helperGroup;
    initScene();

    var renderer, indexUint16, supportsHalfFloat;
    var pickingTarget, sampleTarget, holdTarget;
    var compositeUniforms, compositeMaterial, compositeCamera, compositeScene;
    if( initRenderer() === false ){
        this.container = container;
        return;
    }

    var controls;
    initControls();

    var boundingBoxMesh;
    var boundingBox = new Box3();
    initHelper();

    // fog & background
    setBackground();
    setFog();

    var distVector = new Vector3();

    var info = {
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

    function initParams(){

        parameters = {

            fogColor: new Color( 0x000000 ),
            fogNear: 50,
            fogFar: 100,

            backgroundColor: new Color( 0x000000 ),

            cameraType: "perspective",
            cameraFov: 40,
            cameraZ: -80, // FIXME initial value should be automatically determined

            clipNear: 0,
            clipFar: 100,
            clipDist: 10,

            spinAxis: null,
            spinAngle: 0.01,

            lightColor: new Color( 0xdddddd ),
            lightIntensity: 1.0,
            ambientColor: new Color( 0xdddddd ),
            ambientIntensity: 0.2,

            holdRendering: false,
            sampleLevel: 0

        };

    }

    function initCamera(){

        var lookAt = new Vector3( 0, 0, 0 );

        perspectiveCamera = new PerspectiveCamera(
            parameters.cameraFov, width / height, 0.1, 10000
        );
        perspectiveCamera.position.z = parameters.cameraZ;
        perspectiveCamera.lookAt( lookAt );

        orthographicCamera = new OrthographicCamera(
            width / -2, width / 2,
            height / 2, height / -2,
            0.1, 10000
        );
        orthographicCamera.position.z = parameters.cameraZ;
        orthographicCamera.lookAt( lookAt );

        if( parameters.cameraType === "orthographic" ){
            camera = orthographicCamera;
        }else{  // parameters.cameraType === "perspective"
            camera = perspectiveCamera;
        }
        camera.updateProjectionMatrix();

    }

    function initRenderer(){

        try{
            renderer = new WebGLRenderer( {
                preserveDrawingBuffer: true,
                alpha: true,
                antialias: true
            } );
        }catch( e ){
            container.innerHTML = WebglErrorMessage;
            return false;
        }
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( width, height );
        renderer.autoClear = false;
        renderer.sortObjects = true;

        // var gl = renderer.getContext();
        // console.log( gl.getContextAttributes().antialias );
        // console.log( gl.getParameter(gl.SAMPLES) );

        setExtensionFragDepth( renderer.extensions.get( "EXT_frag_depth" ) );
        indexUint16 = !renderer.extensions.get( 'OES_element_index_uint' );

        setSupportsReadPixelsFloat(
            ( Browser === "Chrome" &&
                renderer.extensions.get( 'OES_texture_float' ) ) ||
            ( renderer.extensions.get( 'OES_texture_float' ) &&
                renderer.extensions.get( "WEBGL_color_buffer_float" ) )
        );

        container.appendChild( renderer.domElement );

        // picking texture

        renderer.extensions.get( 'OES_texture_float' );
        supportsHalfFloat = renderer.extensions.get( 'OES_texture_half_float' );
        renderer.extensions.get( "WEBGL_color_buffer_float" );

        pickingTarget = new WebGLRenderTarget(
            width * window.devicePixelRatio,
            height * window.devicePixelRatio,
            {
                minFilter: NearestFilter,
                magFilter: NearestFilter,
                stencilBuffer: false,
                format: RGBAFormat,
                type: SupportsReadPixelsFloat ? FloatType : UnsignedByteType
            }
        );
        pickingTarget.texture.generateMipmaps = false;

        // msaa textures

        sampleTarget = new WebGLRenderTarget(
            width * window.devicePixelRatio,
            height * window.devicePixelRatio,
            {
                minFilter: NearestFilter,
                magFilter: NearestFilter,
                format: RGBAFormat,
            }
        );

        holdTarget = new WebGLRenderTarget(
            width * window.devicePixelRatio,
            height * window.devicePixelRatio,
            {
                minFilter: NearestFilter,
                magFilter: NearestFilter,
                format: RGBAFormat,
                type: supportsHalfFloat ? HalfFloatType : FloatType
            }
        );

        compositeUniforms = {
            "tForeground": { type: "t", value: null },
            "scale": { type: "f", value: 1.0 }
        };

        compositeMaterial = new ShaderMaterial( {
            uniforms: compositeUniforms,
            vertexShader: getShader( "Quad.vert" ),
            fragmentShader: getShader( "Quad.frag" ),
            premultipliedAlpha: true,
            transparent: true,
            blending: AdditiveBlending,
            depthTest: false,
            depthWrite: false
        } );

        compositeCamera = new OrthographicCamera( -1, 1, 1, -1, 0, 1 );
        compositeScene = new Scene().add( new Mesh(
            new PlaneGeometry( 2, 2 ), compositeMaterial
        ) );

    }

    function initScene(){

        if( !scene ){
            scene = new Scene();
        }

        rotationGroup = new Group();
        rotationGroup.name = "rotationGroup";
        scene.add( rotationGroup );

        modelGroup = new Group();
        modelGroup.name = "modelGroup";
        rotationGroup.add( modelGroup );

        pickingGroup = new Group();
        pickingGroup.name = "pickingGroup";
        rotationGroup.add( pickingGroup );

        backgroundGroup = new Group();
        backgroundGroup.name = "backgroundGroup";
        rotationGroup.add( backgroundGroup );

        helperGroup = new Group();
        helperGroup.name = "helperGroup";
        rotationGroup.add( helperGroup );

        // fog

        modelGroup.fog = new Fog();

        // light

        pointLight = new SpotLight(
            parameters.lightColor, parameters.lightIntensity
        );
        modelGroup.add( pointLight );

        ambientLight = new AmbientLight(
            parameters.ambientLight, parameters.ambientIntensity
        );
        modelGroup.add( ambientLight );

    }

    function initHelper(){

        var indices = new Uint16Array( [
            0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6,
            6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7
        ] );
        var positions = new Float32Array( 8 * 3 );

        var bbGeometry = new BufferGeometry();
        bbGeometry.setIndex( new BufferAttribute( indices, 1 ) );
        bbGeometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) );
        var bbMaterial = new LineBasicMaterial( { color: "skyblue", linewidth: 2 } );

        boundingBoxMesh = new LineSegments( bbGeometry, bbMaterial );
        helperGroup.add( boundingBoxMesh );

    }

    function updateHelper(){

        var position = boundingBoxMesh.geometry.attributes.position;
        var array = position.array;

        var min = boundingBox.min;
        var max = boundingBox.max;

        array[  0 ] = max.x; array[  1 ] = max.y; array[  2 ] = max.z;
        array[  3 ] = min.x; array[  4 ] = max.y; array[  5 ] = max.z;
        array[  6 ] = min.x; array[  7 ] = min.y; array[  8 ] = max.z;
        array[  9 ] = max.x; array[ 10 ] = min.y; array[ 11 ] = max.z;
        array[ 12 ] = max.x; array[ 13 ] = max.y; array[ 14 ] = min.z;
        array[ 15 ] = min.x; array[ 16 ] = max.y; array[ 17 ] = min.z;
        array[ 18 ] = min.x; array[ 19 ] = min.y; array[ 20 ] = min.z;
        array[ 21 ] = max.x; array[ 22 ] = min.y; array[ 23 ] = min.z;

        position.needsUpdate = true;

        if( !boundingBox.isEmpty() ){
            boundingBoxMesh.geometry.computeBoundingSphere();
        }

    }

    function initControls(){

        function preventDefault( e ){
            e.preventDefault();
        }
        renderer.domElement.addEventListener(
            'mousewheel', preventDefault, false
        );
        renderer.domElement.addEventListener(  // firefox
            'MozMousePixelScroll', preventDefault, false
        );
        renderer.domElement.addEventListener(
            'touchmove', preventDefault, false
        );

        controls = new TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 2.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.staticMoving = true;
        // controls.dynamicDampingFactor = 0.3;
        controls.keys = [ 65, 83, 68 ];

        controls.addEventListener( 'change', requestRender, false );

        document.addEventListener(
            'mousemove', controls.update.bind( controls ), false
        );
        document.addEventListener(
            'touchmove', controls.update.bind( controls ), false
        );

        controls.addEventListener(
            'change',
            function(){
                _signals.orientationChanged.dispatch();
            },
            false
        );

    }

    function initStats(){

        stats = new Stats();

    }

    function add( buffer, instanceList ){

        // Log.time( "Viewer.add" );

        if( instanceList ){

            instanceList.forEach( function( instance ){
                addBuffer( buffer, instance );
            } );

        }else{

            addBuffer( buffer );

        }

        if( buffer.background ){
            backgroundGroup.add( buffer.group );
            backgroundGroup.add( buffer.wireframeGroup );
        }else{
            modelGroup.add( buffer.group );
            modelGroup.add( buffer.wireframeGroup );
        }

        if( buffer.pickable ){
            pickingGroup.add( buffer.pickingGroup );
        }

        rotationGroup.updateMatrixWorld();
        if( Debug ) updateHelper();

        // requestRender();

        // Log.timeEnd( "Viewer.add" );

    }

    function addBuffer( buffer, instance ){

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
            updateBoundingBox( buffer.geometry, instance.matrix );
        }else{
            updateBoundingBox( buffer.geometry );
        }

        // Log.timeEnd( "Viewer.addBuffer" );

    }

    function remove( buffer ){

        rotationGroup.children.forEach( function( group ){
            group.remove( buffer.group );
            group.remove( buffer.wireframeGroup );
        } );

        if( buffer.pickable ){
            pickingGroup.remove( buffer.pickingGroup );
        }

        updateBoundingBox();
        if( Debug ) updateHelper();

        // requestRender();

    }

    function updateBoundingBox( geometry, matrix ){

        function updateGeometry( geometry, matrix ){

            if( geometry.attributes.position.count === 0 ) return;

            if( !geometry.boundingBox ){
                geometry.computeBoundingBox();
            }

            var geoBoundingBox;
            if( matrix ){
                geoBoundingBox = geometry.boundingBox.clone();
                geoBoundingBox.applyMatrix4( matrix );
            }else{
                geoBoundingBox = geometry.boundingBox;
            }

            if( geoBoundingBox.min.equals( geoBoundingBox.max ) ){
                // mainly to give a single impostor geometry some volume
                // as it is only expanded in the shader on the GPU
                geoBoundingBox.expandByScalar( 5 );
            }

            boundingBox.expandByPoint( geoBoundingBox.min );
            boundingBox.expandByPoint( geoBoundingBox.max );

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
            boundingBox.makeEmpty();
            modelGroup.traverse( updateNode );
            backgroundGroup.traverse( updateNode );
        }

        controls.maxDistance = boundingBox.size().length() * 10;

    }

    function getImage(){

        return new Promise( function( resolve, reject ){
            renderer.domElement.toBlob( resolve, "image/png" );
        } );

    }

    function makeImage( params ){

        return _makeImage( this, params );

    }

    function setLight( color, intensity, ambientColor, ambientIntensity ){

        var p = parameters;

        if( color !== undefined ) p.lightColor.set( color );
        if( intensity !== undefined ) p.lightIntensity = intensity;
        if( ambientColor !== undefined ) p.ambientColor.set( ambientColor );
        if( ambientIntensity !== undefined ) p.ambientIntensity = ambientIntensity;

        requestRender();

    }

    function setFog( color, near, far ){

        var p = parameters;

        if( color !== undefined ) p.fogColor.set( color );
        if( near !== undefined ) p.fogNear = near;
        if( far !== undefined ) p.fogFar = far;

        requestRender();

    }

    function setBackground( color ){

        var p = parameters;

        if( color ) p.backgroundColor.set( color );

        setFog( p.backgroundColor );
        renderer.setClearColor( p.backgroundColor, 0 );
        renderer.domElement.style.backgroundColor = p.backgroundColor.getStyle();

        requestRender();

    }

    function setSampling( level ){

        if( level !== undefined ){
            parameters.sampleLevel = level;
            sampleLevel = level;
        }

        requestRender();

    }

    function setCamera( type, fov ){

        var p = parameters;

        if( type ) p.cameraType = type;
        if( fov ) p.cameraFov = fov;

        if( p.cameraType === "orthographic" ){
            if( camera !== orthographicCamera ){
                camera = orthographicCamera;
                camera.position.copy( perspectiveCamera.position );
                camera.up.copy( perspectiveCamera.up );
                __updateZoom();
            }
        }else{  // p.cameraType === "perspective"
            if( camera !== perspectiveCamera ){
                camera = perspectiveCamera;
                camera.position.copy( orthographicCamera.position );
                camera.up.copy( orthographicCamera.up );
            }
        }

        perspectiveCamera.fov = p.cameraFov;
        controls.object = camera;
        camera.lookAt( controls.target );
        camera.updateProjectionMatrix();

        requestRender();

    }

    function setClip( near, far, dist ){

        var p = parameters;

        if( near !== undefined ) p.clipNear = near;
        if( far !== undefined ) p.clipFar = far;
        if( dist !== undefined ) p.clipDist = dist;

        requestRender();

    }

    function setSpin( axis, angle ){

        if( axis !== undefined ) parameters.spinAxis = axis;
        if( angle !== undefined ) parameters.spinAngle = angle;

    }

    function setSize( _width, _height ){

        width = _width;
        height = _height;

        perspectiveCamera.aspect = width / height;
        orthographicCamera.left = -width / 2;
        orthographicCamera.right = width / 2;
        orthographicCamera.top = height / 2;
        orthographicCamera.bottom = -height / 2;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( width, height );

        var dprWidth = width * window.devicePixelRatio;
        var dprHeight = height * window.devicePixelRatio;

        pickingTarget.setSize( dprWidth, dprHeight );
        sampleTarget.setSize( dprWidth, dprHeight );
        holdTarget.setSize( dprWidth, dprHeight );

        controls.handleResize();

        requestRender();

    }

    function handleResize(){

        if( container === document ){
            setSize( window.innerWidth, window.innerHeight );
        }else{
            var box = container.getBoundingClientRect();
            setSize( box.width, box.height );
        }

    }

    function updateInfo( reset ){

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

            var rInfo = renderer.info;
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

    }

    var rotate = function(){

        var eye = new Vector3();
        var quaternion = new Quaternion();
        var eyeDirection = new Vector3();
        var upDirection = new Vector3();
        var sidewaysDirection = new Vector3();
        var moveDirection = new Vector3();

        return function( axis, angle ){

            eye.copy( camera.position ).sub( controls.target );
            eyeDirection.copy( eye ).normalize();
            upDirection.copy( camera.up ).normalize();
            sidewaysDirection.crossVectors( upDirection, eyeDirection ).normalize();

            eyeDirection.setLength( axis.z );
            upDirection.setLength( axis.y );
            sidewaysDirection.setLength( axis.x );
            moveDirection.copy( sidewaysDirection.sub( upDirection ).add( eyeDirection ) );

            quaternion.setFromAxisAngle( moveDirection.normalize(), angle );
            eye.applyQuaternion( quaternion );

            camera.up.applyQuaternion( quaternion );
            camera.position.addVectors( controls.target, eye );
            camera.lookAt( controls.target );

        };

    }();

    var zoom = function(){

        var eye = new Vector3();
        var eyeDirection = new Vector3();

        return function( distance ){

            eye.copy( camera.position ).sub( controls.target );
            eyeDirection.copy( eye ).normalize();

            eyeDirection.setLength( distance );
            eye.add( eyeDirection );

            camera.position.addVectors( controls.target, eye );
            camera.lookAt( controls.target );

            __updateZoom();

        };

    }();

    function animate(){

        controls.update();
        var delta = performance.now() - stats.startTime;

        if( delta > 500 && !isStill && sampleLevel < 3 && sampleLevel !== -1 ){
            var currentSampleLevel = sampleLevel;
            sampleLevel = 3;
            renderPending = true;
            render();
            isStill = true;
            sampleLevel = currentSampleLevel;
            if( Debug ) Log.log( "rendered still frame" );
        }

        // spin

        var p = parameters;
        if( p.spinAxis && p.spinAngle ){
            rotate( p.spinAxis, p.spinAngle * stats.lastDuration / 16 );
            requestRender();
        }

        requestAnimationFrame( animate );

    }

    var pick = function(){

        var pixelBufferFloat = new Float32Array( 4 );
        var pixelBufferUint = new Uint8Array( 4 );

        return function( x, y ){

            x *= window.devicePixelRatio;
            y *= window.devicePixelRatio;

            var gid, object, instance, bondId;
            var pixelBuffer = SupportsReadPixelsFloat ? pixelBufferFloat : pixelBufferUint;

            render( true );
            renderer.readRenderTargetPixels(
                pickingTarget, x, y, 1, 1, pixelBuffer
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

            object = pickingGroup.getObjectById(
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

    }();

    function requestRender(){

        if( renderPending ){
            // Log.info( "there is still a 'render' call pending" );
            return;
        }

        // start gathering stats anew after inactivity
        if( performance.now() - stats.startTime > 22 ){
            stats.begin();
            isStill = false;
        }

        renderPending = true;

        requestAnimationFrame( function(){
            render();
            stats.update();
        } );

    }

    function __updateClipping(){

        var p = parameters;

        // clipping

        cDist = distVector.copy( camera.position )
                        .sub( controls.target ).length();
        // console.log( "cDist", cDist )
        if( !cDist ){
            // recover from a broken (NaN) camera position
            camera.position.set( 0, 0, p.cameraZ );
            cDist = Math.abs( p.cameraZ );
        }

        bRadius = Math.max( 10, boundingBox.size( distVector ).length() * 0.5 );
        bRadius += boundingBox.center( distVector )
            .add( rotationGroup.position )
            .length();
        if( bRadius === Infinity || bRadius === -Infinity || isNaN( bRadius ) ){
            // console.warn( "something wrong with bRadius" );
            bRadius = 50;
        }

        var nearFactor = ( 50 - p.clipNear ) / 50;
        var farFactor = - ( 50 - p.clipFar ) / 50;
        camera.near = Math.max( 0.1, p.clipDist, cDist - ( bRadius * nearFactor ) );
        camera.far = Math.max( 1, cDist + ( bRadius * farFactor ) );

        // fog

        var fogNearFactor = ( 50 - p.fogNear ) / 50;
        var fogFarFactor = - ( 50 - p.fogFar ) / 50;
        var fog = modelGroup.fog;
        fog.color.set( p.fogColor );
        fog.near = Math.max( 0.1, cDist - ( bRadius * fogNearFactor ) );
        fog.far = Math.max( 1, cDist + ( bRadius * fogFarFactor ) );

    }

    function __updateZoom(){

        __updateClipping();
        var fov = degToRad( perspectiveCamera.fov );
        var hyperfocus = ( camera.near + camera.far ) / 2;
        var _height = 2 * Math.tan( fov / 2 ) * hyperfocus;
        orthographicCamera.zoom = height / _height;

    }

    function __updateCamera(){

        camera.updateMatrix();
        camera.updateMatrixWorld( true );
        camera.matrixWorldInverse.getInverse( camera.matrixWorld );
        camera.updateProjectionMatrix();

        updateMaterialUniforms( scene, camera, renderer, cDist, bRadius );
        sortProjectedPosition( scene, camera );

    }

    function __updateLights(){

        pointLight.position.copy( camera.position ).multiplyScalar( 100 );
        pointLight.updateMatrixWorld();
        pointLight.color.set( parameters.lightColor );
        pointLight.intensity = parameters.lightIntensity;

        ambientLight.color.set( parameters.ambientColor );
        ambientLight.intensity = parameters.ambientIntensity;

    }

    function __renderPickingGroup(){

        renderer.clearTarget( pickingTarget );
        renderer.render( pickingGroup, camera, pickingTarget );
        updateInfo();
        renderer.setRenderTarget( null );  // back to standard render target

        if( Debug ){
            renderer.clear();
            renderer.render( pickingGroup, camera );
            renderer.render( helperGroup, camera );
        }

    }

    function __renderModelGroup( renderTarget ){

        if( renderTarget ){
            renderer.clearTarget( renderTarget );
        }else{
            renderer.clear();
        }

        renderer.render( backgroundGroup, camera, renderTarget );
        if( renderTarget ){
            renderer.clearTarget( renderTarget, false, true, false );
        }else{
            renderer.clearDepth();
        }
        updateInfo();

        renderer.render( modelGroup, camera, renderTarget );
        updateInfo();

        if( Debug ){
            renderer.render( helperGroup, camera, renderTarget );
        }

    }

    function __renderMultiSample(){

        // based on the Manual Multi-Sample Anti-Aliasing Render Pass
        // contributed to three.js by bhouston / http://clara.io/
        //
        // This manual approach to MSAA re-renders the scene ones for
        // each sample with camera jitter and accumulates the results.
        // References: https://en.wikipedia.org/wiki/Multisample_anti-aliasing

        var offsetList = JitterVectors[ Math.max( 0, Math.min( sampleLevel, 5 ) ) ];

        var baseSampleWeight = 1.0 / offsetList.length;
        var roundingRange = 1 / 32;

        compositeUniforms.tForeground.value = sampleTarget.texture;
        compositeUniforms.tForeground.needsUpdate = true;
        compositeMaterial.needsUpdate = true;

        var _width = sampleTarget.width;
        var _height = sampleTarget.height;

        // render the scene multiple times, each slightly jitter offset
        // from the last and accumulate the results.
        for ( var i = 0; i < offsetList.length; ++i ){

            var offset = offsetList[ i ];
            camera.setViewOffset(
                _width, _height, offset[ 0 ], offset[ 1 ], _width, _height
            );
            __updateCamera();

            var sampleWeight = baseSampleWeight;
            // the theory is that equal weights for each sample lead to an accumulation of rounding errors.
            // The following equation varies the sampleWeight per sample so that it is uniformly distributed
            // across a range of values whose rounding errors cancel each other out.
            var uniformCenteredDistribution = ( -0.5 + ( i + 0.5 ) / offsetList.length );
            sampleWeight += roundingRange * uniformCenteredDistribution;
            compositeUniforms.scale.value = sampleWeight;

            __renderModelGroup( sampleTarget );
            renderer.render(
                compositeScene, compositeCamera, holdTarget, ( i === 0 )
            );

        }

        renderer.setRenderTarget( null );

        compositeUniforms.scale.value = 1.0;
        compositeUniforms.tForeground.value = holdTarget.texture;
        compositeUniforms.tForeground.needsUpdate = true;
        compositeMaterial.needsUpdate = true;

        renderer.clear();
        renderer.render( compositeScene, compositeCamera );

        camera.view = null;

    }

    function render( picking ){

        if( rendering ){
            Log.warn( "tried to call 'render' from within 'render'" );
            return;
        }

        // Log.time( "Viewer.render" );

        rendering = true;

        __updateClipping();
        __updateCamera();
        __updateLights();

        // render

        updateInfo( true );

        if( picking ){
            __renderPickingGroup();
        }else if( sampleLevel > 0 ){
            __renderMultiSample();
        }else{
            __renderModelGroup();
        }

        rendering = false;
        renderPending = false;

        // Log.timeEnd( "Viewer.render" );
        // Log.log( info.memory, info.render );

    }

    function clear(){

        Log.log( "scene cleared" );
        scene.remove( rotationGroup );
        initScene();
        renderer.clear();

    }

    var centerView = function(){

        var t = new Vector3();
        var eye = new Vector3();
        var eyeDirection = new Vector3();
        var bbSize = new Vector3();

        return function( zoom, center ){

            center = center || boundingBox.center();

            // remove any paning/translation
            controls.object.position.sub( controls.target );
            controls.target.copy( controls.target0 );

            // center
            t.copy( center ).multiplyScalar( -1 );
            rotationGroup.position.copy( t );
            rotationGroup.updateMatrixWorld();

            if( zoom ){

                if( zoom === true ){

                    // automatic zoom that shows
                    // everything inside the bounding box
                    // TODO take extent towards the camera into account

                    boundingBox.size( bbSize );
                    var maxSize = Math.max( bbSize.x, bbSize.y, bbSize.z );
                    var minSize = Math.min( bbSize.x, bbSize.y, bbSize.z );
                    // var avgSize = ( bbSize.x + bbSize.y + bbSize.z ) / 3;
                    var objSize = maxSize + ( minSize / 2 );
                    zoom = objSize;

                }

                var fov = degToRad( perspectiveCamera.fov );
                var aspect = width / height;

                zoom = zoom / 2 / aspect / Math.tan( fov / 2 );
                zoom = Math.max( zoom, 1.2 * parameters.clipDist );

                eye.copy( camera.position ).sub( controls.target );
                eyeDirection.copy( eye ).normalize();

                eyeDirection.setLength( zoom );
                eye.copy( eyeDirection );

                camera.position.addVectors( controls.target, eye );

                __updateZoom();
            }

            requestRender();

            _signals.orientationChanged.dispatch();

        };

    }();

    function getOrientation(){

        return [
            camera.position.toArray(),
            camera.up.toArray(),
            rotationGroup.position.toArray(),
            controls.target.toArray()
        ];

    }

    function setOrientation( orientation ){

        // remove any paning/translation
        controls.object.position.sub( controls.target );
        controls.target.copy( controls.target0 );

        controls.target.fromArray( orientation[ 3 ] );

        rotationGroup.position.fromArray( orientation[ 2 ] );
        rotationGroup.updateMatrixWorld();

        camera.up.fromArray( orientation[ 1 ] );
        camera.position.fromArray( orientation[ 0 ] );

        requestRender();

        _signals.orientationChanged.dispatch();

    }

    // API

    this.container = container;
    this.stats = stats;
    this.signals = _signals;
    this.rotationGroup = rotationGroup;

    this.add = add;
    this.remove = remove;
    this.clear = clear;

    this.getImage = getImage;
    this.makeImage = makeImage;

    this.setLight = setLight;
    this.setFog = setFog;
    this.setBackground = setBackground;
    this.setSampling = setSampling;
    this.setCamera = setCamera;
    this.setClip = setClip;
    this.setSpin = setSpin;
    this.setSize = setSize;
    this.handleResize = handleResize;

    this.rotate = rotate;
    this.zoom = zoom;
    this.centerView = centerView;
    this.getOrientation = getOrientation;
    this.setOrientation = setOrientation;

    this.pick = pick;
    this.requestRender = requestRender;
    this.render = render;
    this.animate = animate;
    this.updateHelper = updateHelper;

    this.controls = controls;
    this.renderer = renderer;
    this.scene = scene;

    Object.defineProperties( this, {
        camera: { get: function(){ return camera; } },
        width: { get: function(){ return width; } },
        height: { get: function(){ return height; } },
        sampleLevel: { get: function(){ return sampleLevel; } }
    } );

}

Viewer.prototype.constructor = Viewer;


export default Viewer;
