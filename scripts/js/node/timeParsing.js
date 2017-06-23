
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
        console.log( filePath );
        logger.write( filePath.toString() + "\n" );
        return NGL.autoLoad( file ).then( function( o ){
            logger.write( o.atomCount.toString() + "\n" );
        } ).catch( function( err ){
            error.write( fileList.toString() + "\n" );
            error.write( err.toString() + "\n" );
        } );
    } ) );
}

function parseFilesChunked( fileList ){
    var t0 = performance.now();
    doChunked( fileList, parseFiles, {}, 1 ).then( function(){
        var t1 = performance.now();
        var d = t1 - t0;
        console.log( d );
        logger.write( d.toString() );
    } );
}


var parser = new ArgumentParser( {
    addHelp: true,
    description: "Time parsing of files with NGL."
} );
parser.addArgument( "--dir", {
    help: "input path"
});
parser.addArgument( "--out", {
    help: "output path"
});
var args = parser.parseArgs();

var logger = fs.createWriteStream( path.join( args.out, "log.txt" ) );
var error = fs.createWriteStream( path.join( args.out, "err.txt" ) );

if( args.dir !== null ){
    parseFilesChunked( getDirFiles( args.dir ) );
}
