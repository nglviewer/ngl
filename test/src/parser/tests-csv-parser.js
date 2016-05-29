
import CsvParser from "../../../src/parser/csv-parser.js";
import { autoLoad } from "../../../src/loader/loader-utils.js";


describe('parser/csv-parser', function() {


describe('parsing', function () {
    it('basic async', function (done) {
        var path = "../../data/sample.csv";
        autoLoad( path ).then( function( csv ){
            assert.equal( "col1row1Value", csv.data[ 0 ][ 0 ], "Passed!" );
            assert.equal( "col2row3Value", csv.data[ 2 ][ 1 ], "Passed!" );
            done();
        } );
    });
});


});
