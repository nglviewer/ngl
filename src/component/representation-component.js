/**
 * @file Representation Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import Component from "./component.js";


// add here to avoid cyclic import dependency
Component.prototype.__getRepresentationComponent = function( repr, p ){
    return new RepresentationComponent(
        this.stage, repr, p, this
    );
};


/**
 * @ignore
 * @event RepresentationComponent#representationAdded
 */

/**
 * @ignore
 * @event RepresentationComponent#representationRemoved
 */

/**
 * {@link Signal}, dispatched when parameters change
 * @example
 * component.signals.parametersChanged.add( function( params ){ ... } );
 * @event RepresentationComponent#parametersChanged
 * @type {RepresentationParameters}
 */


/**
 * Component wrapping a Representation object
 * @class
 * @extends Component
 * @param {Stage} stage - stage object the component belongs to
 * @param {Representation} repr - representation object to wrap
 * @param {RepresentationParameters} [params] - component parameters
 * @param {Component} [parent] - parent component
 */
function RepresentationComponent( stage, repr, params, parent ){

    var p = params || {};
    p.name = defaults( p.name, repr.type );

    Component.call( this, stage, p );

    this.parent = parent;

    this.setRepresentation( repr );

}

RepresentationComponent.prototype = Object.assign( Object.create(

    Component.prototype ), {

    constructor: RepresentationComponent,

    type: "representation",

    signals: Object.assign( {

        parametersChanged: null,

    }, Component.prototype.signals ),

    getType: function(){

        return this.repr.type;

    },

    setRepresentation: function( repr ){

        this.disposeRepresentation();
        this.repr = repr;
        // this.name = repr.type;
        this.stage.tasks.listen( this.repr.tasks );
        this.updateVisibility();

    },

    /**
     * @ignore
     * @alias RepresentationComponent#addRepresentation
     * @return {undefined}
     */
    addRepresentation: function(){},

    /**
     * @ignore
     * @alias RepresentationComponent#removeRepresentation
     * @return {undefined}
     */
    removeRepresentation: function(){},

    /**
     * @ignore
     * @alias RepresentationComponent#hasRepresentation
     * @return {undefined}
     */
    hasRepresentation: function(){},

    disposeRepresentation: function(){

        if( this.repr ){
            this.stage.tasks.unlisten( this.repr.tasks );
            this.repr.dispose();
        }

    },

    dispose: function(){

        if( this.parent && this.parent.hasRepresentation( this ) ){
            this.parent.removeRepresentation( this );
        }else{
            this.disposeRepresentation();
            this.signals.disposed.dispatch();
        }

    },

    /**
     * Set the visibility of the component, takes parent visibility into account
     * @alias RepresentationComponent#setVisibility
     * @fires Component#visibilityChanged
     * @param {Boolean} value - visibility flag
     * @return {RepresentationComponent} this object
     */
    setVisibility: function( value ){

        this.visible = value;
        this.updateVisibility();
        this.signals.visibilityChanged.dispatch( this.visible );

        return this;

    },

    getVisibility: function(){

        if( this.parent ){
            return this.parent.visible && this.visible;
        }else{
            return this.visible;
        }

    },

    updateVisibility: function(){

        this.repr.setVisibility( this.getVisibility() );

    },

    /**
     * Set selection
     * @alias RepresentationComponent#update
     * @param {Object} what - flags indicating what attributes to update
     * @param {Boolean} what.position - update position attribute
     * @param {Boolean} what.color - update color attribute
     * @param {Boolean} what.radius - update radius attribute
     * @return {RepresentationComponent} this object
     */
    update: function( what ){

        this.repr.update( what );

        return this;

    },

    build: function( params ){

        this.repr.build( params );

        return this;

    },

    /**
     * Set selection
     * @alias RepresentationComponent#setSelection
     * @param {String} string - selection string
     * @return {RepresentationComponent} this object
     */
    setSelection: function( string ){

        this.repr.setSelection( string );

        return this;

    },

    /**
     * Set representation parameters
     * @alias RepresentationComponent#setParameters
     * @fires RepresentationComponent#parametersChanged
     * @param {RepresentationParameters} params - parameter object
     * @return {RepresentationComponent} this object
     */
    setParameters: function( params ){

        this.repr.setParameters( params );
        this.signals.parametersChanged.dispatch(
            this.repr.getParameters()
        );

        return this;

    },

    getParameters: function(){

        return this.repr.getParameters();

    },

    setColor: function( value ){

        this.repr.setColor( value );

        return this;

    },

    /**
     * @ignore
     * @alias RepresentationComponent#getCenter
     * @return {undefined}
     */
    getCenter: function(){}

} );


export default RepresentationComponent;
