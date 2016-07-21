/**
 * @file String Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Streamer from "./streamer.js";


function StringStreamer( str, params ){

    Streamer.call( this, str, params );

}

StringStreamer.prototype = Object.assign( Object.create(

    Streamer.prototype ), {

    constructor: StringStreamer,

    type: "string",

    __srcName: "str",

    _chunk: function( start, end ){

        return this.data.substr( start, end );

    },

} );


export default StringStreamer;
