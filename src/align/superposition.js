/**
 * @file Superposition
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log } from "../globals.js";
import { Matrix } from "../math/matrix-utils.js";


function Superposition( atoms1, atoms2 ){

    // allocate & init data structures

    var n;
    if( typeof atoms1.eachSelectedAtom === "function" ){
        n = atoms1.atomCount;
    }else if( atoms1 instanceof Float32Array ){
        n = atoms1.length / 3;
    }

    var coords1 = new Matrix( 3, n );
    var coords2 = new Matrix( 3, n );

    this.coords1t = new Matrix( n, 3 );
    this.coords2t = new Matrix( n, 3 );

    this.A = new Matrix( 3, 3 );
    this.W = new Matrix( 1, 3 );
    this.U = new Matrix( 3, 3 );
    this.V = new Matrix( 3, 3 );
    this.VH = new Matrix( 3, 3 );
    this.R = new Matrix( 3, 3 );

    this.tmp = new Matrix( 3, 3 );
    this.c = new Matrix( 3, 3 );
    this.c.data.set([ 1, 0, 0, 0, 1, 0, 0, 0, -1 ]);

    // prep coords

    this.prepCoords( atoms1, coords1 );
    this.prepCoords( atoms2, coords2 );

    // superpose

    this._superpose( coords1, coords2 );

}

Superposition.prototype = {

    constructor: Superposition,

    _superpose: function( coords1, coords2 ){

        this.mean1 = jsfeat.matmath.mean_rows( coords1 );
        this.mean2 = jsfeat.matmath.mean_rows( coords2 );

        jsfeat.matmath.sub_rows( coords1, this.mean1 );
        jsfeat.matmath.sub_rows( coords2, this.mean2 );

        jsfeat.matmath.transpose( this.coords1t, coords1 );
        jsfeat.matmath.transpose( this.coords2t, coords2 );

        jsfeat.matmath.multiply_ABt( this.A, this.coords2t, this.coords1t );

        var svd = jsfeat.linalg.svd_decompose(
            this.A, this.W, this.U, this.V
        );

        jsfeat.matmath.invert_3x3( this.V, this.VH );
        jsfeat.matmath.multiply_3x3( this.R, this.U, this.VH );

        if( jsfeat.matmath.mat3x3_determinant( this.R ) < 0.0 ){

            Log.log( "R not a right handed system" );

            jsfeat.matmath.multiply_3x3( this.tmp, this.c, this.VH );
            jsfeat.matmath.multiply_3x3( this.R, this.U, this.tmp );

        }

    },

    prepCoords: function( atoms, coords ){

        var i = 0;
        var cd = coords.data;

        if( typeof atoms.eachSelectedAtom === "function" ){

            atoms.eachSelectedAtom( function( a ){

                cd[ i + 0 ] = a.x;
                cd[ i + 1 ] = a.y;
                cd[ i + 2 ] = a.z;

                i += 3;

            } );

        }else if( atoms instanceof Float32Array ){

            cd.set( atoms );

        }else{

            Log.warn( "prepCoords: input type unknown" );

        }

    },

    transform: function( atoms ){

        // allocate data structures

        var n;
        if( typeof atoms.eachSelectedAtom === "function" ){
            n = atoms.atomCount;
        }else if( atoms instanceof Float32Array ){
            n = atoms.length / 3;
        }

        var coords = new Matrix( 3, n );
        var tmp = new Matrix( n, 3 );

        // prep coords

        this.prepCoords( atoms, coords );

        // do transform

        jsfeat.matmath.sub_rows( coords, this.mean1 );
        jsfeat.matmath.multiply_ABt( tmp, this.R, coords );
        jsfeat.matmath.transpose( coords, tmp );
        jsfeat.matmath.add_rows( coords, this.mean2 );

        var i = 0;
        var cd = coords.data;

        if( typeof atoms.eachSelectedAtom === "function" ){

            atoms.eachSelectedAtom( function( a ){

                a.x = cd[ i + 0 ];
                a.y = cd[ i + 1 ];
                a.z = cd[ i + 2 ];

                i += 3;

            } );

        }else if( atoms instanceof Float32Array ){

            atoms.set( cd.subarray( 0, n * 3 ) );

        }else{

            Log.warn( "transform: input type unknown" );

        }

    }

};


export default Superposition;
