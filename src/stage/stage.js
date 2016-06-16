/**
 * @file Stage
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { Debug, Log } from "../globals.js";
import { getFileInfo, deepCopy } from "../utils.js";
import Counter from "../utils/counter.js";
import Viewer from "../viewer/viewer.js";
import PickingControls from "./picking-controls.js";

import Component from "../component/component.js";
import RepresentationComponent from "../component/representation-component.js";
import Collection from "../component/collection.js";
import ComponentCollection from "../component/component-collection.js";
import RepresentationCollection from "../component/representation-collection.js";
import { makeComponent } from "../component/component-utils.js";
import { autoLoad } from "../loader/loader-utils";


/**
 * Stage parameter object.
 * @typedef {Object} StageParameters - stage parameters
 * @property {Color} backgroundColor - background color
 * @property {Integer} sampleLevel - sampling level for antialiasing, between -1 and 5;
 *                                   -1: no sampling, 0: only sampling when not moving
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
 * @property {Integer} hoverTimeout - timeout until the hover signal is fired
 */


/**
 * Stage objects are central for creating molecular scenes with NGL.
 * @class
 * @example
 *     var stage = new Stage( "elementId", { backgroundColor: "white" } );
 *
 * @param {String} eid - document id
 * @param {StageParameters} params -
 */
function Stage( eid, params ){

    this.signals = {
        parametersChanged: new Signal(),
        fullscreenChanged: new Signal(),

        componentAdded: new Signal(),
        componentRemoved: new Signal(),

        onClick: new Signal(),
        onHover: new Signal()
    };

    //

    this.tasks = new Counter();
    this.compList = [];
    this.defaultFileParams = {};

    //

    this.viewer = new Viewer( eid );
    if( !this.viewer.renderer ) return;

    this.pickingControls = new PickingControls( this.viewer );
    this.pickingControls.signals.onClick.add( this.signals.onClick.dispatch );
    this.pickingControls.signals.onHover.add( this.signals.onHover.dispatch );

    var p = Object.assign( {
        impostor: true,
        quality: "medium",
        sampleLevel: 0,
        backgroundColor: "black",
        rotateSpeed: 2.0,
        zoomSpeed: 1.2,
        panSpeed: 0.8,
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
        hoverTimeout: 50,
    }, params );
    this.parameters = deepCopy( Stage.prototype.parameters );
    this.setParameters( p );  // must come after the viewer has been instantiated

    this.viewer.animate();

}

Stage.prototype = {

    constructor: Stage,

    parameters: {

        backgroundColor: {
            type: "color"
        },
        quality: {
            type: "select", options: { "low": "low", "medium": "medium", "high": "high" }
        },
        sampleLevel: {
            type: "range", step: 1, max: 5, min: -1
        },
        impostor: {
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
            type: "integer", max: 10000, min: 10
        },

    },

    /**
     * Set stage parameters
     * @param {StageParameters} params - stage parameters
     */
    setParameters: function( params ){

        var p = Object.assign( {}, params );
        var tp = this.parameters;
        var viewer = this.viewer;
        var controls = viewer.controls;
        var pickingControls = this.pickingControls;

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
        pickingControls.setParameters( { hoverTimeout: p.hoverTimeout } );
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

    },

    /**
     * Get stage parameters
     * @return {StageParameters} parameter object
     */
    getParameters: function(){

        var params = {};
        for( var name in this.parameters ){
            params[ name ] = this.parameters[ name ].value;
        }
        return params;

    },

    /**
     * Create default representations for the given component
     * @param  {StructureComponent|SurfaceComponent} object - component to create the representations for
     * @return {undefined}
     */
    defaultFileRepresentation: function( object ){

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

            if( typeof window.orientation !== 'undefined' ){
                atomCount *= 4;
            }

            var backboneOnly = structure.atomStore.count / structure.residueStore.count < 2;
            if( backboneOnly ){
                atomCount *= 10;
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
                    probeRadius: 0.1,
                    scaleFactor: scaleFactor,
                    colorScheme: "atomindex",
                    colorScale: "RdYlBu",
                    useWorker: false
                } );

            }else if( atomCount > 250000 ){

                object.addRepresentation( "backbone", {
                    lineOnly: true,
                    colorScheme: "atomindex",
                    colorScale: "RdYlBu"
                } );

            }else if( atomCount > 100000 ){

                object.addRepresentation( "backbone", {
                    quality: "low",
                    disableImpostor: true,
                    colorScheme: "atomindex",
                    colorScale: "RdYlBu",
                    scale: 2.0
                } );

            }else if( atomCount > 80000 ){

                object.addRepresentation( "backbone", {
                    colorScheme: "atomindex",
                    colorScale: "RdYlBu",
                    scale: 2.0
                } );

            }else{

                var quality = atomCount < 15000 ? "high" : "medium";

                object.addRepresentation( "cartoon", {
                    color: "atomindex",
                    colorScale: "RdYlBu",
                    scale: 0.7,
                    aspectRatio: 5,
                    quality: quality
                } );
                if( atomCount < 50000 ){
                    object.addRepresentation( "base", {
                        color: "atomindex",
                        colorScale: "RdYlBu",
                        quality: quality
                    } );
                }
                object.addRepresentation( "ball+stick", {
                    sele: "hetero and not ( water or ion )",
                    colorScheme: "element",
                    scale: 2.0,
                    aspectRatio: 1.5,
                    quality: quality
                } );

            }

            this.centerView();

            // add frames as trajectory
            if( object.structure.frames.length ) object.addTrajectory();

        }else if( object.type === "surface" || opject.type === "volume" ){

            object.addRepresentation( "surface" );
            this.centerView();

        }

    },

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
     * @param  {String|File|Blob} path - either a URL or an object containing the file data
     * @param  {Object} params - loading parameters
     * @param  {String} params.ext - file extension, determines file type
     * @param  {Boolean} params.asTrajectory - load multi-model structures as a trajectory
     * @return {Promise} Promise resolves to a {@link Component} object
     */
    loadFile: function( path, params ){

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

        return autoLoad( path, p ).then( onLoadFn, onErrorFn );

    },

    addComponent: function( component ){

        if( !component ){

            Log.warn( "Stage.addComponent: no component given" );
            return;

        }

        this.compList.push( component );

        this.signals.componentAdded.dispatch( component );

    },

    addComponentFromObject: function( object, params ){

        var component = makeComponent( this, object, params );

        this.addComponent( component );

        return component;

    },

    removeComponent: function( component ){

        var idx = this.compList.indexOf( component );

        if( idx !== -1 ){

            this.compList.splice( idx, 1 );

        }

        component.dispose();

        this.signals.componentRemoved.dispatch( component );

    },

    removeAllComponents: function( type ){

        this.compList.slice().forEach( function( o, i ){

            if( !type || o.type === type ){

                this.removeComponent( o );

            }

        }, this );

    },

    /**
     * Handle any size-changes of the container element
     * @return {undefined}
     */
    handleResize: function(){

        this.viewer.handleResize();

    },

    toggleFullscreen: function( element ){

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
                document.removeEventListener( "msfullscreenchange", resizeElement );

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
            document.addEventListener( "msfullscreenchange", resizeElement );

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

    },

    centerView: function(){

        if( this.tasks.count > 0 ){

            var centerFn = function( delta, count ){

                if( count === 0 ){

                    this.tasks.signals.countChanged.remove( centerFn, this );

                }

                this.viewer.centerView( true );

            };

            this.tasks.signals.countChanged.add( centerFn, this );

        }

        this.viewer.centerView( true );

    },

    setSpin: function( axis, angle ){

        if( Array.isArray( axis ) ){
            axis = new Vector3().fromArray( axis );
        }

        this.viewer.setSpin( axis, angle );

    },

    setOrientation: function( orientation ){

        this.tasks.onZeroOnce( function(){

            this.viewer.setOrientation( orientation );

        }, this );

    },

    getOrientation: function(){

        return this.viewer.getOrientation();

    },

    makeImage: function( params ){

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

    },

    setImpostor: function( value ) {

        this.parameters.impostor.value = value;

        var types = [
            "spacefill", "ball+stick", "licorice", "hyperball",
            "backbone", "rocket", "helixorient", "contact", "distance",
            "dot"
        ];

        this.eachRepresentation( function( repr ){

            if( repr.type === "script" ) return;

            if( types.indexOf( repr.getType() ) === -1 ){
                return;
            }

            var p = repr.getParameters();
            p.disableImpostor = !value;
            repr.build( p );

        } );

    },

    setQuality: function( value ) {

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

            if( types.indexOf( repr.getType() ) === -1 ){

                if( impostorTypes.indexOf( repr.getType() ) === -1 ){
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

    },

    eachComponent: function( callback, type ){

        this.compList.forEach( function( o, i ){

            if( !type || o.type === type ){
                callback( o, i );
            }

        } );

    },

    eachRepresentation: function( callback, componentType ){

        this.eachComponent( function( comp ){

            comp.reprList.forEach( function( repr ){
                callback( repr, comp );
            } );

        }, componentType );

    },

    getComponentsByName: function( name, componentType ){

        var compList = [];

        this.eachComponent( function( comp ){

            if( name === undefined || comp.name.match( name ) !== null ){
                compList.push( comp );
            }

        }, componentType );

        return new ComponentCollection( compList );

    },

    getRepresentationsByName: function( name, componentType ){

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

            if( compName !== undefined && comp.name.match( compName ) === null ){
                return;
            }

            if( reprName === undefined || repr.name.match( reprName ) !== null ){
                reprList.push( repr );
            }

        }, componentType );

        return new RepresentationCollection( reprList );

    },

    getAnythingByName: function( name ){

        var compList = this.getComponentsByName( name ).list;
        var reprList = this.getRepresentationsByName( name ).list;

        return new Collection( compList.concat( reprList ) );

    },

    dispose: function(){

        this.tasks.dispose();

    }

};


export default Stage;
