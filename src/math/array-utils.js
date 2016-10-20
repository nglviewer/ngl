/**
 * @file Array Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { TwoPI } from "./math-constants.js";


function circularMean( array, max, stride, offset, indices ){

    // http://en.wikipedia.org/wiki/Center_of_mass#Systems_with_periodic_boundary_conditions

    // Bai, Linge; Breen, David (2008). Calculating Center of Mass in an Unbounded 2D Environment. Journal of Graphics, GPU, and Game Tools 13 (4): 53–60.

    // http://stackoverflow.com/questions/18166507/using-fft-to-find-the-center-of-mass-under-periodic-boundary-conditions

    stride = stride || 1;
    offset = offset || 0;

    var n = indices ? indices.length : array.length / stride;
    var angle, i, c;

    var cosMean = 0;
    var sinMean = 0;

    if( indices ){

        for( i = 0; i < n; ++i ){

            c = ( array[ indices[ i ] * stride + offset ] + max ) % max;

            angle = ( c / max ) * TwoPI - Math.PI;

            cosMean += Math.cos( angle );
            sinMean += Math.sin( angle );

        }

    }else{

        for( i = offset; i < n; i += stride ){

            c = ( array[ i ] + max ) % max;

            angle = ( c / max ) * TwoPI - Math.PI;

            cosMean += Math.cos( angle );
            sinMean += Math.sin( angle );

        }

    }

    cosMean /= n;
    sinMean /= n;

    var meanAngle = Math.atan2( sinMean, cosMean );

    var mean = ( meanAngle + Math.PI ) / TwoPI * max;

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

    for( var i = 0; i < length; ++i ){
        dst[ dstOffset + i ] = src[ srcOffset + i ];
    }

}


function copyWithin( array, srcOffset, dstOffset, length ){

    copyArray( array, array, srcOffset, dstOffset, length );

}


var swap = new Float32Array( 4 );
var temp = new Float32Array( 4 );
/**
 * quicksortIP
 * @function
 * @author Roman Bolzern <roman.bolzern@fhnw.ch>, 2013
 * @author I4DS http://www.fhnw.ch/i4ds, 2013
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 * @description
 * In-place quicksort for typed arrays (e.g. for Float32Array)
 * provides fast sorting
 * useful e.g. for a custom shader and/or BufferGeometry
 * Complexity: http://bigocheatsheet.com/ see Quicksort
 *
 * @example
 * points: [x, y, z, x, y, z, x, y, z, ...]
 * eleSize: 3 //because of (x, y, z)
 * orderElement: 0 //order according to x
 *
 * @param {TypedArray} arr - array to be sorted
 * @param {Integer} eleSize - element size
 * @param {Integer} orderElement - index of element used for sorting, < eleSize
 * @param {Integer} [begin] - start index for range to be sorted
 * @param {Integer} [end] - end index for range to be sorted
 * @return {TypedArray} the input array
 */
function quicksortIP( arr, eleSize, orderElement, begin, end ){

    begin = begin || 0;
    end = ( end || ( arr.length / eleSize ) ) - 1;

    var stack = [];
    var sp = -1;
    var left = begin;
    var right = end;
    var tmp = 0.0, x = 0, y = 0;

    var swapF = function ( a, b ) {
        a *= eleSize; b *= eleSize;
        for ( y = 0; y < eleSize; y ++ ) {
            tmp = arr[ a + y ];
            arr[ a + y ] = arr[ b + y ];
            arr[ b + y ] = tmp;
        }
    };

    var i, j;

    while ( true ) {

        if ( right - left <= 25 ) {

            for ( j= left + 1; j <= right; j ++ ) {

                for ( x = 0; x < eleSize; x ++ ) {
                    swap[ x ] = arr[ j * eleSize + x ];
                }

                i = j - 1;

                while ( i >= left && arr[ i * eleSize + orderElement ] > swap[ orderElement ] ) {
                    for ( x = 0; x < eleSize; x ++ ) {
                        arr[ ( i + 1 ) * eleSize + x ] = arr[ i * eleSize + x ];
                    }
                    i --;
                }

                for ( x = 0; x < eleSize; x ++ ) {
                    arr[ ( i + 1 ) * eleSize + x ] = swap[ x ];
                }

            }

            if ( sp == -1 ) break;

            right = stack[ sp -- ]; //?
            left = stack[ sp -- ];

        } else {

            var median = ( left + right ) >> 1;

            i = left + 1;
            j = right;

            swapF( median, i );

            if ( arr[ left * eleSize + orderElement ] > arr[ right * eleSize + orderElement ] ){
                swapF( left, right );
            }

            if ( arr[ i * eleSize + orderElement ] > arr[ right * eleSize + orderElement ] ) {
                swapF( i, right );
            }

            if ( arr[ left * eleSize + orderElement ] > arr[ i * eleSize + orderElement ] ) {
                swapF( left, i );
            }

            for ( x = 0; x < eleSize; x ++ ) {
                temp[ x ] = arr[ i * eleSize + x ];
            }

            while ( true ) {
                do i ++; while ( arr[ i * eleSize + orderElement ] < temp[ orderElement ] );
                do j --; while ( arr[ j * eleSize + orderElement ] > temp[ orderElement ] );
                if ( j < i ) break;
                swapF( i, j );
            }

            for ( x = 0; x < eleSize; x ++ ) {
                arr[ ( left + 1 ) * eleSize + x ] = arr[ j * eleSize + x ];
                arr[ j * eleSize + x ] = temp[ x ];
            }

            if ( right - i + 1 >= j - left ) {
                stack[ ++ sp ] = i;
                stack[ ++ sp ] = right;
                right = j - 1;
            } else {
                stack[ ++ sp ] = left;
                stack[ ++ sp ] = j - 1;
                left = i;
            }

        }

    }

    return arr;

}


function quicksortCmp( arr, cmp, begin, end ){

    cmp = cmp || function cmp( a, b ){
        if( a > b ) return 1;
        if( a < b ) return -1;
        return 0;
    };
    begin = begin || 0;
    end = ( end || arr.length ) - 1;

    var stack = [];
    var sp = -1;
    var left = begin;
    var right = end;
    var tmp = 0.0, tmp2 = 0.0;

    function swap( a, b ){
        tmp2 = arr[ a ];
        arr[ a ] = arr[ b ];
        arr[ b ] = tmp2;
    }

    var i, j;

    while ( true ) {

        if ( right - left <= 25 ) {

            for ( j = left + 1; j <= right; ++j ) {

                tmp = arr[ j ];
                i = j - 1;

                while ( i >= left && cmp( arr[ i ], tmp ) > 0 ) {
                    arr[ i + 1 ] = arr[ i ];
                    --i;
                }

                arr[ i + 1 ] = tmp;

            }

            if ( sp === -1 ) break;

            right = stack[ sp-- ]; //?
            left = stack[ sp-- ];

        } else {

            var median = ( left + right ) >> 1;

            i = left + 1;
            j = right;

            swap( median, i );

            if( cmp( arr[ left ], arr[ right ] ) > 0 ){
                swap( left, right );
            }

            if( cmp( arr[ i ], arr[ right ] ) > 0 ){
                swap( i, right );
            }

            if( cmp( arr[ left ], arr[ i ] ) > 0 ){
                swap( left, i );
            }

            tmp = arr[ i ];

            while( true ){
                do i++; while( cmp( arr[ i ], tmp ) < 0 );
                do j--; while( cmp( arr[ j ], tmp ) > 0 );
                if( j < i ) break;
                swap( i, j );
            }

            arr[ left + 1 ] = arr[ j ];
            arr[ j ] = tmp;

            if ( right - i + 1 >= j - left ){
                stack[ ++sp ] = i;
                stack[ ++sp ] = right;
                right = j - 1;
            } else {
                stack[ ++sp ] = left;
                stack[ ++sp ] = j - 1;
                left = i;
            }

        }

    }

    return arr;

}


function quickselectCmp( arr, n, cmp, left, right ){

    cmp = cmp || function cmp( a, b ){
        if( a > b ) return 1;
        if( a < b ) return -1;
        return 0;
    };
    left = left || 0;
    right = ( right || arr.length ) - 1;

    var tmp, i, pivotIndex, pivotValue, storeIndex;

    function swap( a, b ){
        tmp = arr[ a ];
        arr[ a ] = arr[ b ];
        arr[ b ] = tmp;
    }

    while( true ){
        if( left === right ){
            return arr[ left ];
        }
        pivotIndex = ( left + right ) >> 1;
        pivotValue = arr[ pivotIndex ];
        swap( pivotIndex, right );
        storeIndex = left;
        for( i = left; i < right; ++i ){
            if( cmp( arr[ i ], pivotValue ) < 0 ){
                swap( storeIndex, i );
                ++storeIndex;
            }
        }
        swap( right, storeIndex );
        pivotIndex = storeIndex;
        if( n === pivotIndex ){
            return arr[ n ];
        }else if( n < pivotIndex ){
            right = pivotIndex - 1;
        }else{
            left = pivotIndex + 1;
        }
    }

}


function arrayMax( array ){

    var max = -Infinity;
    for( var i = 0, il = array.length; i < il; ++i ){
        if( array[ i ] > max ) max = array[ i ];
    }
    return max;

}


function arrayMin( array ){

    var min = Infinity;
    for( var i = 0, il = array.length; i < il; ++i ){
        if( array[ i ] < min ) min = array[ i ];
    }
    return min;

}


function arraySorted( array ){

    for( var i = 1, il = array.length; i < il; ++i ){
        if( array[ i - 1 ] > array[ i ] ) return false;
    }
    return true;

}


function arraySortedCmp( array, cmp ){

    for( var i = 1, il = array.length; i < il; ++i ){
        if( cmp( array[ i - 1 ], array[ i ] ) > 0 ) return false;
    }
    return true;

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
    copyArray,
    copyWithin,
    quicksortIP,
    quicksortCmp,
    quickselectCmp,
    arrayMax,
    arrayMin,
    arraySorted,
    arraySortedCmp
};
