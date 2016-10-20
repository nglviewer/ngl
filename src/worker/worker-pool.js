/**
 * @file Worker Pool
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Worker from "./worker.js";


function WorkerPool( name, maxCount ){

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

                nextWorker = new Worker( name );
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

}

WorkerPool.prototype.constructor = WorkerPool;


export default WorkerPool;
