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
    LineSegments
} from "../../lib/three.es6.js";

import "../shader/BasicLine.vert";
import "../shader/BasicLine.frag";
import "../shader/Quad.vert";
import "../shader/Quad.frag";

import {
    Debug, Log, Browser, Mobile, WebglErrorMessage,
    setExtensionFragDepth, SupportsReadPixelsFloat, setSupportsReadPixelsFloat
} from "../globals.js";
import { degToRad } from "../math/math-utils.js";
import Stats from "./stats.js";
import TrackballControls from "../controls/trackball-controls.js";
import { getShader } from "../shader/shader-utils.js";
import {
    makeImage as _makeImage, sortProjectedPosition, updateMaterialUniforms
} from "./viewer-utils";

import Signal from "../../lib/signals.es6.js";


if( typeof WebGLRenderingContext !== "undefined" && WebGLRenderingContext ){

    // wrap WebGL debug function used by three.js and
    // ignore calls to them when the debug flag is not set

    WebGLRenderingContext.prototype.getShaderParameter = function(){

        var _getShaderParameter = WebGLRenderingContext.prototype.getShaderParameter;

        return function getShaderParameter(){

            if( Debug ){

                return _getShaderParameter.apply( this, arguments );

            }else{

                return true;

            }

        };

    }();

    WebGLRenderingContext.prototype.getShaderInfoLog = function(){

        var _getShaderInfoLog = WebGLRenderingContext.prototype.getShaderInfoLog;

        return function getShaderInfoLog(){

            if( Debug ){

                return _getShaderInfoLog.apply( this, arguments );

            }else{

                return '';

            }

        };

    }();

    WebGLRenderingContext.prototype.getProgramParameter = function(){

        var _getProgramParameter = WebGLRenderingContext.prototype.getProgramParameter;

        return function getProgramParameter( program, pname ){

            if( Debug || pname !== WebGLRenderingContext.prototype.LINK_STATUS ){

                return _getProgramParameter.apply( this, arguments );

            }else{

                return true;

            }

        };

    }();

    WebGLRenderingContext.prototype.getProgramInfoLog = function(){

        var _getProgramInfoLog = WebGLRenderingContext.prototype.getProgramInfoLog;

        return function getProgramInfoLog(){

            if( Debug ){

                return _getProgramInfoLog.apply( this, arguments );

            }else{

                return '';

            }

        };

    }();

}


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


/**
 * [Viewer description]
 * @class
 * @param {String} eid - dom element id
 */
function Viewer( eid ){

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
        width = window.innerWidth || 1;
        height = window.innerHeight || 1;
    } else {
        var box = container.getBoundingClientRect();
        width = box.width || 1;
        height = box.height || 1;
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

    var renderer, supportsHalfFloat;
    var pickingTarget, sampleTarget, holdTarget;
    var compositeUniforms, compositeMaterial, compositeCamera, compositeScene;
    if( initRenderer() === false ){
        this.container = container;
        Log.error( "Viewer: could not initialize renderer" );
        return;
    }

    var controls;
    initControls();

    var boundingBoxMesh;
    var boundingBox = new Box3();
    var boundingBoxSize = new Vector3();
    var boundingBoxLength = 0;
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

        var dpr = window.devicePixelRatio;

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
        renderer.setPixelRatio( dpr );
        renderer.setSize( width, height );
        renderer.autoClear = false;
        renderer.sortObjects = true;

        // var gl = renderer.getContext();
        // console.log( gl.getContextAttributes().antialias );
        // console.log( gl.getParameter(gl.SAMPLES) );

        setExtensionFragDepth( renderer.extensions.get( "EXT_frag_depth" ) );
        renderer.extensions.get( 'OES_element_index_uint' );

        setSupportsReadPixelsFloat(
            ( renderer.extensions.get( 'OES_texture_float' ) &&
                renderer.extensions.get( "WEBGL_color_buffer_float" ) ) ||
            ( Browser === "Chrome" &&
                renderer.extensions.get( 'OES_texture_float' ) )
        );

        container.appendChild( renderer.domElement );

        var dprWidth = width * dpr;
        var dprHeight = height * dpr;

        // picking texture

        renderer.extensions.get( 'OES_texture_float' );
        supportsHalfFloat = renderer.extensions.get( 'OES_texture_half_float' );
        renderer.extensions.get( "WEBGL_color_buffer_float" );

        pickingTarget = new WebGLRenderTarget(
            dprWidth, dprHeight,
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
            dprWidth, dprHeight,
            {
                minFilter: NearestFilter,
                magFilter: NearestFilter,
                format: RGBAFormat,
            }
        );

        holdTarget = new WebGLRenderTarget(
            dprWidth, dprHeight,
            {
                minFilter: NearestFilter,
                magFilter: NearestFilter,
                format: RGBAFormat,
                // problems on mobile so use UnsignedByteType there
                // see https://github.com/arose/ngl/issues/191
                type: Mobile ? UnsignedByteType : (
                    supportsHalfFloat ? HalfFloatType :
                        ( SupportsReadPixelsFloat ? FloatType : UnsignedByteType )
                )

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

        scene.fog = new Fog();

        // light

        pointLight = new SpotLight(
            parameters.lightColor, parameters.lightIntensity
        );
        scene.add( pointLight );

        ambientLight = new AmbientLight(
            parameters.ambientLight, parameters.ambientIntensity
        );
        scene.add( ambientLight );

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
        var bbMaterial = new ShaderMaterial( {
            uniforms: { "uColor": { value: new Color( "skyblue" ) } },
            vertexShader: getShader( "BasicLine.vert" ),
            fragmentShader: getShader( "BasicLine.frag" ),
            linewidth: 2
        } );

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

        controls = new TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 2.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.staticMoving = true;
        // controls.dynamicDampingFactor = 0.3;
        controls.keys = [ 65, 83, 68 ];

        controls.addEventListener( 'change', requestRender, false );

        function preventDefault( e ){
            e.preventDefault();
        }
        renderer.domElement.addEventListener(
            'mousewheel', preventDefault, false
        );
        renderer.domElement.addEventListener(
            'wheel', preventDefault, false
        );
        renderer.domElement.addEventListener(  // firefox
            'MozMousePixelScroll', preventDefault, false
        );
        renderer.domElement.addEventListener(
            'touchmove', preventDefault, false
        );

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

        if( Debug ) updateHelper();

        // Log.timeEnd( "Viewer.add" );

    }

    function addBuffer( buffer, instance ){

        // Log.time( "Viewer.addBuffer" );

        function setInstance( object ){
            if( object.type === "Group" ){
                object.children.forEach( function( child ){
                    child.userData.instance = instance;
                } );
            }else{
                object.userData.instance = instance;
            }
        }

        var mesh = buffer.getMesh();
        mesh.userData.buffer = buffer;
        if( instance ){
            mesh.applyMatrix( instance.matrix );
            setInstance( mesh );
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
            setInstance( wireframeMesh );
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
                setInstance( pickingMesh );
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
            if( Array.isArray( geometry ) ){
                geometry.forEach( function( g ){
                    updateGeometry( g, matrix );
                } );
            }else{
                updateGeometry( geometry, matrix );
            }
        }else{
            boundingBox.makeEmpty();
            modelGroup.traverse( updateNode );
            backgroundGroup.traverse( updateNode );
        }

        boundingBox.size( boundingBoxSize );
        boundingBoxLength = boundingBoxSize.length();
        controls.maxDistance = boundingBoxLength * 10;

    }

    function getImage(){

        return new Promise( function( resolve ){
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

        width = _width || 1;
        height = _height || 1;

        perspectiveCamera.aspect = width / height;
        orthographicCamera.left = -width / 2;
        orthographicCamera.right = width / 2;
        orthographicCamera.top = height / 2;
        orthographicCamera.bottom = -height / 2;
        camera.updateProjectionMatrix();

        var dpr = window.devicePixelRatio;

        renderer.setPixelRatio( dpr );
        renderer.setSize( width, height );

        var dprWidth = width * dpr;
        var dprHeight = height * dpr;

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

        return function rotate( axis, angle ){

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

        return function zoom( distance, set ){

            eye.copy( camera.position ).sub( controls.target );
            eyeDirection.copy( eye ).normalize();

            eyeDirection.setLength( distance );
            if( set ){
                eye.copy( eyeDirection );
            }else{
                eye.add( eyeDirection );
            }

            camera.position.addVectors( controls.target, eye );
            camera.lookAt( controls.target );

            __updateZoom();

        };

    }();

    function translate( vector ){

        controls.target.add( vector );
        camera.position.add( vector );

    }

    var center = function(){

        var vector = new Vector3();

        return function center( position ){

            vector.copy( position ).sub( controls.target );
            translate( vector );

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

        return function pick( x, y ){

            x *= window.devicePixelRatio;
            y *= window.devicePixelRatio;

            var gid, object, instance;
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

            // if( Debug ){
            //     var rgba = Array.apply( [], pixelBuffer );
            //     Log.log( pixelBuffer );
            //     Log.log(
            //         "picked color",
            //         [
            //             ( rgba[0] ).toPrecision(2),
            //             ( rgba[1] ).toPrecision(2),
            //             ( rgba[2] ).toPrecision(2),
            //             ( rgba[3] ).toPrecision(2)
            //         ]
            //     );
            //     Log.log( "picked gid", gid );
            //     Log.log( "picked instance", instance );
            //     Log.log( "picked position", x, y );
            //     Log.log( "devicePixelRatio", window.devicePixelRatio );
            // }

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

        requestAnimationFrame( function requestRenderAnimation(){
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

        bRadius = Math.max( 10, boundingBoxLength * 0.5 );
        bRadius += boundingBox.center( distVector ).length();
        // console.log( "bRadius", bRadius )
        if( bRadius === Infinity || bRadius === -Infinity || isNaN( bRadius ) ){
            // console.warn( "something wrong with bRadius" );
            bRadius = 50;
        }

        var nearFactor = ( 50 - p.clipNear ) / 50;
        var farFactor = - ( 50 - p.clipFar ) / 50;
        camera.near = cDist - ( bRadius * nearFactor );
        camera.far = cDist + ( bRadius * farFactor );

        // fog

        var fogNearFactor = ( 50 - p.fogNear ) / 50;
        var fogFarFactor = - ( 50 - p.fogFar ) / 50;
        var fog = scene.fog;
        fog.color.set( p.fogColor );
        fog.near = cDist - ( bRadius * fogNearFactor );
        fog.far = cDist + ( bRadius * fogFarFactor );

        if( camera.type === "PerspectiveCamera" ){
            camera.near = Math.max( 0.1, p.clipDist, camera.near );
            camera.far = Math.max( 1, camera.far );
            fog.near = Math.max( 0.1, fog.near );
            fog.far = Math.max( 1, fog.far );
        }else if( camera.type === "OrthographicCamera" ){
            if( p.clipNear === 0 && p.clipDist > 0 && cDist + camera.zoom > 2 * -p.clipDist ){
                camera.near += camera.zoom + p.clipDist;
            }
        }

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

    function __setVisibility( model, picking, background, helper ){

        modelGroup.visible = model;
        pickingGroup.visible = picking;
        backgroundGroup.visible = background;
        helperGroup.visible = helper;

    }

    function __updateLights(){

        distVector.copy( camera.position ).sub( controls.target )
            .setLength( boundingBoxLength * 100 );

        pointLight.position.copy( camera.position ).add( distVector );
        pointLight.color.set( parameters.lightColor );
        pointLight.intensity = parameters.lightIntensity;

        ambientLight.color.set( parameters.ambientColor );
        ambientLight.intensity = parameters.ambientIntensity;

    }

    function __renderPickingGroup(){

        renderer.clearTarget( pickingTarget );
        __setVisibility( false, true, false, false );
        renderer.render( scene, camera, pickingTarget );
        updateInfo();
        renderer.setRenderTarget( null );  // back to standard render target

        // if( Debug ){
        //     __setVisibility( false, true, false, true );

        //     renderer.clear();
        //     renderer.render( scene, camera );
        // }

    }

    function __renderModelGroup( renderTarget ){

        if( renderTarget ){
            renderer.clearTarget( renderTarget );
        }else{
            renderer.clear();
        }

        __setVisibility( false, false, true, false );
        renderer.render( scene, camera, renderTarget );
        if( renderTarget ){
            renderer.clearTarget( renderTarget, false, true, false );
        }else{
            renderer.clearDepth();
        }
        updateInfo();

        __setVisibility( true, false, false, Debug );
        renderer.render( scene, camera, renderTarget );
        updateInfo();

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
            // the theory is that equal weights for each sample lead to an
            // accumulation of rounding errors.
            // The following equation varies the sampleWeight per sample
            // so that it is uniformly distributed across a range of values
            // whose rounding errors cancel each other out.
            var uniformCenteredDistribution = ( -0.5 + ( i + 0.5 ) / offsetList.length );
            sampleWeight += roundingRange * uniformCenteredDistribution;
            compositeUniforms.scale.value = sampleWeight;

            __renderModelGroup( sampleTarget );
            renderer.render(
                compositeScene, compositeCamera, holdTarget, ( i === 0 )
            );

        }

        compositeUniforms.scale.value = 1.0;
        compositeUniforms.tForeground.value = holdTarget.texture;

        renderer.render( compositeScene, compositeCamera, null, true );

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

    function centerView( _zoom, position ){

        if( position === undefined ){
            if( !boundingBox.isEmpty() ){
                center( boundingBox.center() );
            }
        }else{
            center( position );
        }

        if( _zoom ){

            var distance;

            if( _zoom === true ){

                // distance = boundingBoxLength;

                var bbSize = boundingBoxSize;
                var maxSize = Math.max( bbSize.x, bbSize.y, bbSize.z );
                var minSize = Math.min( bbSize.x, bbSize.y, bbSize.z );
                // var avgSize = ( bbSize.x + bbSize.y + bbSize.z ) / 3;
                distance = maxSize + Math.sqrt( minSize );

            }else{

                distance = _zoom;

            }

            var fov = degToRad( perspectiveCamera.fov );
            var aspect = width / height;
            var aspectFactor = ( height < width ? 1 : aspect );

            distance = Math.abs(
                ( ( distance * 0.5 ) / aspectFactor ) / Math.sin( fov / 2 )
            );

            distance += parameters.clipDist;

            zoom( distance, true );

        }

        requestRender();

        _signals.orientationChanged.dispatch();

    }

    var alignView = function(){

        var currentEye = new Vector3();
        var currentUp = new Vector3();
        var vn = new Vector3();
        var vc = new Vector3();
        var vz = new Vector3( 0, 0, 1 );

        return function alignView( eye, up, position, zoom ){

            controls.reset();
            centerView( zoom, position );

            currentEye.copy( camera.position ).sub( controls.target ).normalize();
            vn.crossVectors( currentEye, eye );
            rotate( vn, -currentEye.angleTo( eye ) );

            currentUp.copy( camera.up ).normalize();
            vc.crossVectors( currentUp, up ).normalize();

            var angle = currentUp.angleTo( up );
            if( vz.dot( vc ) < 0 ) angle *= -1;

            currentEye.copy( camera.position ).sub( controls.target ).normalize();
            if( currentEye.dot( vz ) < 0 ) angle *= -1;

            rotate( vz, angle );

        };

    }();

    function getOrientation(){

        return [
            controls.target.toArray(),
            camera.position.toArray(),
            camera.up.toArray()
        ];

    }

    function setOrientation( orientation ){

        controls.target.fromArray( orientation[ 0 ] );
        camera.position.fromArray( orientation[ 1 ] );
        camera.up.fromArray( orientation[ 2 ] );

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
    this.center = center;
    this.centerView = centerView;
    this.alignView = alignView;
    this.getOrientation = getOrientation;
    this.setOrientation = setOrientation;
    this.boundingBox = boundingBox;

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
