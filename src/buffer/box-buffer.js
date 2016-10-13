/**
 * @file Box Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import MappedBuffer from "./mapped-buffer.js";


function BoxBuffer( params ){

    this.mapping = new Float32Array([
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0
    ]);

    this.mappingIndices = new Uint16Array([
        0, 1, 2,
        0, 2, 3,
        1, 5, 6,
        1, 6, 2,
        4, 6, 5,
        4, 7, 6,
        0, 7, 4,
        0, 3, 7,
        0, 5, 1,
        0, 4, 5,
        3, 2, 6,
        3, 6, 7
    ]);

    this.mappingIndicesSize = 36;
    this.mappingType = "v3";
    this.mappingSize = 8;
    this.mappingItemSize = 3;

    MappedBuffer.call( this, params );

}

BoxBuffer.prototype = Object.assign( Object.create(

    MappedBuffer.prototype ), {

    constructo: BoxBuffer

} );


export default BoxBuffer;
