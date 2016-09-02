/**
 * @file Mapped Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { BufferAttribute } from "../../lib/three.es6.js";

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

    resizeAttributes: function( count ){

        var oldCount = this.count;
        this.count = count;
        this.size = this.count;
        this.attributeSize = this.count * this.mappingSize;

        var name;
        var geometry = this.geometry;
        var attributes = geometry.attributes;
        var mappingSize = this.mappingSize;
        var indexLength = count * this.mappingIndicesSize;

        if( count > oldCount ){

            var TypedArray = this.attributeSize > 65535 ? Uint32Array : Uint16Array;
            this.index = new TypedArray( indexLength );
            this.makeIndex();

            geometry.setIndex(
                new BufferAttribute( this.index, 1 )
                    .setDynamic( this.dynamic )
            );

            for( name in attributes ){

                var itemSize = attributes[ name ].itemSize;
                var array = new Float32Array( count * mappingSize * itemSize );

                geometry.addAttribute(
                    name,
                    new BufferAttribute( array, itemSize )
                        .setDynamic( this.dynamic )
                );

            }

            this.makeMapping();

        }else if( count < oldCount ){

            var index = geometry.getIndex();
            index.needsUpdate = indexLength > 0;
            index.updateRange.count = indexLength;

        }

        geometry.setDrawRange( 0, indexLength );

        for( name in attributes ){

            var a = attributes[ name ];
            a.updateRange.count = count * mappingSize * a.itemSize;

        }

    },

    setAttributes: function( data ){

        if( data.position ){
            this.resizeAttributes( data.position.length / 3 );
        }

        var mappingSize = this.mappingSize;
        var geometry = this.geometry;
        var attributes = geometry.attributes;

        for( var name in data ){

            var d = data[ name ];
            var itemSize = attributes[ name ].itemSize;

            var count = this.count;
            var array = attributes[ name ].array;

            for( var k = 0; k < count; ++k ) {

                var n = k * itemSize;
                var i = n * mappingSize;

                for( var l = 0; l < mappingSize; ++l ) {

                    var j = i + ( itemSize * l );

                    for( var m = 0; m < itemSize; ++m ) {

                        array[ j + m ] = d[ n + m ];

                    }

                }

            }

            attributes[ name ].needsUpdate = count > 0;
            attributes[ name ].updateRange.count = count * mappingSize * itemSize;

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
