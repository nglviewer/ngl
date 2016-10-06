/**
 * @file Surface Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ComponentRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import Component from "./component.js";


/**
 * Component wrapping a Surface object
 * @class
 * @extends Component
 * @param {Stage} stage - stage object the component belongs to
 * @param {Surface} surface - surface object to wrap
 * @param {ComponentParameters} params - component parameters
 */
function SurfaceComponent( stage, surface, params ){

    var p = params || {};
    p.name = defaults( p.name, surface.name );

    Component.call( this, stage, p );

    this.surface = surface;

}

SurfaceComponent.prototype = Object.assign( Object.create(

    Component.prototype ), {

    constructor: SurfaceComponent,

    /**
     * Component type
     * @alias SurfaceComponent#type
     * @constant
     * @type {String}
     * @default
     */
    type: "surface",

    /**
     * Add a new surface representation to the component
     * @alias SurfaceComponent#addRepresentation
     * @param {String} type - the name of the representation, one of:
     *                        surface, dot.
     * @param {SurfaceRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
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

ComponentRegistry.add( "surface", SurfaceComponent );


export default SurfaceComponent;
