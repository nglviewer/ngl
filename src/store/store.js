/**
 * @file Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log } from "../globals.js";


function Store( sizeOrObject ){

    if( sizeOrObject === undefined ){

        this.init( 0 );

    }else if( Number.isInteger( sizeOrObject ) ){

        this.init( sizeOrObject );

    }else{

        this.fromJSON( sizeOrObject );

    }

}

Store.prototype = {

    constructor: Store,

    type: "Store",

    init: function( size ){

        this.length = size;
        this.count = 0;

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            var itemSize = this.__fields[ i ][ 1 ];
            var arrayType = this.__fields[ i ][ 2 ];
            var arraySize = this.length * itemSize;

            switch( arrayType ){

                case "int8":
                    this[ name ] = new Int8Array( arraySize );
                    break;

                case "int16":
                    this[ name ] = new Int16Array( arraySize );
                    break;

                case "int32":
                    this[ name ] = new Int32Array( arraySize );
                    break;

                case "uint8":
                    this[ name ] = new Uint8Array( arraySize );
                    break;

                case "uint16":
                    this[ name ] = new Uint16Array( arraySize );
                    break;

                case "uint32":
                    this[ name ] = new Uint32Array( arraySize );
                    break;

                case "float32":
                    this[ name ] = new Float32Array( arraySize );
                    break;

                default:
                    Log.warn( "arrayType unknown: " + arrayType );

            }

        }

    },

    resize: function( size ){

        // Log.time( "Store.resize" );

        this.length = Math.round( size || 0 );
        this.count = Math.min( this.count, this.length );

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            var itemSize = this.__fields[ i ][ 1 ];
            var arraySize = this.length * itemSize;
            var tmpArray = new this[ name ].constructor( arraySize );

            if( this[ name ].length > arraySize ){
                tmpArray.set( this[ name ].subarray( 0, arraySize ) );
            }else{
                tmpArray.set( this[ name ] );
            }
            this[ name ] = tmpArray;

        }

        // Log.timeEnd( "Store.resize" );

    },

    growIfFull: function(){

        if( this.count >= this.length ){
            var size = Math.round( this.length * 1.5 );
            this.resize( Math.max( 256, size ) );
        }

    },

    copyFrom: function( other, thisOffset, otherOffset, length ){

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            var itemSize = this.__fields[ i ][ 1 ];
            var thisField = this[ name ];
            var otherField = other[ name ];

            for( var j = 0; j < length; ++j ){
                var thisIndex = itemSize * ( thisOffset + j );
                var otherIndex = itemSize * ( otherOffset + j );
                for( var k = 0; k < itemSize; ++k ){
                    thisField[ thisIndex + k ] = otherField[ otherIndex + k ];
                }
            }

        }

    },

    copyWithin: function( offsetTarget, offsetSource, length ){

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            var itemSize = this.__fields[ i ][ 1 ];
            var thisField = this[ name ];

            for( var j = 0; j < length; ++j ){
                var targetIndex = itemSize * ( offsetTarget + j );
                var sourceIndex = itemSize * ( offsetSource + j );
                for( var k = 0; k < itemSize; ++k ){
                    thisField[ targetIndex + k ] = thisField[ sourceIndex + k ];
                }
            }

        }

    },

    sort: function( compareFunction ){

        Log.time( "Store.sort" );

        var thisStore = this;
        var tmpStore = new this.constructor( 1 );

        function swap( index1, index2 ){
            if( index1 === index2 ) return;
            tmpStore.copyFrom( thisStore, 0, index1, 1 );
            thisStore.copyWithin( index1, index2, 1 );
            thisStore.copyFrom( tmpStore, index2, 0, 1 );
        }

        function quicksort( left, right ){
            if( left < right ){
                var pivot = Math.floor( ( left + right ) / 2 );
                var left_new = left;
                var right_new = right;
                do{
                    while( compareFunction( left_new, pivot ) < 0 ){
                        left_new += 1;
                    }
                    while( compareFunction( right_new, pivot ) > 0 ){
                        right_new -= 1;
                    }
                    if( left_new <= right_new ){
                        if( left_new === pivot ){
                            pivot = right_new;
                        }else if( right_new === pivot ){
                            pivot = left_new;
                        }
                        swap( left_new, right_new );
                        left_new += 1;
                        right_new -= 1;
                    }
                }while( left_new <= right_new );
                quicksort( left, right_new );
                quicksort( left_new, right );
            }
        }

        quicksort( 0, this.count - 1 );

        Log.timeEnd( "Store.sort" );

    },

    clear: function(){

        this.count = 0;

    },

    dispose: function(){

        delete this.length;
        delete this.count;

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            delete this[ name ];

        }

    }

};


export default Store;
