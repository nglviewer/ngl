/**
 * @file Geometry Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Component from "./component.js";


/**
 * Component wrapping a geometry object
 * @class
 * @extends Component
 * @param {Stage} stage - stage object the component belongs to
 * @param {Geometry} geometry - geometry object to wrap
 * @param {ComponentParameters} params - component parameters
 */
function GeometryComponent( stage, geometry, params ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : geometry.name;

    Component.call( this, stage, p );

    this.geometry = geometry;

}

GeometryComponent.prototype = Object.assign( Object.create(

    Component.prototype ), {

    constructor: GeometryComponent,

    /**
     * Component type
     * @alias GeometryComponent#type
     * @constant
     * @type {String}
     * @default
     */
    type: "geometry",

    /**
     * Add a new geometry representation to the component
     * @alias GeometryComponent#addRepresentation
     * @param {String} type - the name of the representation, one of:
     *                        buffer.
     * @param {BufferRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation: function( type, params ){

        return Component.prototype.addRepresentation.call(
            this, type, this.geometry, params
        );

    },

    dispose: function(){

        this.geometry.dispose();

        Component.prototype.dispose.call( this );

    }

} );


export default GeometryComponent;
