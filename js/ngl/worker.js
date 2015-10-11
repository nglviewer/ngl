/**
 * @file Worker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// Worker

NGL.WorkerRegistry = {

    activeWorkerCount: 0,

    funcDict: {},

    add: function( name, func ){

        NGL.WorkerRegistry.funcDict[ name ] = func;

    },

};


NGL.Worker = function( name ){

    var pending = 0;
    var postCount = 0;
    var onmessageDict = {};
    var onerrorDict = {};

    var worker = new Worker( NGL.mainScriptFilePath );

    NGL.WorkerRegistry.activeWorkerCount += 1;

    worker.onmessage = function( event ){

        pending -= 1;
        var postId = event.data.__postId;

        NGL.timeEnd( "NGL.Worker.postMessage " + name + " #" + postId );

        if( onmessageDict[ postId ] ){
            onmessageDict[ postId ].call( worker, event );
        }else{
            // NGL.debug( "No onmessage", postId, name );
        }

        delete onmessageDict[ postId ];
        delete onerrorDict[ postId ];

    };

    worker.onerror = function( event ){

        pending -= 1;
        var postId = event.data.__postId;

        if( onerrorDict[ postId ] ){
            onerrorDict[ postId ].call( worker, event );
        }else{
            NGL.error( "NGL.Worker.onerror", postId, name, event );
        }

        delete onmessageDict[ postId ];
        delete onerrorDict[ postId ];

    };

    // API

    this.name = name;

    this.post = function( aMessage, transferList, onmessage, onerror ){

        onmessageDict[ postCount ] = onmessage;
        onerrorDict[ postCount ] = onerror;

        aMessage = aMessage || {};
        aMessage.__name = name;
        aMessage.__postId = postCount;

        NGL.time( "NGL.Worker.postMessage " + name + " #" + postCount );

        try{
            worker.postMessage.call( worker, aMessage, transferList );
        }catch( error ){
            NGL.error( "NGL.worker.post:", error );
            worker.postMessage.call( worker, aMessage );
        }

        pending += 1;
        postCount += 1;

        return this;

    };

    this.terminate = function(){

        if( worker ){
            worker.terminate();
            NGL.WorkerRegistry.activeWorkerCount -= 1;
        }else{
            console.log( "no worker to terminate" );
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

};

NGL.Worker.prototype.constructor = NGL.Worker;


NGL.WorkerPool = function( name, maxCount ){

    maxCount = Math.min( 8, maxCount || 2 );

    var pool = [];
    var count = 0;

    // API

    this.name = name;

    this.maxCount = maxCount;

    this.post = function( aMessage, transferList, onmessage, onerror ){

        var worker = this.getNextWorker();
        worker.post( aMessage, transferList, onmessage, onerror );

        return this;

    };

    this.terminate = function(){

        pool.forEach( function( worker ){
            worker.terminate();
        } );

    };

    this.getNextWorker = function(){

        var nextWorker;
        var minPending = Infinity;

        for( var i = 0; i < maxCount; ++i ){

            if( i >= count ){

                nextWorker = new NGL.Worker( name );
                pool.push( nextWorker );
                count += 1;
                break;

            }

            var worker = pool[ i ];

            if( worker.pending === 0 ){

                minPending = worker.pending;
                nextWorker = worker;
                break;

            }else if( worker.pending < minPending ){

                minPending = worker.pending;
                nextWorker = worker;

            }

        }

        return nextWorker;

    };

    Object.defineProperties( this, {
        count: {
            get: function(){ return count; }
        }
    } );

};

NGL.WorkerPool.prototype.constructor = NGL.WorkerPool;


if( typeof importScripts === 'function' ){

    self.onmessage = function( e ){

        var name = e.data.__name;
        var postId = e.data.__postId;

        if( name === undefined ){

            NGL.error( "message __name undefined" );

        }else if( NGL.WorkerRegistry.funcDict[ name ] === undefined ){

            NGL.error( "funcDict[ __name ] undefined", name );

        }else{

            var callback = function( aMessage, transferList ){

                aMessage = aMessage || {};
                if( postId !== undefined ) aMessage.__postId = postId;

                try{
                    self.postMessage( aMessage, transferList );
                }catch( error ){
                    NGL.error( "self.postMessage:", error );
                    self.postMessage( aMessage );
                }

            };

            NGL.WorkerRegistry.funcDict[ name ]( e, callback );

        }

    }

}
