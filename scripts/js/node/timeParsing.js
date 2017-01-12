
var fs = require( "fs" );
var zlib = require('zlib');
var path = require( "path" );
var ArgumentParser = require( "argparse" ).ArgumentParser;

var FileAPI = require( "file-api" );
global.File = FileAPI.File;
global.FileReader = FileAPI.FileReader;

var now = require( "performance-now" );
global.performance = { now: now };

var NGL = require( "../../../build/js/ngl.dev.js" );
var doChunked = require( "../lib/utils.js" ).doChunked;

function getDirFiles( dirPath ){
    return fs.readdirSync( dirPath )
        .filter( function( fileName ){
            if( fileName[ 0 ] === "." ) return false;
            return true;
        } )
        .map( function( fileName ){
            return path.join( dirPath, fileName );
        } );
}

var binaryExt = [ "mmtf", "dcd", "mrc", "ccp4", "map", "dxbin" ];

function isBinary( filePath ){
    if( isGzipped( filePath ) ){
        filePath = filePath.substring( 0, filePath.length - 3 );
    }
    return binaryExt.includes( path.extname( filePath ).substring( 1 ) );
}

function isGzipped( filePath ){
    return path.extname( filePath ) === ".gz";
}

function getFileObject( filePath ){
    var binary = isBinary( filePath );
    var gz = isGzipped( filePath );
    var buffer, type;
    if( binary || gz ){
        buffer = fs.readFileSync( filePath );
    }else{
        buffer = fs.readFileSync( filePath, "utf8" );
    }
    if( gz ){
        buffer = zlib.gunzipSync( buffer );
    }
    if( binary ){
        type = "application/octet-binary";
        buffer = new Uint8Array( buffer );
    }else{
        type = "text/plain";
    }
    return new File( {
        name: path.basename( filePath ),
        type: type,
        buffer: buffer
    } );
}

function parseFiles( fileList ){
    return Promise.all( fileList.map( function( filePath ){
        var file = getFileObject( filePath );
        return NGL.autoLoad( file ).then( function( o ){
            // console.log( o.atomCount );
        } ).catch( function( err ){
            console.log( "moin", err );
        } );
    } ) );
}

function parseFilesChunked( fileList ){
    var t0 = performance.now();
    doChunked( fileList, parseFiles, {}, 100 ).then( function(){
        var t1 = performance.now();
        console.log( t1 - t0 );
    } );
}


var parser = new ArgumentParser( {
    addHelp: true,
    description: "Time parsing of files with NGL."
} );
parser.addArgument( "--dir", {
    help: "dir in path"
});
var args = parser.parseArgs();

if( args.dir !== null ){
    parseFilesChunked( getDirFiles( args.dir ) );
}
