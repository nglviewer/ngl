/**
 * @file Aligned Box Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import MappedBuffer from "./mapped-buffer.js";


function AlignedBoxBuffer( params ){

    this.mapping = new Float32Array([
        -1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0
    ]);

    this.mappingIndices = new Uint16Array([
        0, 1, 2,
        1, 4, 2,
        2, 4, 3,
        4, 5, 3
    ]);

    this.mappingIndicesSize = 12;
    this.mappingType = "v3";
    this.mappingSize = 6;
    this.mappingItemSize = 3;

    MappedBuffer.call( this, params );

}

AlignedBoxBuffer.prototype = Object.assign( Object.create(

    MappedBuffer.prototype ), {

    constructor: AlignedBoxBuffer

} );


export default AlignedBoxBuffer;
