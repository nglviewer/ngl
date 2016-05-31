
/**
 * @file Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { defaults } from "../utils.js";
import { makeRepresentation } from "../representation/representation-utils.js";
// import RepresentationComponent from "./representation-component.js";

import Signal from "../../lib/signals.es6.js";


var nextComponentId = 0;


function Component( stage, params ){

    Object.defineProperty( this, 'id', { value: nextComponentId++ } );

    var p = params || {};

    this.name = p.name;
    this.uuid = THREE.Math.generateUUID();
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

    addRepresentation: function( type, object, params ){

        var p = params || {};
        var sp = this.stage.getParameters();
        p.quality = p.quality || sp.quality;
        p.disableImpostor = defaults( p.disableImpostor, !sp.impostor );
        p.visible = defaults( p.visible, true );

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

    removeRepresentation: function( repr ){

        var idx = this.reprList.indexOf( repr );

        if( idx !== -1 ){

            this.reprList.splice( idx, 1 );

        }

        this.signals.representationRemoved.dispatch( repr );

    },

    updateRepresentations: function( what ){

        this.reprList.forEach( function( repr ){

            repr.update( what );

        } );

        this.stage.viewer.requestRender();

    },

    clearRepresentations: function(){

        // copy via .slice because side effects may change reprList
        this.reprList.slice().forEach( function( repr ){

            repr.dispose();

        } );

    },

    dispose: function(){

        this.clearRepresentations();

        delete this.reprList;

        this.signals.disposed.dispatch();

    },

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
