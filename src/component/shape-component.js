/**
 * @file Shape Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Component from "./component.js";


/**
 * Component wrapping a shape object
 * @class
 * @extends Component
 * @param {Stage} stage - stage object the component belongs to
 * @param {Shape} shape - shape object to wrap
 * @param {ComponentParameters} params - component parameters
 */
function ShapeComponent( stage, shape, params ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : shape.name;

    Component.call( this, stage, p );

    this.shape = shape;

}

ShapeComponent.prototype = Object.assign( Object.create(

    Component.prototype ), {

    constructor: ShapeComponent,

    /**
     * Component type
     * @alias ShapeComponent#type
     * @constant
     * @type {String}
     * @default
     */
    type: "shape",

    /**
     * Add a new shape representation to the component
     * @alias ShapeComponent#addRepresentation
     * @param {String} type - the name of the representation, one of:
     *                        buffer.
     * @param {BufferRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation: function( type, params ){

        return Component.prototype.addRepresentation.call(
            this, type, this.shape, params
        );

    },

    dispose: function(){

        this.shape.dispose();

        Component.prototype.dispose.call( this );

    }

} );


export default ShapeComponent;
