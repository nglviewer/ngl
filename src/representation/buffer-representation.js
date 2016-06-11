/**
 * @file Buffer Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Representation from "./representation.js";


function BufferRepresentation( buffer, viewer, params ){

    Representation.call( this, buffer, viewer, params );

    this.buffer = buffer;

    this.build();

}

BufferRepresentation.prototype = Object.assign( Object.create(

    Representation.prototype ), {

    constructor: BufferRepresentation,

    type: "buffer",

    parameters: Object.assign( {

    }, Representation.prototype.parameters, {

        colorScheme: null,
        colorScale: null,
        colorValue: null,
        colorDomain: null,
        colorMode: null

    } ),

    create: function(){

        this.bufferList.push( this.buffer );

    },

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

        callback();

    }

} );


export default BufferRepresentation;
