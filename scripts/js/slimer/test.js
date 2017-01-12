
var fs = require( "fs" );

var NGL = require( "../../../build/js/ngl.dev.js" );

//

var t0 = performance.now();
var data = fs.read( "data/1crn.pdb" );
var blob = new Blob( [ data ], { type: 'text/plain'} );

NGL.autoLoad( blob, { ext: "pdb" } ).then( function( obj ){
    var t1 = performance.now();
    console.log( t1 - t0 );
    console.log( obj.atomCount );
    slimer.exit();
} ).catch( function( err ){
    console.log(err)
    slimer.exit();
} );
