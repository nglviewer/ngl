
import BitArray from "../../src/utils/bitarray.js";

import { assert } from 'chai';


describe( 'utils/bitarray', function() {


describe( 'BitArray', function () {
    it( 'set basic', function () {

        var ba = new BitArray( 40 );

        assert.strictEqual( ba.get( 10 ), false, "after init" );

        ba.set( 10 );
        assert.strictEqual( ba.get( 10 ), true, "after set" );

        ba.unset( 10 );
        assert.strictEqual( ba.get( 10 ), false, "after unset" );

    } );

    it( 'words', function () {

        var words = new Uint32Array( 2 );
        var ba = new BitArray( 40 );

        assert.deepEqual( ba._words, words, "after init" );

        ba.set( 0 );
        words[ 0 ] = 1;
        assert.deepEqual( ba._words, words, "after set" );

        ba.unset( 0 );
        words[ 0 ] = 0;
        assert.deepEqual( ba._words, words, "after unset" );

        ba.set( 32 );
        words[ 1 ] = 1;
        assert.deepEqual( ba._words, words, "after set" );

        ba.unset( 32 );
        words[ 1 ] = 0;
        assert.deepEqual( ba._words, words, "after unset" );

    } );

    it( 'set edge', function () {

        var ba = new BitArray( 40 );

        assert.strictEqual( ba.get( 39 ), false, "after init" );

        ba.set( 39 );
        assert.strictEqual( ba.get( 39 ), true, "after set" );

        ba.unset( 39 );
        assert.strictEqual( ba.get( 39 ), false, "after unset" );

    } );

    it( 'size', function () {

        var ba = new BitArray( 40 );

        assert.strictEqual( ba.getSize(), 0, "after init" );

        ba.set( 10 );
        assert.strictEqual( ba.getSize(), 1, "after set" );

        ba.unset( 10 );
        assert.strictEqual( ba.getSize(), 0, "after unset" );

    } );

    it( 'array', function () {

        var ba = new BitArray( 40 );

        assert.deepEqual( ba.toArray(), [], "after init" );

        ba.set( 10 );
        assert.deepEqual( ba.toArray(), [ 10 ], "after set" );

        ba.unset( 10 );
        assert.deepEqual( ba.toArray(), [], "after unset" );

    } );

    it( 'array edge', function () {

        var ba = new BitArray( 40 );

        assert.deepEqual( ba.toArray(), [], "after init" );

        ba.set( 39 );
        assert.deepEqual( ba.toArray(), [ 39 ], "after set" );

        ba.unset( 39 );
        assert.deepEqual( ba.toArray(), [], "after unset" );

    } );

    it( 'for each', function () {

        var result = [];
        var expected = [
            2, 0,
            9, 1,
            33, 2
        ];

        var ba = new BitArray( 40 );
        ba.set( 9 );
        ba.set( 2 );
        ba.set( 33 );
        ba.forEach( function( index, i ){
            result.push( index, i );
        } );
        assert.deepEqual( result, expected, "results" );

    } );

    it( 'string', function () {

        var ba = new BitArray( 40 );

        assert.deepEqual( ba.toString(), "{}", "after init" );

        ba.set( 9 );
        assert.deepEqual( ba.toString(), "{9}", "after set" );

        ba.set( 2 );
        ba.set( 33 );
        assert.deepEqual( ba.toString(), "{2,9,33}", "after more sets" );

    } );

    it( 'sele string', function () {

        var ba = new BitArray( 40 );

        assert.deepEqual( ba.toSeleString(), "NONE", "after init" );

        ba.set( 10 );
        assert.deepEqual( ba.toSeleString(), "@10", "after set" );

        ba.set( 2 );
        ba.set( 36 );
        assert.deepEqual( ba.toSeleString(), "@2,10,36", "after more sets" );

    } );

    it( 'set all', function () {

        var ba = new BitArray( 40 );

        assert.deepEqual( ba.toArray(), [], "after init" );
        assert.strictEqual( ba.getSize(), 0, "after init" );

        ba.setAll();
        assert.deepEqual( ba.toArray(), [...Array( 40 ).keys() ], "after set" );
        assert.strictEqual( ba.getSize(), 40, "after set" );

        ba.unsetAll();
        assert.deepEqual( ba.toArray(), [], "after unset" );
        assert.strictEqual( ba.getSize(), 0, "after unset" );

    } );

    it( 'clone', function () {

        var ba = new BitArray( 40 );
        var bac = ba.clone();
        assert.isTrue( bac instanceof BitArray, "after init" );
        assert.deepEqual( ba._words, new Uint32Array( 2 ), "after init" );
        assert.deepEqual( ba._words, bac._words, "after init" );
        assert.strictEqual( ba.length, 40, "after init" );
        assert.strictEqual( bac.length, 40, "after init" );

        ba.setAll();
        bac = ba.clone();
        assert.isTrue( bac instanceof BitArray, "after set" );
        assert.deepEqual( ba._words, new Uint32Array( [ 0xFFFFFFFF, 0xFF ] ), "after set" );
        assert.deepEqual( ba._words, bac._words, "after set" );
        assert.strictEqual( ba.length, 40, "after set" );
        assert.strictEqual( bac.length, 40, "after set" );

    } );

} );


} );
