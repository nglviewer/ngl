/**
 * @file Stage
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { Debug, Log, Mobile, ComponentRegistry } from "../globals.js";
import { defaults, getFileInfo } from "../utils.js";
import { degToRad } from "../math/math-utils.js";
import Counter from "../utils/counter.js";
import GidPool from "../utils/gid-pool.js";
import Viewer from "../viewer/viewer.js";
import MouseObserver from "./mouse-observer.js";

import TrackballControls from "../controls/trackball-controls.js";
import PickingControls from "../controls/picking-controls.js";
import ViewerControls from "../controls/viewer-controls.js";
import AnimationControls from "../controls/animation-controls.js";

import PickingBehavior from "./picking-behavior.js";
import MouseBehavior from "./mouse-behavior.js";
import AnimationBehavior from "./animation-behavior.js";

import Component from "../component/component.js";
// eslint-disable-next-line no-unused-vars
import RepresentationComponent from "../component/representation-component.js";
import Collection from "../component/collection.js";
import ComponentCollection from "../component/component-collection.js";
import RepresentationCollection from "../component/representation-collection.js";
import { autoLoad } from "../loader/loader-utils";


function matchName( name, comp ){
    if( name instanceof RegExp ){
        return comp.name.match( name ) !== null;
    }else{
        return comp.name === name;
    }
}

const tmpZoomVector = new Vector3();


/**
 * Stage parameter object.
 * @typedef {Object} StageParameters - stage parameters
 * @property {Color} backgroundColor - background color
 * @property {Integer} sampleLevel - sampling level for antialiasing, between -1 and 5;
 *                                   -1: no sampling, 0: only sampling when not moving
 * @property {Boolean} workerDefault - default value for useWorker parameter of representations
 * @property {Float} rotateSpeed - camera-controls rotation speed, between 0 and 10
 * @property {Float} zoomSpeed - camera-controls zoom speed, between 0 and 10
 * @property {Float} panSpeed - camera-controls pan speed, between 0 and 10
 * @property {Integer} clipNear - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {Integer} clipFar - position of camera far/back clipping plane
 *                               in percent of scene bounding box
 * @property {Float} clipDist - camera clipping distance in Angstrom
 * @property {Integer} fogNear - position of the start of the fog effect
 *                               in percent of scene bounding box
 * @property {Integer} fogFar - position where the fog is in full effect
 *                              in percent of scene bounding box
 * @property {String} cameraType - type of camera, either 'persepective' or 'orthographic'
 * @property {Float} cameraFov - camera field of view in degree, between 15 and 120
 * @property {Color} lightColor - point light color
 * @property {Float} lightIntensity - point light intensity
 * @property {Color} ambientColor - ambient light color
 * @property {Float} ambientIntensity - ambient light intensity
 * @property {Integer} hoverTimeout - timeout until the {@link Stage#event:hovered|hovered}
 *                                      signal is fired, set to -1 to ignore hovering
 */

/**
 * Picking data object.
 * @typedef {Object} PickingData - picking data
 * @property {Vector2} canvasPosition - mouse x and y position in pixels relative to the canvas
 * @property {Boolean} [altKey] - whether the alt key was pressed
 * @property {Boolean} [ctrlKey] - whether the control key was pressed
 * @property {Boolean} [metaKey] - whether the meta key was pressed
 * @property {Boolean} [shiftKey] - whether the shift key was pressed
 * @property {AtomProxy} [atom] - picked atom
 * @property {BondProxy} [bond] - picked bond
 * @property {Volume} [volume] - picked volume
 * @property {Object} [instance] - instance data
 * @property {Integer} instance.id - instance id
 * @property {String|Integer} instance.name - instance name
 * @property {Matrix4} instance.matrix - transformation matrix of the instance
 * @property {Vector3} [position] - xyz position of the picked object
 * @property {Component} [component] - component holding the picked object
 */


/**
 * {@link Signal}, dispatched when stage parameters change
 * @example
 * stage.signals.parametersChanged.add( function( stageParameters ){ ... } );
 * @event Stage#parametersChanged
 * @type {StageParameters}
 */

/**
 * {@link Signal}, dispatched when the fullscreen is entered or left
 * @example
 * stage.signals.fullscreenChanged.add( function( isFullscreen ){ ... } );
 * @event Stage#fullscreenChanged
 * @type {Boolean}
 */

/**
 * {@link Signal}, dispatched when a component is added to the stage
 * @example
 * stage.signals.componentAdded.add( function( component ){ ... } );
 * @event Stage#componentAdded
 * @type {Component}
 */

/**
 * {@link Signal}, dispatched when a component is removed from the stage
 * @example
 * stage.signals.componentRemoved.add( function( component ){ ... } );
 * @event Stage#componentRemoved
 * @type {Component}
 */

/**
 * {@link Signal}, dispatched upon clicking in the viewer canvas
 * @example
 * stage.signals.clicked.add( function( pickingData ){ ... } );
 * @event Stage#clicked
 * @type {PickingData}
 */

/**
 * {@link Signal}, dispatched upon hovering over the viewer canvas
 * @example
 * stage.signals.hovered.add( function( pickingData ){ ... } );
 * @event Stage#hovered
 * @type {PickingData}
 */


/**
 * Stage class, central for creating molecular scenes with NGL.
 * @example
 *     var stage = new Stage( "elementId", { backgroundColor: "white" } );
 */
class Stage{

    /**
     * Create a Stage instance
     * @param {String} eid - document id
     * @param {StageParameters} params - parameters object
     */
    constructor( eid, params ){

        this.signals = {
            parametersChanged: new Signal(),
            fullscreenChanged: new Signal(),

            componentAdded: new Signal(),
            componentRemoved: new Signal(),

            clicked: new Signal(),
            hovered: new Signal()
        };

        //

        /**
         * Counter that keeps track of various potentially long-running tasks,
         * including file loading and surface calculation.
         * @member {Counter}
         */
        this.tasks = new Counter();
        this.gidPool = new GidPool();
        this.compList = [];
        this.defaultFileParams = {};

        //

        this.viewer = new Viewer( eid );
        if( !this.viewer.renderer ) return;

        /**
         * @member {MouseObserver}
         */
        this.mouseObserver = new MouseObserver( this.viewer.renderer.domElement );

        /**
         * @member {ViewerControls}
         */
        this.viewerControls = new ViewerControls( this );
        this.trackballControls = new TrackballControls( this );
        this.pickingControls = new PickingControls( this );
        /**
         * @member {AnimationControls}
         */
        this.animationControls = new AnimationControls( this );

        this.pickingBehavior = new PickingBehavior( this );
        this.mouseBehavior = new MouseBehavior( this );
        this.animationBehavior = new AnimationBehavior( this );

        this.spinAnimation = this.animationControls.spin( null );

        var p = Object.assign( {
            impostor: true,
            quality: "medium",
            workerDefault: true,
            sampleLevel: 0,
            backgroundColor: "black",
            rotateSpeed: 2.0,
            zoomSpeed: 1.2,
            panSpeed: 1.0,
            clipNear: 0,
            clipFar: 100,
            clipDist: 10,
            fogNear: 50,
            fogFar: 100,
            cameraFov: 40,
            cameraType: "perspective",
            lightColor: 0xdddddd,
            lightIntensity: 1.0,
            ambientColor: 0xdddddd,
            ambientIntensity: 0.2,
            hoverTimeout: 500,
        }, params );

        this.parameters = {
            backgroundColor: {
                type: "color"
            },
            quality: {
                type: "select", options: { "auto": "auto", "low": "low", "medium": "medium", "high": "high" }
            },
            sampleLevel: {
                type: "range", step: 1, max: 5, min: -1
            },
            impostor: {
                type: "boolean"
            },
            workerDefault: {
                type: "boolean"
            },
            rotateSpeed: {
                type: "number", precision: 1, max: 10, min: 0
            },
            zoomSpeed: {
                type: "number", precision: 1, max: 10, min: 0
            },
            panSpeed: {
                type: "number", precision: 1, max: 10, min: 0
            },
            clipNear: {
                type: "range", step: 1, max: 100, min: 0
            },
            clipFar: {
                type: "range", step: 1, max: 100, min: 0
            },
            clipDist: {
                type: "integer", max: 200, min: 0
            },
            fogNear: {
                type: "range", step: 1, max: 100, min: 0
            },
            fogFar: {
                type: "range", step: 1, max: 100, min: 0
            },
            cameraType: {
                type: "select", options: { "perspective": "perspective", "orthographic": "orthographic" }
            },
            cameraFov: {
                type: "range", step: 1, max: 120, min: 15
            },
            lightColor: {
                type: "color"
            },
            lightIntensity: {
                type: "number", precision: 2, max: 10, min: 0
            },
            ambientColor: {
                type: "color"
            },
            ambientIntensity: {
                type: "number", precision: 2, max: 10, min: 0
            },
            hoverTimeout: {
                type: "integer", max: 10000, min: -1
            },
        };

        this.setParameters( p );  // must come after the viewer has been instantiated

        this.viewer.animate();

    }

    /**
     * Set stage parameters
     * @fires Stage#parametersChanged
     * @param {StageParameters} params - stage parameters
     * @return {Stage} this object
     */
    setParameters( params ){

        var p = Object.assign( {}, params );
        var tp = this.parameters;
        var viewer = this.viewer;
        var controls = this.trackballControls;

        for( var name in p ){

            if( p[ name ] === undefined ) continue;
            if( !tp[ name ] ) continue;

            if( tp[ name ].int ) p[ name ] = parseInt( p[ name ] );
            if( tp[ name ].float ) p[ name ] = parseFloat( p[ name ] );

            tp[ name ].value = p[ name ];

        }

        // apply parameters
        if( p.quality !== undefined ) this.setQuality( p.quality );
        if( p.impostor !== undefined ) this.setImpostor( p.impostor );
        if( p.rotateSpeed !== undefined ) controls.rotateSpeed = p.rotateSpeed;
        if( p.zoomSpeed !== undefined ) controls.zoomSpeed = p.zoomSpeed;
        if( p.panSpeed !== undefined ) controls.panSpeed = p.panSpeed;
        this.mouseObserver.setParameters( { hoverTimeout: p.hoverTimeout } );
        viewer.setClip( p.clipNear, p.clipFar, p.clipDist );
        viewer.setFog( undefined, p.fogNear, p.fogFar );
        viewer.setCamera( p.cameraType, p.cameraFov );
        viewer.setSampling( p.sampleLevel );
        viewer.setBackground( p.backgroundColor );
        viewer.setLight(
            p.lightColor, p.lightIntensity, p.ambientColor, p.ambientIntensity
        );

        this.signals.parametersChanged.dispatch(
            this.getParameters()
        );

        return this;

    }

    /**
     * Get stage parameters
     * @return {StageParameters} parameter object
     */
    getParameters(){

        var params = {};
        for( var name in this.parameters ){
            params[ name ] = this.parameters[ name ].value;
        }
        return params;

    }

    /**
     * Create default representations for the given component
     * @param  {StructureComponent|SurfaceComponent} object - component to create the representations for
     * @return {undefined}
     */
    defaultFileRepresentation( object ){

        if( object.type === "structure" ){

            object.setSelection( "/0" );

            var atomCount, instanceCount;
            var structure = object.structure;

            if( structure.biomolDict.BU1 ){
                var assembly = structure.biomolDict.BU1;
                atomCount = assembly.getAtomCount( structure );
                instanceCount = assembly.getInstanceCount();
                object.setDefaultAssembly( "BU1" );
            }else{
                atomCount = structure.getModelProxy( 0 ).atomCount;
                instanceCount = 1;
            }

            if( Mobile ){
                atomCount *= 4;
            }

            var backboneOnly = structure.atomStore.count / structure.residueStore.count < 2;
            if( backboneOnly ){
                atomCount *= 10;
            }

            var colorScheme = "chainname";
            if( structure.getChainnameCount( "polymer and /0" ) === 1 ){
                colorScheme = "residueindex";
            }

            if( Debug ) console.log( atomCount, instanceCount, backboneOnly );

            if( ( instanceCount > 5 && atomCount > 15000 ) || atomCount > 700000 ){

                var scaleFactor = (
                    Math.min(
                        1.5,
                        Math.max(
                            0.1,
                            2000 / ( atomCount / instanceCount )
                        )
                    )
                );
                if( backboneOnly ) scaleFactor = Math.min( scaleFactor, 0.15 );

                object.addRepresentation( "surface", {
                    sele: "polymer",
                    surfaceType: "sas",
                    probeRadius: 1.4,
                    scaleFactor: scaleFactor,
                    colorScheme: colorScheme,
                    colorScale: "RdYlBu",
                    useWorker: false
                } );

            }else if( atomCount > 250000 ){

                object.addRepresentation( "backbone", {
                    lineOnly: true,
                    colorScheme: colorScheme,
                    colorScale: "RdYlBu"
                } );

            }else if( atomCount > 100000 ){

                object.addRepresentation( "backbone", {
                    quality: "low",
                    disableImpostor: true,
                    colorScheme: colorScheme,
                    colorScale: "RdYlBu",
                    scale: 2.0
                } );

            }else if( atomCount > 80000 ){

                object.addRepresentation( "backbone", {
                    colorScheme: colorScheme,
                    colorScale: "RdYlBu",
                    scale: 2.0
                } );

            }else{

                object.addRepresentation( "cartoon", {
                    color: colorScheme,
                    colorScale: "RdYlBu",
                    scale: 0.7,
                    aspectRatio: 5,
                    quality: "auto"
                } );
                if( atomCount < 50000 ){
                    object.addRepresentation( "base", {
                        color: colorScheme,
                        colorScale: "RdYlBu",
                        quality: "auto"
                    } );
                }
                object.addRepresentation( "ball+stick", {
                    sele: "hetero and not ( water or ion )",
                    colorScheme: "element",
                    scale: 2.0,
                    aspectRatio: 1.5,
                    bondScale: 0.3,
                    bondSpacing: 0.75,
                    quality: "auto"
                } );

            }

            this.autoView();

            // add frames as trajectory
            if( object.structure.frames.length ) object.addTrajectory();

        }else if( object.type === "surface" || object.type === "volume" ){

            object.addRepresentation( "surface" );
            this.autoView();

        }

    }

    /**
     * Load a file onto the stage
     *
     * @example
     * // load from URL
     * stage.loadFile( "http://files.rcsb.org/download/5IOS.cif" );
     *
     * @example
     * // load binary data in CCP4 format via a Blob
     * var binaryBlob = new Blob( [ ccp4Data ], { type: 'application/octet-binary'} );
     * stage.loadFile( binaryBlob, { ext: "ccp4" } );
     *
     * @example
     * // load string data in PDB format via a Blob
     * var stringBlob = new Blob( [ pdbData ], { type: 'text/plain'} );
     * stage.loadFile( stringBlob, { ext: "pdb" } );
     *
     * @example
     * // load a File object
     * stage.loadFile( file );
     *
     * @example
     * // load from URL and add a 'ball+stick' representation with double/triple bonds
     * stage.loadFile( "http://files.rcsb.org/download/1crn.cif" ).then( function( comp ){
     *     comp.addRepresentation( "ball+stick", { multipleBond: true } );
     * } );
     *
     * @fires Stage#componentAdded
     * @param  {String|File|Blob} path - either a URL or an object containing the file data
     * @param  {LoaderParameters} params - loading parameters
     * @param  {Boolean} params.asTrajectory - load multi-model structures as a trajectory
     * @return {Promise} A Promise object that resolves to a {@link StructureComponent},
     *                   a {@link SurfaceComponent} or a {@link ScriptComponent} object,
     *                   depending on the type of the loaded file.
     */
    loadFile( path, params ){

        var p = Object.assign( {}, this.defaultFileParams, params );

        // placeholder component
        var component = new Component( this, p );
        component.name = getFileInfo( path ).name;
        this.addComponent( component );

        // tasks
        var tasks = this.tasks;
        tasks.increment();

        var onLoadFn = function( object ){

            // remove placeholder component
            this.removeComponent( component );

            component = this.addComponentFromObject( object, p );

            if( component.type === "script" ){
                component.run();
            }

            if( p.defaultRepresentation ){
                this.defaultFileRepresentation( component );
            }

            tasks.decrement();

            return component;

        }.bind( this );

        var onErrorFn = function( e ){

            component.setStatus( e );
            tasks.decrement();
            throw e;

        };

        var ext = defaults( p.ext, getFileInfo( path ).ext );
        var promise;

        if( ext === "dcd" ){
            promise = Promise.reject( "loadFile: ext 'dcd' must be loaded into a structure component" );
        }else{
            promise = autoLoad( path, p );
        }

        return promise.then( onLoadFn, onErrorFn );

    }

    /**
     * Add the given component to the stage
     * @param {Component} component - the component to add
     * @return {undefined}
     */
    addComponent( component ){

        if( !component ){

            Log.warn( "Stage.addComponent: no component given" );
            return;

        }

        this.compList.push( component );

        this.signals.componentAdded.dispatch( component );

    }

    /**
     * Create a component from the given object and add to the stage
     * @param {Script|Shape|Structure|Surface|Volume} object - the object to add
     * @param {ComponentParameters} params - parameter object
     * @return {Component} the created component
     */
    addComponentFromObject( object, params ){

        var CompClass = ComponentRegistry.get( object.type );

        if( CompClass ){
            var component = new CompClass( this, object, params );
            this.addComponent( component );
            return component
        }

        Log.warn( "no component for object type", object.type );

    }

    /**
     * Remove the given component
     * @param  {Component} component - the component to remove
     * @return {undefined}
     */
    removeComponent( component ){

        var idx = this.compList.indexOf( component );
        if( idx !== -1 ){
            this.compList.splice( idx, 1 );
            component.dispose();
            this.signals.componentRemoved.dispatch( component );
        }

    }

    /**
     * Remove all components from the stage
     * @param  {String} [type] - component type to remove
     * @return {undefined}
     */
    removeAllComponents( type ){

        this.compList.slice().forEach( function( o ){
            if( !type || o.type === type ){
                this.removeComponent( o );
            }
        }, this );

    }

    /**
     * Handle any size-changes of the container element
     * @return {undefined}
     */
    handleResize(){

        this.viewer.handleResize();

    }

    /**
     * Toggle fullscreen
     * @fires Stage#fullscreenChanged
     * @param  {Element} [element] - document element to put into fullscreen,
     *                               defaults to the viewer container
     * @return {undefined}
     */
    toggleFullscreen( element ){

        if( !document.fullscreenEnabled && !document.mozFullScreenEnabled &&
            !document.webkitFullscreenEnabled && !document.msFullscreenEnabled
        ){
            Log.log( "fullscreen mode (currently) not possible" );
            return;
        }

        var self = this;
        element = element || this.viewer.container;
        this.lastFullscreenElement = element;

        //

        function getFullscreenElement(){
            return document.fullscreenElement || document.mozFullScreenElement ||
                document.webkitFullscreenElement || document.msFullscreenElement;
        }

        function resizeElement(){

            if( !getFullscreenElement() && self.lastFullscreenElement ){

                var element = self.lastFullscreenElement;
                element.style.width = element.dataset.normalWidth;
                element.style.height = element.dataset.normalHeight;

                document.removeEventListener( "fullscreenchange", resizeElement );
                document.removeEventListener( "mozfullscreenchange", resizeElement );
                document.removeEventListener( "webkitfullscreenchange", resizeElement );
                document.removeEventListener( "MSFullscreenChange", resizeElement );

                self.handleResize();
                self.signals.fullscreenChanged.dispatch( false );

            }

        }

        //

        if( !getFullscreenElement() ){

            element.dataset.normalWidth = element.style.width;
            element.dataset.normalHeight = element.style.height;
            element.style.width = screen.width + "px";
            element.style.height = screen.height + "px";

            if( element.requestFullscreen ){
                element.requestFullscreen();
            }else if( element.msRequestFullscreen ){
                element.msRequestFullscreen();
            }else if( element.mozRequestFullScreen ){
                element.mozRequestFullScreen();
            }else if( element.webkitRequestFullscreen ){
                element.webkitRequestFullscreen();
            }

            document.addEventListener( "fullscreenchange", resizeElement );
            document.addEventListener( "mozfullscreenchange", resizeElement );
            document.addEventListener( "webkitfullscreenchange", resizeElement );
            document.addEventListener( "MSFullscreenChange", resizeElement );

            this.handleResize();
            this.signals.fullscreenChanged.dispatch( true );

            // workaround for Safari
            setTimeout( function(){ self.handleResize(); }, 100 );

        }else{

            if( document.exitFullscreen ){
                document.exitFullscreen();
            }else if( document.msExitFullscreen ){
                document.msExitFullscreen();
            }else if( document.mozCancelFullScreen ){
                document.mozCancelFullScreen();
            }else if( document.webkitExitFullscreen ){
                document.webkitExitFullscreen();
            }

        }

    }

    /**
     * Spin the whole scene around an axis at the center
     * @example
     * stage.setSpin( [ 0, 1, 0 ], 0.01 );
     *
     * @param {Number[]|Vector3} axis - the axis to spin around
     * @param {Number} angle - amount to spin per render call
     * @return {undefined}
     */
    setSpin( axis, angle ){

        if( Array.isArray( axis ) ){
            axis = new Vector3().fromArray( axis );
        }

        this.spinAnimation.axis = axis;
        this.spinAnimation.angle = angle;

    }

    getZoomForBox( boundingBox ){

        const bbSize = boundingBox.size( tmpZoomVector );
        const maxSize = Math.max( bbSize.x, bbSize.y, bbSize.z );
        const minSize = Math.min( bbSize.x, bbSize.y, bbSize.z );
        let distance = maxSize + Math.sqrt( minSize );

        const fov = degToRad( this.viewer.perspectiveCamera.fov );
        const width = this.viewer.width;
        const height = this.viewer.height;
        const aspect = width / height;
        const aspectFactor = ( height < width ? 1 : aspect );

        distance = Math.abs(
            ( ( distance * 0.5 ) / aspectFactor ) / Math.sin( fov / 2 )
        );
        distance += this.parameters.clipDist.value;
        return -distance;

    }

    getBox(){

        return this.viewer.boundingBox;

    }

    getZoom(){

        return this.getZoomForBox( this.getBox() );

    }

    getCenter(){

        return this.getBox().center();

    }

    /**
     * Add a zoom and a move animation with automatic targets
     * @param  {Integer} duration - animation time in milliseconds
     * @return {undefined}
     */
    autoView( duration ){

        this.animationControls.zoomMove(
            this.getCenter(),
            this.getZoom(),
            defaults( duration, 0 )
        );

    }

    /**
     * Make image from what is shown in a viewer canvas
     * @param  {ImageParameters} params - image generation parameters
     * @return {Promise} A Promise object that resolves to an image {@link Blob}.
     */
    makeImage( params ){

        var viewer = this.viewer;
        var tasks = this.tasks;

        return new Promise( function( resolve, reject ){

            function makeImage(){
                tasks.increment();
                viewer.makeImage( params ).then( function( blob ){
                    tasks.decrement();
                    resolve( blob );
                } ).catch( function( e ){
                    tasks.decrement();
                    reject( e );
                } );
            }

            tasks.onZeroOnce( makeImage );

        } );

    }

    setImpostor( value ) {

        this.parameters.impostor.value = value;

        var types = [
            "spacefill", "ball+stick", "licorice", "hyperball",
            "backbone", "rocket", "helixorient", "contact", "distance",
            "dot"
        ];

        this.eachRepresentation( function( repr ){

            if( repr.type === "script" ) return;

            if( !types.includes( repr.getType() ) ){
                return;
            }

            var p = repr.getParameters();
            p.disableImpostor = !value;
            repr.build( p );

        } );

    }

    setQuality( value ) {

        this.parameters.quality.value = value;

        var types = [
            "tube", "cartoon", "ribbon", "trace", "rope"
        ];

        var impostorTypes = [
            "spacefill", "ball+stick", "licorice", "hyperball",
            "backbone", "rocket", "helixorient", "contact", "distance",
            "dot"
        ];

        this.eachRepresentation( function( repr ){

            if( repr.type === "script" ) return;

            var p = repr.getParameters();

            if( !types.includes( repr.getType() ) ){

                if( !impostorTypes.includes( repr.getType() ) ){
                    return;
                }

                if( !p.disableImpostor ){
                    repr.repr.quality = value;
                    return;
                }

            }

            p.quality = value;
            repr.build( p );

        } );

    }

    /**
     * Iterator over each component and executing the callback
     * @param  {Function} callback - function to execute
     * @param  {String}   type - limit iteration to components of this type
     * @return {undefined}
     */
    eachComponent( callback, type ){

        this.compList.forEach( function( o, i ){

            if( !type || o.type === type ){
                callback( o, i );
            }

        } );

    }

    /**
     * Iterator over each representation and executing the callback
     * @param  {Function} callback - function to execute
     * @param  {String}   type - limit iteration to components of this type
     * @return {undefined}
     */
    eachRepresentation( callback, type ){

        this.eachComponent( function( comp ){

            comp.reprList.forEach( function( repr ){
                callback( repr, comp );
            } );

        }, type );

    }

    /**
     * Get collection of components by name
     * @param  {String|RegExp}   name - the component name
     * @param  {String} type - limit iteration to components of this type
     * @return {ComponentCollection} collection of selected components
     */
    getComponentsByName( name, type ){

        var compList = [];

        this.eachComponent( function( comp ){

            if( name === undefined || matchName( name, comp ) ){
                compList.push( comp );
            }

        }, type );

        return new ComponentCollection( compList );

    }

    /**
     * Get collection of components by object
     * @param  {Object} object - the object to find
     * @return {ComponentCollection} collection of selected components
     */
    getComponentsByObject( object ){

        var compList = [];

        this.eachComponent( function( comp ){

            if( comp[ comp.type ] === object ){
                compList.push( comp );
            }

        } );

        return new ComponentCollection( compList );

    }

    /**
     * Get collection of representations by name
     * @param  {String|RegExp}   name - the representation name
     * @param  {String} type - limit iteration to components of this type
     * @return {RepresentationCollection} collection of selected components
     */
    getRepresentationsByName( name, type ){

        var compName, reprName;

        if( typeof name !== "object" ){
            compName = undefined;
            reprName = name;
        }else{
            compName = name.comp;
            reprName = name.repr;
        }

        var reprList = [];

        this.eachRepresentation( function( repr, comp ){

            if( compName !== undefined && !matchName( compName, comp ) ){
                return;
            }

            if( reprName === undefined || matchName( reprName, repr ) ){
                reprList.push( repr );
            }

        }, type );

        return new RepresentationCollection( reprList );

    }

    /**
     * Get collection of components and representations by name
     * @param  {String|RegExp}   name - the component or representation name
     * @return {Collection} collection of selected components and representations
     */
    getAnythingByName( name ){

        var compList = this.getComponentsByName( name ).list;
        var reprList = this.getRepresentationsByName( name ).list;

        return new Collection( compList.concat( reprList ) );

    }

    /**
     * Cleanup when disposing of a stage object
     * @return {undefined}
     */
    dispose(){

        this.tasks.dispose();

    }

}


export default Stage;
