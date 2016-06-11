/**
 * @file Surface Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Component from "./component.js";


/**
 * Component wrapping a Surface or Volume object
 * @class
 * @augments {Component}
 * @param {Stage} stage - stage object the component belongs to
 * @param {Surface|Volume} surface - surface or volume object to wrap
 * @param {ComponentParameters} params - component parameters
 */
function SurfaceComponent( stage, surface, params ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : surface.name;

    Component.call( this, stage, p );

    this.surface = surface;

}

SurfaceComponent.prototype = Object.assign( Object.create(

    Component.prototype ), {

    constructor: SurfaceComponent,

    type: "surface",

    addRepresentation: function( type, params ){

        return Component.prototype.addRepresentation.call(
            this, type, this.surface, params
        );

    },

    dispose: function(){

        this.surface.dispose();

        Component.prototype.dispose.call( this );

    },

    centerView: function( zoom ){

        var center = this.surface.center;

        if( zoom ){
            zoom = this.surface.boundingBox.size().length();
        }

        this.viewer.centerView( zoom, center );

    },

} );


export default SurfaceComponent;
