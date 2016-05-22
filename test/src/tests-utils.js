
import { uint8ToLines } from "../../src/utils.js";


function str2bin( str ){
    var uint = new Uint8Array( str.length );
    for( var i = 0, j = str.length; i < j; ++i ){
        uint[ i ] = str.charCodeAt( i );
    }
    return uint;
}


describe('utils', function() {


describe('uint8ToLines', function () {
    it('multiple chunks', function () {
        var str = "moin\nfoo\nbar\ntest123\n";
        var bin = str2bin( str );
        var lines = uint8ToLines( bin, 4 );
        assert.equal( 4, lines.length, "Passed!" );
        assert.deepEqual( [ "moin", "foo", "bar", "test123" ], lines, "Passed!" );
    });

    it('newline at end', function () {
        var str = "moin\nfoo\nbar\ntest123\n";
        var bin = str2bin( str );
        var lines = uint8ToLines( bin );
        assert.equal( 4, lines.length, "Passed!" );
        assert.deepEqual( [ "moin", "foo", "bar", "test123" ], lines, "Passed!" );
    });

    it('no newline at end', function () {
        var str = "moin\nfoo\nbar\ntest123";
        var bin = str2bin( str );
        var lines = uint8ToLines( bin );
        assert.equal( 4, lines.length, "Passed!" );
        assert.deepEqual( [ "moin", "foo", "bar", "test123" ], lines, "Passed!" );
    });
});


});
