/**
 * @file Slice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import Representation from "./representation.js";
import ImageBuffer from "../buffer/image-buffer.js";


function SliceRepresentation( volume, viewer, params ){

    Representation.call( this, volume, viewer, params );

    this.volume = volume;

    this.build();

}

SliceRepresentation.prototype = Object.assign( Object.create(

    Representation.prototype ), {

    constructor: SliceRepresentation,

    type: "slice",

    parameters: Object.assign( {



    }, Representation.prototype.parameters, {

        colorScheme: {
            type: "select", update: "color", options: {
                "": "",
                "value": "value",
                "uniform": "uniform",
            }
        },

    } ),

    init: function( params ){

        var p = params || {};
        p.colorScheme = defaults( p.colorScheme, "uniform" );
        p.colorValue = defaults( p.colorValue, 0xDDDDDD );

        Representation.prototype.init.call( this, p );

    },

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

        callback();

    },

    create: function(){

        var sliceBuffer = new ImageBuffer();

        this.bufferList.push( sliceBuffer );

    }

} );


export default SliceRepresentation;
