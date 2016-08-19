/**
 * @file Mapped Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Buffer from "./buffer.js";


function MappedBuffer( params ){

    // required
    // - mapping
    // - mappingType
    // - mappingSize
    // - mappingItemSize
    // - mappingIndices
    // - mappingIndicesSize

    this.size = this.count;
    this.attributeSize = this.count * this.mappingSize;

    var n = this.count * this.mappingIndicesSize;
    var TypedArray = this.attributeSize > 65535 ? Uint32Array : Uint16Array;
    this.index = new TypedArray( n );
    this.makeIndex();

    Buffer.call( this, null, null, this.index, null, params );

    this.addAttributes( {
        "mapping": { type: this.mappingType, value: null },
    } );

}

MappedBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: MappedBuffer,

    setAttributes: function( data ){

        var count = this.count;
        var mappingSize = this.mappingSize;
        var attributes = this.geometry.attributes;

        var a, d, itemSize, array, n, i, j;

        for( var name in data ){

            d = data[ name ];
            a = attributes[ name ];
            itemSize = a.itemSize;
            array = a.array;

            for( var k = 0; k < count; ++k ) {

                n = k * itemSize;
                i = n * mappingSize;

                for( var l = 0; l < mappingSize; ++l ) {

                    j = i + ( itemSize * l );

                    for( var m = 0; m < itemSize; ++m ) {

                        array[ j + m ] = d[ n + m ];

                    }

                }

            }

            a.needsUpdate = true;

        }

    },

    makeMapping: function(){

        var count = this.count;
        var mapping = this.mapping;
        var mappingSize = this.mappingSize;
        var mappingItemSize = this.mappingItemSize;

        var aMapping = this.geometry.attributes.mapping.array;

        for( var v = 0; v < count; v++ ) {

            aMapping.set( mapping, v * mappingItemSize * mappingSize );

        }

    },

    makeIndex: function(){

        var count = this.count;
        var mappingSize = this.mappingSize;
        var mappingIndices = this.mappingIndices;
        var mappingIndicesSize = this.mappingIndicesSize;

        var index = this.index;

        var ix, it;

        for( var v = 0; v < count; v++ ) {

            ix = v * mappingIndicesSize;
            it = v * mappingSize;

            index.set( mappingIndices, ix );

            for( var s = 0; s < mappingIndicesSize; ++s ){
                index[ ix + s ] += it;
            }

        }

    }

} );


export default MappedBuffer;
