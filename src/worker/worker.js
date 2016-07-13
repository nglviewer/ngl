/**
 * @file Worker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log, Debug, WorkerRegistry } from "../globals.js";


function Worker( name ){

    var pending = 0;
    var postCount = 0;
    var onmessageDict = {};
    var onerrorDict = {};

    var blobUrl = URL.createObjectURL( WorkerRegistry.get( name ) );
    var worker = new window.Worker( blobUrl );

    WorkerRegistry.activeWorkerCount += 1;

    worker.onmessage = function( event ){

        pending -= 1;
        var postId = event.data.__postId;

        if( Debug ) Log.timeEnd( "Worker.postMessage " + name + " #" + postId );

        if( onmessageDict[ postId ] ){
            onmessageDict[ postId ].call( worker, event );
        }else{
            // Log.debug( "No onmessage", postId, name );
        }

        delete onmessageDict[ postId ];
        delete onerrorDict[ postId ];

    };

    worker.onerror = function( event ){

        pending -= 1;
        if( event.data ){
            var postId = event.data.__postId;
            if( onerrorDict[ postId ] ){
                onerrorDict[ postId ].call( worker, event );
            }else{
                Log.error( "Worker.onerror", postId, name, event );
            }
            delete onmessageDict[ postId ];
            delete onerrorDict[ postId ];
        }else{
            Log.error( "Worker.onerror", name, event );
        }

    };

    // API

    this.name = name;

    this.post = function( aMessage, transferList, onmessage, onerror ){

        onmessageDict[ postCount ] = onmessage;
        onerrorDict[ postCount ] = onerror;

        aMessage = aMessage || {};
        aMessage.__name = name;
        aMessage.__postId = postCount;
        aMessage.__debug = Debug;

        if( Debug ) Log.time( "Worker.postMessage " + name + " #" + postCount );

        try{
            worker.postMessage( aMessage, transferList );
        }catch( error ){
            Log.error( "worker.post:", error );
            worker.postMessage( aMessage );
        }

        pending += 1;
        postCount += 1;

        return this;

    };

    this.terminate = function(){

        if( worker ){
            worker.terminate();
            URL.revokeObjectURL( blobUrl );
            WorkerRegistry.activeWorkerCount -= 1;
        }else{
            Log.log( "no worker to terminate" );
        }

    };

    Object.defineProperties( this, {
        postCount: {
            get: function(){ return postCount; }
        },
        pending: {
            get: function(){ return pending; }
        }
    } );

}

Worker.prototype.constructor = Worker;


export default Worker;
