/**
 * @file Spatial Hash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


//import { Debug, Log } from "../globals.js";


function SpatialHash( atomStore, boundingBox ){

    var exp = 3;

    var bb = boundingBox;
    var minX = bb.min.x;
    var minY = bb.min.y;
    var minZ = bb.min.z;
    var boundX = ( ( bb.max.x - minX ) >> exp ) + 1;
    var boundY = ( ( bb.max.y - minY ) >> exp ) + 1;
    var boundZ = ( ( bb.max.z - minZ ) >> exp ) + 1;

    var n = boundX * boundY * boundZ;
    var an = atomStore.count;

    var xArray = atomStore.x;
    var yArray = atomStore.y;
    var zArray = atomStore.z;

    var i, j;

    var count = 0;
    var grid = new Uint32Array( n );
    var bucketIndex = new Int32Array( an );
    for( i = 0; i < an; ++i ){
        var x = ( xArray[ i ] - minX ) >> exp;
        var y = ( yArray[ i ] - minY ) >> exp;
        var z = ( zArray[ i ] - minZ ) >> exp;
        var idx = ( ( ( x * boundY ) + y ) * boundZ ) + z;
        if( ( grid[ idx ] += 1 ) === 1 ){
            count += 1;
        }
        bucketIndex[ i ] = idx;
    }

    var bucketCount = new Uint16Array( count );
    for( i = 0, j = 0; i < n; ++i ){
        var c = grid[ i ];
        if( c > 0 ){
            grid[ i ] = j + 1;
            bucketCount[ j ] = c;
            j += 1;
        }
    }

    var bucketOffset = new Uint32Array( count );
    for( i = 1; i < count; ++i ){
        bucketOffset[ i ] += bucketOffset[ i - 1 ] + bucketCount[ i - 1 ];
    }

    var bucketFill = new Uint16Array( count );
    var bucketArray = new Int32Array( an );
    for( i = 0; i < an; ++i ){
        var bucketIdx = grid[ bucketIndex[ i ] ];
        if( bucketIdx > 0 ){
            var k = bucketIdx - 1;
            bucketArray[ bucketOffset[ k ] + bucketFill[ k ] ] = i;
            bucketFill[ k ] += 1;
        }
    }

    //

    function within( x, y, z, r ){

        var rSq = r * r;

        var loX = Math.max( 0, ( x - r - minX ) >> exp );
        var loY = Math.max( 0, ( y - r - minY ) >> exp );
        var loZ = Math.max( 0, ( z - r - minZ ) >> exp );

        var hiX = Math.min( boundX, ( x + r - minX ) >> exp );
        var hiY = Math.min( boundY, ( y + r - minY ) >> exp );
        var hiZ = Math.min( boundZ, ( z + r - minZ ) >> exp );

        var result = [];

        for( var ix = loX; ix <= hiX; ++ix ){
            for( var iy = loY; iy <= hiY; ++iy ){
                for( var iz = loZ; iz <= hiZ; ++iz ){

                    var idx = ( ( ( ix * boundY ) + iy ) * boundZ ) + iz;
                    var bucketIdx = grid[ idx ];

                    if( bucketIdx > 0 ){

                        var k = bucketIdx - 1;
                        var offset = bucketOffset[ k ];
                        var count = bucketCount[ k ];
                        var end = offset + count;

                        for( var i = offset; i < end; ++i ){

                            var atomIndex = bucketArray[ i ];
                            var dx = xArray[ atomIndex ] - x;
                            var dy = yArray[ atomIndex ] - y;
                            var dz = zArray[ atomIndex ] - z;

                            if( dx * dx + dy * dy + dz * dz <= rSq ){
                                result.push( atomIndex );
                            }

                        }

                    }

                }
            }
        }

        return result;

    }

    // API

    this.within = within;

}


export default SpatialHash;
