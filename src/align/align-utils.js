/**
 * @file Align Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import Selection from "../selection.js";
import Alignment from "./alignment.js";
import Superposition from "./superposition.js";


/**
 * Perform structural superposition of two structures,
 * optionally guided by a sequence alignment
 * @param  {Structure|StructureView} s1 - structure 1 which is superposed onto structure 2
 * @param  {Structure|StructureView} s2 - structure 2 onto which structure 1 is superposed
 * @param  {Boolean} [align] - guide the superposition by a sequence alignment
 * @param  {String} [sele1] - selection string for structure 1
 * @param  {String} [sele2] - selection string for structure 2
 * @return {undefined}
 */
function superpose( s1, s2, align, sele1, sele2 ){

    align = defaults( align, false );
    sele1 = defaults( sele1, "" );
    sele2 = defaults( sele2, "" );

    var i, j, n, atoms1, atoms2;

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

        var _atoms1 = [];
        var _atoms2 = [];
        var ap1 = _s1.getAtomProxy();
        var ap2 = _s2.getAtomProxy();

        i = 0;
        _s1.eachResidue( function( r ){

            if( r.traceAtomIndex === undefined ||
                r.traceAtomIndex !== r.getAtomIndexByName( "CA" ) ) return;

            if( aliIdx1[ i ] ){
                ap1.index = r.getAtomIndexByName( "CA" );
                _atoms1.push( ap1.x, ap1.y, ap1.z );
            }
            i += 1;

        } );

        i = 0;
        _s2.eachResidue( function( r ){

            if( r.traceAtomIndex === undefined ||
                r.traceAtomIndex !== r.getAtomIndexByName( "CA" ) ) return;

            if( aliIdx2[ i ] ){
                ap2.index = r.getAtomIndexByName( "CA" );
                _atoms2.push( ap2.x, ap2.y, ap2.z );
            }
            i += 1;

        } );

        atoms1 = new Float32Array( _atoms1 );
        atoms2 = new Float32Array( _atoms2 );

    }else{

        var sviewCa1 = s1.getView( new Selection( sele1 + " and .CA" ) );
        var sviewCa2 = s2.getView( new Selection( sele2 + " and .CA" ) );

        atoms1 = sviewCa1;
        atoms2 = sviewCa2;

    }

    var superpose = new Superposition( atoms1, atoms2 );
    superpose.transform( s1 );
    s1.refreshPosition();

}


export {
	superpose
};
