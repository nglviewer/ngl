/**
 * @file Surface Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ComponentRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import Component from "./component.js";


class SurfaceComponent extends Component{

    /**
     * Create component wrapping a surface object
     * @param {Stage} stage - stage object the component belongs to
     * @param {Surface} surface - surface object to wrap
     * @param {ComponentParameters} params - component parameters
     */
    constructor( stage, surface, params ){

        var p = params || {};
        p.name = defaults( p.name, surface.name );

        super( stage, p );

        this.surface = surface;

    }

    /**
     * Component type
     * @alias SurfaceComponent#type
     * @constant
     * @type {String}
     * @default
     */
    get type(){ return "surface"; }

    /**
     * Add a new surface representation to the component
     * @alias SurfaceComponent#addRepresentation
     * @param {String} type - the name of the representation, one of:
     *                        surface, dot.
     * @param {SurfaceRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation( type, params ){

        return super.addRepresentation( type, this.surface, params );

    }

    getBox(){

        return this.surface.boundingBox;

    }

    getCenter(){

        return this.surface.center;

    }

    dispose(){

        this.surface.dispose();
        super.dispose();

    }

}

ComponentRegistry.add( "surface", SurfaceComponent );


export default SurfaceComponent;
