
/**
 * @file Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from "../utils.js";
import { generateUUID } from "../math/math-utils.js";
import { makeRepresentation } from "../representation/representation-utils.js";
// import RepresentationComponent from "./representation-component.js";

import Signal from "../../lib/signals.es6.js";


var nextComponentId = 0;


/**
 * Component parameter object.
 * @typedef {Object} ComponentParameters - component parameters
 * @property {String} name - component name
 * @property {Boolean} visible - component visibility
 */

/**
 * {@link Signal}, dispatched when a representation is added
 * @example
 * component.signals.representationAdded.add( function( representationComponent ){ ... } );
 * @event Component#representationAdded
 * @type {RepresentationComponent}
 */

/**
 * {@link Signal}, dispatched when a representation is removed
 * @example
 * component.signals.representationRemoved.add( function( representationComponent ){ ... } );
 * @event Component#representationRemoved
 * @type {RepresentationComponent}
 */

/**
 * {@link Signal}, dispatched when the visibility changes
 * @example
 * component.signals.visibilityChanged.add( function( value ){ ... } );
 * @event Component#visibilityChanged
 * @type {Boolean}
 */


/**
 * Component base class
 * @class
 * @param {Stage} stage - stage object the component belongs to
 * @param {ComponentParameters} params - parameter object
 */
function Component( stage, params ){

    Object.defineProperty( this, 'id', { value: nextComponentId++ } );

    var p = params || {};

    this.name = p.name;
    this.uuid = generateUUID();
    this.visible = p.visible !== undefined ? p.visible : true;

    // construct instance signals
    var signalNames = Object.keys( this.signals );
    this.signals = {};
    signalNames.forEach( function( name ){
        this.signals[ name ] = new Signal();
    }, this );

    this.stage = stage;
    this.viewer = stage.viewer;

    this.reprList = [];

}

Component.prototype = {

    constructor: Component,

    type: "component",

    signals: {

        representationAdded: null,
        representationRemoved: null,
        visibilityChanged: null,

        statusChanged: null,
        nameChanged: null,
        disposed: null,

    },

    /**
     * Add a new representation to the component
     * @fires Component#representationAdded
     * @param {String} type - the name of the representation
     * @param {Object} object - the object on which the representation should be based
     * @param {RepresentationParameters} [params] - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation: function( type, object, params ){

        var p = params || {};
        var sp = this.stage.getParameters();
        p.quality = p.quality || sp.quality;
        p.disableImpostor = defaults( p.disableImpostor, !sp.impostor );
        p.useWorker = defaults( p.useWorker, sp.workerDefault );
        p.visible = defaults( p.visible, true );
        p.gidPool = this.stage.gidPool;

        var p2 = Object.assign( {}, p, { visible: this.visible && p.visible } );
        var repr = makeRepresentation( type, object, this.viewer, p2 );
        var reprComp = this.__getRepresentationComponent( repr, p );

        this.reprList.push( reprComp );
        this.signals.representationAdded.dispatch( reprComp );

        return reprComp;

    },

    addBufferRepresentation: function( buffer, params ){

        return Component.prototype.addRepresentation.call(
            this, "buffer", buffer, params
        );

    },

    hasRepresentation: function( repr ){

        return this.reprList.indexOf( repr ) !== -1;

    },

    /**
     * Removes a representation component
     * @fires Component#representationRemoved
     * @param {RepresentationComponent} repr - the representation component
     * @return {undefined}
     */
    removeRepresentation: function( repr ){

        var idx = this.reprList.indexOf( repr );
        if( idx !== -1 ){
            this.reprList.splice( idx, 1 );
            repr.dispose();
            this.signals.representationRemoved.dispatch( repr );
        }

    },

    updateRepresentations: function( what ){

        this.reprList.forEach( function( repr ){
            repr.update( what );
        } );

        this.stage.viewer.requestRender();

    },

    /**
     * Removes all representation components
     * @fires Component#representationRemoved
     * @return {undefined}
     */
    removeAllRepresentations: function(){

        // copy via .slice because side effects may change reprList
        this.reprList.slice().forEach( function( repr ){
            this.removeRepresentation( repr );
        }, this );

    },

    clearRepresentations: function(){

        console.warn( ".clearRepresentations is deprecated, use .removeAllRepresentations() instead" );
        this.removeAllRepresentations();

    },

    dispose: function(){

        this.removeAllRepresentations();
        delete this.reprList;
        this.signals.disposed.dispatch();

    },

    /**
     * Set the visibility of the component, including added representations
     * @fires Component#visibilityChanged
     * @param {Boolean} value - visibility flag
     * @return {Component} this object
     */
    setVisibility: function( value ){

        this.visible = value;

        this.eachRepresentation( function( repr ){
            repr.updateVisibility();
        } );

        this.signals.visibilityChanged.dispatch( value );

        return this;

    },

    setStatus: function( value ){

        this.status = value;
        this.signals.statusChanged.dispatch( value );

        return this;

    },

    setName: function( value ){

        this.name = value;
        this.signals.nameChanged.dispatch( value );

        return this;

    },

    getCenter: function(){

        // log.warn( "not implemented" )

    },

    eachRepresentation: function( callback ){

        this.reprList.forEach( callback );

    }

};


export default Component;
