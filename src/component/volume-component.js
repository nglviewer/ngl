/**
 * @file Volume Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ComponentRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import Component from "./component.js";


/**
 * Component wrapping a Volume object
 * @class
 * @extends Component
 * @param {Stage} stage - stage object the component belongs to
 * @param {Volume} volume - volume object to wrap
 * @param {ComponentParameters} params - component parameters
 */
function VolumeComponent( stage, volume, params ){

    var p = params || {};
    p.name = defaults( p.name, volume.name );

    Component.call( this, stage, p );

    this.volume = volume;
    this.stage.gidPool.addObject( this.volume );

}

VolumeComponent.prototype = Object.assign( Object.create(

    Component.prototype ), {

    constructor: VolumeComponent,

    /**
     * Component type
     * @alias VolumeComponent#type
     * @constant
     * @type {String}
     * @default
     */
    type: "volume",

    /**
     * Add a new volume representation to the component
     * @alias VolumeComponent#addRepresentation
     * @param {String} type - the name of the representation, one of:
     *                        surface, dot.
     * @param {VolumeRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation: function( type, params ){

        return Component.prototype.addRepresentation.call(
            this, type, this.volume, params
        );

    },

    dispose: function(){

        this.stage.gidPool.removeObject( this.volume );
        this.volume.dispose();

        Component.prototype.dispose.call( this );

    },

    centerView: function( zoom ){

        var center = this.volume.center;

        if( zoom ){
            zoom = this.volume.boundingBox.size().length();
        }

        this.viewer.centerView( zoom, center );

    },

} );

ComponentRegistry.add( "volume", VolumeComponent );


export default VolumeComponent;
