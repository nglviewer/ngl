/**
 * @file Binary Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Streamer from "./streamer.js";


function BinaryStreamer( bin, params ){

    if( bin instanceof ArrayBuffer ) bin = new Uint8Array( bin );

    Streamer.call( this, bin, params );

}

BinaryStreamer.prototype = Object.assign( Object.create(

    Streamer.prototype ), {

    constructor: BinaryStreamer,

    type: "binary",

    __srcName: "bin",

} );


export default BinaryStreamer;
