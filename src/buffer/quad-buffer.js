/**
 * @file Quad Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import MappedBuffer from "./mapped-buffer.js";


function QuadBuffer( params ){

    this.mapping = new Float32Array([
        -1.0,  1.0,
        -1.0, -1.0,
         1.0,  1.0,
         1.0, -1.0
    ]);

    this.mappingIndices = new Uint16Array([
        0, 1, 2,
        1, 3, 2
    ]);

    this.mappingIndicesSize = 6;
    this.mappingType = "v2";
    this.mappingSize = 4;
    this.mappingItemSize = 2;

    MappedBuffer.call( this, params );

}

QuadBuffer.prototype = Object.assign( Object.create(

    MappedBuffer.prototype ), {

    constructor: QuadBuffer

} );


export default QuadBuffer;
