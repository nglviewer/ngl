/**
 * @file Symmetry Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import { Log } from "../globals.js";
import { EncodedSymOp, SymOpCode } from "./symmetry-constants.js";


function getSymmetryOperations( spacegroup ){

    var encodedSymopList = EncodedSymOp[ spacegroup ];
    var matrixDict = {};

    if( encodedSymopList === undefined ){
        console.warn(
            "getSymmetryOperations: spacegroup '" +
            spacegroup + "' not found in symop library"
        );
        return matrixDict;
    }

    var symopList = [];

    for( var i = 0, il = encodedSymopList.length; i < il; i+=3 ){
        var symop = [];
        for( var j = 0; j < 3; ++j ){
            symop.push( SymOpCode[ encodedSymopList[ i + j ] ] );
        }
        symopList.push( symop );
    }

    var reInteger = /^[1-9]$/;

    symopList.forEach( function( symop ){

        // console.log( "symop", symop );

        var row = 0;
        var matrix = new Matrix4().set(
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 1
        );
        var me = matrix.elements;

        matrixDict[ symop ] = matrix;

        symop.forEach( function( elm ){

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

}


export {
    getSymmetryOperations
};
