/**
 * @file Symmetry Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { SymOp } from "./symmetry-constants.js";


function getSymmetryOperations( spacegroup ){

    var symopList = SymOp[ spacegroup ];

    var matrixDict = {};

    if( symopList === undefined ){

        console.warn(
            "getSymmetryOperations: spacegroup '" +
            spacegroup + "' not found in symop library"
        );
        return matrixDict;

    }

    var reInteger = /^[1-9]$/;

    symopList.forEach( function( symop ){

        var ls = symop.split( "," );

        var row = 0;
        var matrix = new THREE.Matrix4().set(
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 1
        );
        var me = matrix.elements;

        matrixDict[ symop ] = matrix;

        // console.log( "symop", ls )

        ls.forEach( function( elm ){

            // console.log( "row", row );

            var negate = false;
            var denominator = false;

            for( var i = 0, n = elm.length; i < n; ++i ){

                var c = elm[ i ];

                if( c === "-" ){

                    negate = true;

                }else if( c === "+" ){

                    negate = false;

                }else if( c === "/" ){

                    denominator = true;

                }else if( c === "X" ){

                    me[ 0 + row ] = negate ? -1 : 1;

                }else if( c === "Y" ){

                    me[ 4 + row ] = negate ? -1 : 1;

                }else if( c === "Z" ){

                    me[ 8 + row ] = negate ? -1 : 1;

                }else if( reInteger.test( c ) ){

                    var integer = parseInt( c );

                    if( denominator ){

                        me[ 12 + row ] /= integer;

                    }else{

                        me[ 12 + row ] = integer;

                    }

                }else{

                    Log.warn(
                        "getSymmetryOperations: unknown token " +
                        "'" + c + "'"
                    );

                }

                // console.log( "token", c )

            }

            row += 1;

        } );

        // console.log( "matrix", me )

    } );

    return matrixDict;

};


export {
    getSymmetryOperations
};
