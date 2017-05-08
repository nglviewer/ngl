
/**
 * @file Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Quaternion, Matrix4 } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { defaults } from "../utils.js";
import { generateUUID } from "../math/math-utils.js";
import { makeRepresentation } from "../representation/representation-utils.js";
// import RepresentationComponent from "./representation-component.js";


let nextComponentId = 0;

const _m = new Matrix4();
const _v = new Vector3();


/**
 * Component parameter object.
 * @typedef {Object} ComponentParameters - component parameters
 * @property {String} name - component name
 * @property {Boolean} visible - component visibility
 */


/**
 * @example
 * component.signals.representationAdded.add( function( representationComponent ){ ... } );
 *
 * @typedef {Object} ComponentSignals
 * @property {Signal<RepresentationComponent>} representationAdded - when a representation is added
 * @property {Signal<RepresentationComponent>} representationRemoved - when a representation is removed
 * @property {Signal<Matrix4>} matrixChanged - on matrix change
 * @property {Signal<Boolean>} visibilityChanged - on visibility change
 * @property {Signal<String>} statusChanged - on status change
 * @property {Signal<String>} nameChanged - on name change
 * @property {Signal<undefined>} disposed - on dispose
 */


/**
 * Base class for components
 * @interface
 */
class Component{

    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {ComponentParameters} params - parameter object
     */
    constructor( stage, params ){

        Object.defineProperty( this, 'id', { value: nextComponentId++ } );

        var p = params || {};

        this.name = p.name;
        this.uuid = generateUUID();
        this.visible = p.visible !== undefined ? p.visible : true;

        /**
         * Events emitted by the component
         * @type {ComponentSignals}
         */
        this.signals = {
            representationAdded: new Signal(),
            representationRemoved: new Signal(),
            visibilityChanged: new Signal(),
            matrixChanged: new Signal(),
            statusChanged: new Signal(),
            nameChanged: new Signal(),
            disposed: new Signal(),
        };

        this.stage = stage;
        this.viewer = stage.viewer;

        this.reprList = [];

        this.matrix = new Matrix4();
        this.position = new Vector3();
        this.quaternion = new Quaternion();
        this.scale = new Vector3( 1, 1, 1 );

    }

    get type(){ return "component"; }

    setPosition( v ){

        this.position.copy( v );
        this.updateMatrix();

    }

    setRotation( q ){

        this.quaternion.copy( q );
        this.updateMatrix();

    }

    setScale( s ){

        this.scale.set( s, s, s );
        this.updateMatrix();

    }

    updateMatrix(){

        var c = this.getCenterUntransformed( _v );
        this.matrix.makeTranslation( -c.x, -c.y, -c.z );

        _m.makeRotationFromQuaternion( this.quaternion );
        this.matrix.premultiply( _m );

        _m.makeScale( this.scale.x, this.scale.y, this.scale.z );
        this.matrix.premultiply( _m );

        var p = this.position;
        _m.makeTranslation( p.x + c.x, p.y + c.y, p.z + c.z );
        this.matrix.premultiply( _m );

        this.reprList.forEach( repr => {
            repr.setParameters( { matrix: this.matrix } );
        } );
        this.stage.viewer.updateBoundingBox();

        this.signals.matrixChanged.dispatch( this.matrix );

    }

    /**
     * Add a new representation to the component
     * @param {String} type - the name of the representation
     * @param {Object} object - the object on which the representation should be based
     * @param {RepresentationParameters} [params] - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation( type, object, params ){

        var p = params || {};
        var sp = this.stage.getParameters();
        p.matrix = this.matrix.clone();
        p.quality = p.quality || sp.quality;
        p.disableImpostor = defaults( p.disableImpostor, !sp.impostor );
        p.useWorker = defaults( p.useWorker, sp.workerDefault );
        p.visible = defaults( p.visible, true );

        var p2 = Object.assign( {}, p, { visible: this.visible && p.visible } );
        var repr = makeRepresentation( type, object, this.viewer, p2 );
        var reprComp = this.__getRepresentationComponent( repr, p );

        this.reprList.push( reprComp );
        this.signals.representationAdded.dispatch( reprComp );

        return reprComp;

    }

    addBufferRepresentation( buffer, params ){

        // always use component base class method
        return Component.prototype.addRepresentation.call(
            this, "buffer", buffer, params
        );

    }

    hasRepresentation( repr ){

        return this.reprList.indexOf( repr ) !== -1;

    }

    /**
     * Removes a representation component
     * @param {RepresentationComponent} repr - the representation component
     * @return {undefined}
     */
    removeRepresentation( repr ){

        var idx = this.reprList.indexOf( repr );
        if( idx !== -1 ){
            this.reprList.splice( idx, 1 );
            repr.dispose();
            this.signals.representationRemoved.dispatch( repr );
        }

    }

    updateRepresentations( what ){

        this.reprList.forEach( function( repr ){
            repr.update( what );
        } );

        this.stage.viewer.requestRender();

    }

    /**
     * Removes all representation components
     * @return {undefined}
     */
    removeAllRepresentations(){

        // copy via .slice because side effects may change reprList
        this.reprList.slice().forEach( function( repr ){
            this.removeRepresentation( repr );
        }, this );

    }

    clearRepresentations(){

        console.warn( ".clearRepresentations is deprecated, use .removeAllRepresentations() instead" );
        this.removeAllRepresentations();

    }

    dispose(){

        this.removeAllRepresentations();
        delete this.reprList;
        this.signals.disposed.dispatch();

    }

    /**
     * Set the visibility of the component, including added representations
     * @param {Boolean} value - visibility flag
     * @return {Component} this object
     */
    setVisibility( value ){

        this.visible = value;

        this.eachRepresentation( function( repr ){
            repr.updateVisibility();
        } );

        this.signals.visibilityChanged.dispatch( value );

        return this;

    }

    setStatus( value ){

        this.status = value;
        this.signals.statusChanged.dispatch( value );

        return this;

    }

    setName( value ){

        this.name = value;
        this.signals.nameChanged.dispatch( value );

        return this;

    }

    /**
     * @return {Box3} the component's bounding box
     */
    getBox(){

        return this.getBoxUntransformed( ...arguments )
                    .clone().applyMatrix4( this.matrix );

    }

    /**
     * @return {Vector3} the component's center position
     */
    getCenter(){

        return this.getCenterUntransformed( ...arguments )
                    .clone().applyMatrix4( this.matrix );

    }

    getZoom(){

        return this.stage.getZoomForBox( this.getBox( ...arguments ) );

    }

    /**
     * @abstract
     * @return {Box3} the untransformed component's bounding box
     */
    getBoxUntransformed(){}

    getCenterUntransformed(){

        return this.getBoxUntransformed().getCenter();

    }

    /**
     * Automatically center and zoom the component
     * @param  {Integer} [duration] - duration of the animation, defaults to 0
     * @return {undefined}
     */
    autoView( duration ){

        this.stage.animationControls.zoomMove(
            this.getCenter(),
            this.getZoom(),
            defaults( duration, 0 )
        );

    }

    eachRepresentation( callback ){

        this.reprList.forEach( callback );

    }

}


export default Component;
