/**
 * @file Volume Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ComponentRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import Component from "./component.js";


class VolumeComponent extends Component{

    /**
     * Create component wrapping a volume object
     * @class
     * @extends Component
     * @param {Stage} stage - stage object the component belongs to
     * @param {Volume} volume - volume object to wrap
     * @param {ComponentParameters} params - component parameters
     */
    constructor( stage, volume, params ){

        var p = params || {};
        p.name = defaults( p.name, volume.name );

        super( stage, p );

        this.volume = volume;
        this.stage.gidPool.addObject( this.volume );

    }

    /**
     * Component type
     * @alias VolumeComponent#type
     * @constant
     * @type {String}
     * @default
     */
    get type(){ return "volume"; }

    /**
     * Add a new volume representation to the component
     * @alias VolumeComponent#addRepresentation
     * @param {String} type - the name of the representation, one of:
     *                        surface, dot.
     * @param {VolumeRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation( type, params ){

        return super.addRepresentation( type, this.volume, params );

    }

    getBox(){

        return this.volume.boundingBox;

    }

    getCenter(){

        return this.volume.center;

    }

    dispose(){

        this.stage.gidPool.removeObject( this.volume );
        this.volume.dispose();

        super.dispose();

    }

}

ComponentRegistry.add( "volume", VolumeComponent );


export default VolumeComponent;
