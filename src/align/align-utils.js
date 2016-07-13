/**
 * @file Align Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Debug, Log } from "../globals.js";
import Selection from "../selection.js";
import Alignment from "./alignment.js";
import Superposition from "./superposition.js";


function superpose( s1, s2, align, sele1, sele2, xsele1, xsele2 ){

    align = align || false;
    sele1 = sele1 || "";
    sele2 = sele2 || "";
    xsele1 = xsele1 || "";
    xsele2 = xsele2 || "";

    var i, j, n, atomSet1, atomSet2, sviewCa1, sviewCa2;

    if( align ){

        var _s1 = s1;
        var _s2 = s2;

        if( sele1 && sele2 ){
            _s1 = s1.getView( new Selection( sele1 ) );
            _s2 = s2.getView( new Selection( sele2 ) );
        }

        var seq1 = _s1.getSequence();
        var seq2 = _s2.getSequence();

        // Log.log( seq1.join("") );
        // Log.log( seq2.join("") );

        var ali = new Alignment( seq1.join(""), seq2.join("") );

        ali.calc();
        ali.trace();

        // Log.log( "superpose alignment score", ali.score );

        // Log.log( ali.ali1 );
        // Log.log( ali.ali2 );

        var l, _i, _j, x, y;
        i = 0;
        j = 0;
        n = ali.ali1.length;
        var aliIdx1 = [];
        var aliIdx2 = [];

        for( l = 0; l < n; ++l ){

            x = ali.ali1[ l ];
            y = ali.ali2[ l ];

            _i = 0;
            _j = 0;

            if( x === "-" ){
                aliIdx2[ j ] = false;
            }else{
                aliIdx2[ j ] = true;
                _i = 1;
            }

            if( y === "-" ){
                aliIdx1[ i ] = false;
            }else{
                aliIdx1[ i ] = true;
                _j = 1;
            }

            i += _i;
            j += _j;

        }

        // Log.log( i, j );

        // Log.log( aliIdx1 );
        // Log.log( aliIdx2 );

        atomSet1 = s1.getAtomSet( false );
        atomSet2 = s2.getAtomSet( false );

        i = 0;
        _s1.eachResidue( function( r ){

            if( !r.getResname1() || r.getAtomIndexByName( "CA" ) === undefined ) return;

            if( aliIdx1[ i ] ){
                atomSet1.add_unsafe( r.getAtomIndexByName( "CA" ) );
            }
            i += 1;

        } );

        i = 0;
        _s2.eachResidue( function( r ){

            if( !r.getResname1() || r.getAtomIndexByName( "CA" ) === undefined ) return;

            if( aliIdx2[ i ] ){
                atomSet2.add_unsafe( r.getAtomIndexByName( "CA" ) );
            }
            i += 1;

        } );

    }else{

        sviewCa1 = s1.getView( new NGL.Selection( sele1 + " and .CA" ) );
        sviewCa2 = s2.getView( new NGL.Selection( sele2 + " and .CA" ) );

    }

    // FIXME
    // if( xsele1 && xsele2 ){

    //     var _atomSet1 = s1.getAtomSet();
    //     var _atomSet2 = s2.getAtomSet();

    //     var _a1 = s1.getAtomProxy();
    //     var _a2 = s2.getAtomProxy();

    //     var xselection1 = new Selection( xsele1 );
    //     var xselection2 = new Selection( xsele2 );

    //     var test1 = xselection1.test;
    //     var test2 = xselection2.test;

    //     as.forEach( function( index ){
    //         ap.index = index;
    //         callback( ap );
    //     } );

    //     n = atoms1.atomCount;

    //     for( i = 0; i < n; ++i ){

    //         a1 = atoms1.atoms[ i ];
    //         a2 = atoms2.atoms[ i ];

    //         if( test1( a1 ) && test2( a2 ) ){

    //             _atomSet1.add_unsafe( a1 );
    //             _atomSet2.add_unsafe( a2 );

    //             // Log.log( a1.qualifiedName(), a2.qualifiedName() )

    //         }

    //     }

    //     atoms1 = _atoms1;
    //     atoms2 = _atoms2;

    // }

    var superpose = new Superposition( sviewCa1, sviewCa2 );

    superpose.transform( s1 );

    s1.center = s1.atomCenter();

}


export {
	superpose
};
