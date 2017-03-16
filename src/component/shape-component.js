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

        return Component.prototype.addRepresentation.call(
            this, type, this.shape, params
        );

    }

    centerView( zoom ){

        zoom = defaults( zoom, true );

        var center = this.getCenter();

        if( zoom ){

            var bb = this.shape.boundingBox;
            var bbSize = bb.size();
            var maxSize = Math.max( bbSize.x, bbSize.y, bbSize.z );
            var minSize = Math.min( bbSize.x, bbSize.y, bbSize.z );
            // var avgSize = ( bbSize.x + bbSize.y + bbSize.z ) / 3;
            zoom = Math.max( 1, maxSize + ( minSize / 2 ) );  // object size

            // zoom = bb.size().length();

        }

        this.stage.centerView( zoom, center );

        return this;

    }

    getCenter(){

        return this.shape.center;

    }

    dispose(){

        this.shape.dispose();

        Component.prototype.dispose.call( this );

    }

}

ComponentRegistry.add( "shape", ShapeComponent );


export default ShapeComponent;
