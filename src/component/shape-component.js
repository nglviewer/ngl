/**
 * @file Shape Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ComponentRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import Component from "./component.js";


class ShapeComponent extends Component{

    /**
     * Create component wrapping a shape object
     * @param {Stage} stage - stage object the component belongs to
     * @param {Shape} shape - shape object to wrap
     * @param {ComponentParameters} params - component parameters
     */
    constructor( stage, shape, params ){

        var p = params || {};
        p.name = defaults( p.name, shape.name );

        super( stage, p );

        this.shape = shape;

    }

    /**
     * Component type
     * @alias ShapeComponent#type
     * @constant
     * @type {String}
     * @default
     */
    get type(){ return "shape"; }

    /**
     * Add a new shape representation to the component
     * @alias ShapeComponent#addRepresentation
     * @param {String} type - the name of the representation, one of:
     *                        buffer.
     * @param {BufferRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation( type, params ){

        return super.addRepresentation( type, this.shape, params );

    }

    getBox(){

        return this.shape.boundingBox;

    }

    getCenter(){

        return this.shape.center;

    }

    dispose(){

        this.shape.dispose();
        super.dispose();

    }

}

ComponentRegistry.add( "shape", ShapeComponent );


export default ShapeComponent;
