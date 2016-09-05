/**
 * @file Bond Hash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Debug, Log } from "../globals.js";


function BondHash( bondStore, atomCount ){

    if( Debug ) Log.time( "BondHash init" );

    var bondCount = bondStore.count;
    var atomIndex1Array = bondStore.atomIndex1;
    var atomIndex2Array = bondStore.atomIndex2;
    var countArray = new Uint8Array( atomCount );
    var offsetArray = new Int32Array( atomCount );

    var i;

    // count bonds per atom
    for( i = 0; i < bondCount; ++i ){
        countArray[ atomIndex1Array[ i ] ] += 1;
        countArray[ atomIndex2Array[ i ] ] += 1;
    }

    // get offsets to atom bonds
    for( i = 1; i < atomCount; ++i ){
        offsetArray[ i ] += offsetArray[ i - 1 ] + countArray[ i - 1 ];
    }

    // prepare index array
    var bondCount2 = bondCount * 2;
    var indexArray = new Int32Array( bondCount2 );
    for( var j = 0; j < bondCount2; ++j ){
        indexArray[ j ] = -1;
    }

    // build index array
    for( i = 0; i < bondCount; ++i ){
        var idx1 = atomIndex1Array[ i ];
        var idx2 = atomIndex2Array[ i ];
        var j1 = offsetArray[ idx1 ];
        while( indexArray[ j1 ] !== -1 ){
            j1 += 1;
        }
        indexArray[ j1 ] = i;
        var j2 = offsetArray[ idx2 ];
        while( indexArray[ j2 ] !== -1 ){
            j2 += 1;
        }
        indexArray[ j2 ] = i;
    }

    if( Debug ) Log.timeEnd( "BondHash init" );

    // API

    this.countArray = countArray;
    this.offsetArray = offsetArray;
    this.indexArray = indexArray;

}


export default BondHash;
