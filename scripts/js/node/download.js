
var fs = require( "fs" );
var http = require('http');
var zlib = require('zlib');
var download = require( "download" );
var ArgumentParser = require('argparse').ArgumentParser;

var now = require( "performance-now" );
global.performance = { now: now };

var doChunked = require( "../lib/utils.js" ).doChunked;


const mmtfExt = [ "mmtf", "bb.mmtf" ];

function parseIdListFile( path ){
    return fs.readFileSync( path, "utf8" ).trim().split( "\n" );
}

function getUrl( id, format, gz ){
    if( format === "cif" ){
        return "http://files.rcsb.org/download/" + id + ".cif" + ( gz ? ".gz" : "" );
    }else if( format === "pdb" ){
        return "http://files.rcsb.org/download/" + id + ".pdb" + ( gz ? ".gz" : "" );
    }else if( format === "bb.mmtf" ){
        return "http://mmtf.rcsb.org/v1.0/reduced/" + id;
    }else{
        return "http://mmtf.rcsb.org/v1.0/full/" + id;
    }
}

function downloadIds( idList, options ){
    var outPath = options.outPath;
    var format = options.format;
    var gz = options.gz;
    var pool = new http.Agent();
    pool.maxSockets = 1;
    if( !fs.existsSync( outPath ) ){
        fs.mkdirSync( outPath );
    }
    return Promise.all( idList.map( function( name ){
        var url = getUrl( name, format, gz );
        var fileName = name + "." + format + ( gz ? ".gz" : "" );
        var ds = download( url, undefined, { pool: pool } );
        var os = fs.createWriteStream( outPath + "/" + fileName );
        if( mmtfExt.includes( format ) && gz ){
            ds.pipe( zlib.createGzip() ).pipe( os );
        }else{
            ds.pipe( os );
        }
        return ds;
    } ) ).catch( function( e ){
        console.error( e, idList )
    } );
}

function downloadIdsChunked( idList, options ){
    var t0 = performance.now();
    doChunked( idList, downloadIds, options, 1 ).then( function(){
        var t1 = performance.now();
        console.log( t1 - t0 );
    } );
}


var parser = new ArgumentParser( {
    addHelp: true,
    description: "Download MMTF (full or reduced), mmCIF or PDB files."
} );
parser.addArgument( "--idListFile", {
    help: "file in path"
});
parser.addArgument( "--outDir", {
    help: "dir out path"
});
parser.addArgument( "--format", {
    help: "mmtf, bb.mmtf, cif or pdb"
});
parser.addArgument( "--gz", {
    action: "storeTrue",
    help: "gzip use"
});
parser.addArgument( "--allCurrent", {
    action: "storeTrue",
    help: "gzip use"
});
var args = parser.parseArgs();

if( args.idListFile !== null ){
    downloadIdsChunked(
        parseIdListFile( args.idListFile ),
        {
            outPath: args.outDir,
            format: args.format.toLowerCase(),
            gz: args.gz
        }
    );
}else if( args.allCurrent ){
    var url = "http://www.rcsb.org/pdb/json/getCurrent";
    download( url ).then( function( res ){
        downloadIdsChunked(
            JSON.parse( res ).idList,
            {
                outPath: args.outDir,
                format: args.format.toLowerCase(),
                gz: args.gz
            }
        );
    } );
}
