/**
 * @file Buffer Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Representation from "./representation.js";


/**
 * Representation for showing buffer objects
 * @class
 * @extends Representation
 * @param {SphereBuffer|CylinderBuffer} buffer - a buffer object
 * @param {Viewer} viewer - a viewer object
 * @param {RepresentationParameters} params - representation parameters
 */
function BufferRepresentation( buffer, viewer, params ){

    if( !Array.isArray( buffer ) ){
        buffer = [ buffer ];
    }

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

        this.bufferList.push.apply( this.bufferList, this.buffer );

    },

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );
            buffer.setParameters( this.getBufferParams() );

        }, this );

        this.setVisibility( this.visible );

        callback();

    }

} );


export default BufferRepresentation;
