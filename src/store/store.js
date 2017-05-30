/**
 * @file Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log } from "../globals.js";
import { getTypedArray } from "../utils.js";


/**
 * Store class
 * @class
 * @param {Integer} [size] - initial size
 */
class Store{

    constructor( size ){

        if( Number.isInteger( size ) ){

            this.init( size );

        }else{

            this.init( 0 );

        }

    }

    init( size ){

        this.length = size;
        this.count = 0;

        for( let i = 0, il = this.__fields.length; i < il; ++i ){

            const name = this.__fields[ i ][ 0 ];
            const itemSize = this.__fields[ i ][ 1 ];
            const arrayType = this.__fields[ i ][ 2 ];
            const arraySize = this.length * itemSize;

            this[ name ] = getTypedArray( arrayType, arraySize );

        }

    }

    resize( size ){

        // Log.time( "Store.resize" );

        this.length = Math.round( size || 0 );
        this.count = Math.min( this.count, this.length );

        for( let i = 0, il = this.__fields.length; i < il; ++i ){

            const name = this.__fields[ i ][ 0 ];
            const itemSize = this.__fields[ i ][ 1 ];
            const arraySize = this.length * itemSize;
            const tmpArray = new this[ name ].constructor( arraySize );

            if( this[ name ].length > arraySize ){
                tmpArray.set( this[ name ].subarray( 0, arraySize ) );
            }else{
                tmpArray.set( this[ name ] );
            }
            this[ name ] = tmpArray;

        }

        // Log.timeEnd( "Store.resize" );

    }

    growIfFull(){

        if( this.count >= this.length ){
            const size = Math.round( this.length * 1.5 );
            this.resize( Math.max( 256, size ) );
        }

    }

    copyFrom( other, thisOffset, otherOffset, length ){

        for( let i = 0, il = this.__fields.length; i < il; ++i ){

            const name = this.__fields[ i ][ 0 ];
            const itemSize = this.__fields[ i ][ 1 ];
            const thisField = this[ name ];
            const otherField = other[ name ];

            for( let j = 0; j < length; ++j ){
                const thisIndex = itemSize * ( thisOffset + j );
                const otherIndex = itemSize * ( otherOffset + j );
                for( let k = 0; k < itemSize; ++k ){
                    thisField[ thisIndex + k ] = otherField[ otherIndex + k ];
                }
            }

        }

    }

    copyWithin( offsetTarget, offsetSource, length ){

        for( let i = 0, il = this.__fields.length; i < il; ++i ){

            const name = this.__fields[ i ][ 0 ];
            const itemSize = this.__fields[ i ][ 1 ];
            const thisField = this[ name ];

            for( let j = 0; j < length; ++j ){
                const targetIndex = itemSize * ( offsetTarget + j );
                const sourceIndex = itemSize * ( offsetSource + j );
                for( let k = 0; k < itemSize; ++k ){
                    thisField[ targetIndex + k ] = thisField[ sourceIndex + k ];
                }
            }

        }

    }

    sort( compareFunction ){

        Log.time( "Store.sort" );

        const thisStore = this;
        const tmpStore = new this.constructor( 1 );

        function swap( index1, index2 ){
            if( index1 === index2 ) return;
            tmpStore.copyFrom( thisStore, 0, index1, 1 );
            thisStore.copyWithin( index1, index2, 1 );
            thisStore.copyFrom( tmpStore, index2, 0, 1 );
        }

        function quicksort( left, right ){
            if( left < right ){
                let pivot = Math.floor( ( left + right ) / 2 );
                let left_new = left;
                let right_new = right;
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

    }

    clear(){

        this.count = 0;

    }

    dispose(){

        delete this.length;
        delete this.count;

        for( let i = 0, il = this.__fields.length; i < il; ++i ){

            const name = this.__fields[ i ][ 0 ];
            delete this[ name ];

        }

    }

}


export default Store;
