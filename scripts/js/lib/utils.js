
var Queue = require( "./queue.js" );


function getChunkList( listLength, chunkSize ){
    var chunkList = [];
    for( var i = 0, il = listLength; i < il; i += chunkSize ){
        chunkList.push( i );
    }
    return chunkList;
}

function doChunked( list, func, options, chunkSize ){
    return new Promise( function( resolve, reject ){
        var queue = new Queue( function( start, callback ){
            var listChunk = list.slice( start, start + chunkSize );
            func( listChunk, options ).then( function(){
                // console.log( start + chunkSize );
                if( queue.length() === 0 ){
                    resolve();
                }
                callback();
            } );
        }, getChunkList( list.length, chunkSize ) );
    } );
}


exports.doChunked = doChunked;
