/**
 * @file Array Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


var twoPi = 2 * Math.PI;


function circularMean( array, max, stride, offset, indices ){

    // http://en.wikipedia.org/wiki/Center_of_mass#Systems_with_periodic_boundary_conditions

    // Bai, Linge; Breen, David (2008). Calculating Center of Mass in an Unbounded 2D Environment. Journal of Graphics, GPU, and Game Tools 13 (4): 53–60.

    // http://stackoverflow.com/questions/18166507/using-fft-to-find-the-center-of-mass-under-periodic-boundary-conditions

    stride = stride || 1;
    offset = offset || 0;

    var n = indices ? indices.length : array.length;
    var angle, i, c;

    var cosMean = 0;
    var sinMean = 0;

    if( indices ){

        for( i = 0; i < n; ++i ){

            c = ( array[ indices[ i ] * stride + offset ] + max ) % max;

            angle = ( c / max ) * twoPi - Math.PI;

            cosMean += Math.cos( angle );
            sinMean += Math.sin( angle );

        }

    }else{

        for( i = offset; i < n; i += stride ){

            c = ( array[ i ] + max ) % max;

            angle = ( c / max ) * twoPi - Math.PI;

            cosMean += Math.cos( angle );
            sinMean += Math.sin( angle );

        }

    }

    cosMean /= n;
    sinMean /= n;

    var meanAngle = Math.atan2( sinMean, cosMean );

    var mean = ( meanAngle + Math.PI ) / twoPi * max;

    return mean;

}


function calculateCenterArray( array1, array2, center, offset ){

    var n = array1.length;
    center = center || new Float32Array( n );
    offset = offset || 0;

    for( var i = 0; i < n; i+=3 ){

        center[ offset + i + 0 ] = ( array1[ i + 0 ] + array2[ i + 0 ] ) / 2.0;
        center[ offset + i + 1 ] = ( array1[ i + 1 ] + array2[ i + 1 ] ) / 2.0;
        center[ offset + i + 2 ] = ( array1[ i + 2 ] + array2[ i + 2 ] ) / 2.0;

    }

    return center;

}


function calculateDirectionArray( array1, array2 ){

    var n = array1.length;
    var direction = new Float32Array( n );

    for( var i = 0; i < n; i+=3 ){

        direction[ i + 0 ] = array2[ i + 0 ] - array1[ i + 0 ];
        direction[ i + 1 ] = array2[ i + 1 ] - array1[ i + 1 ];
        direction[ i + 2 ] = array2[ i + 2 ] - array1[ i + 2 ];

    }

    return direction;

}


function uniformArray( n, a ){

    var array = new Float32Array( n );

    for( var i = 0; i < n; ++i ){

        array[ i ] = a;

    }

    return array;

}


function uniformArray3( n, a, b, c ){

    var array = new Float32Array( n * 3 );

    var j;

    for( var i = 0; i < n; ++i ){

        j = i * 3;

        array[ j + 0 ] = a;
        array[ j + 1 ] = b;
        array[ j + 2 ] = c;

    }

    return array;

}


function randomColorArray( n ){

    var array = new Float32Array( n * 3 );

    var j;

    for( var i = 0; i < n; ++i ){

        j = i * 3;

        array[ j + 0 ] = Math.random();
        array[ j + 1 ] = Math.random();
        array[ j + 2 ] = Math.random();

    }

    return array;

}


function replicateArray3Entries( array, m ){

    var n = array.length / 3;
    var repArr = new Float32Array( n * m * 3 );

    for( var i = 0; i < n; ++i ){

        var v = i * 3;
        var k = i * m * 3;

        var a = array[ v + 0 ];
        var b = array[ v + 1 ];
        var c = array[ v + 2 ];

        for( var j = 0; j < m; ++j ){

            var l = k + j * 3;

            repArr[ l + 0 ] = a;
            repArr[ l + 1 ] = b;
            repArr[ l + 2 ] = c;

        }

    }

    return repArr;

}


function calculateMeanArray( array1, array2 ){

    var n = array1.length;
    var mean = new Float32Array( n );

    for( var i = 0; i < n; i++ ){

        mean[ i ] = ( array1[ i ] + array2[ i ] ) / 2.0;

    }

    return mean;

}


function calculateMinArray( array1, array2 ){

    var n = array1.length;
    var min = new Float32Array( n );

    for( var i = 0; i < n; i++ ){

        min[ i ] = Math.min( array1[ i ],  array2[ i ] );

    }

    return min;

}


function copyArray( src, dst, srcOffset, dstOffset, length ){

    var i;
    var n = length;

    for( i = 0; i < n; ++i ){

        dst[ dstOffset + i ] = src[ srcOffset + i ];

    }

}


export {
    circularMean,
    calculateCenterArray,
    calculateDirectionArray,
    uniformArray,
    uniformArray3,
    randomColorArray,
    replicateArray3Entries,
    calculateMeanArray,
    calculateMinArray,
    copyArray
};
