/**
 * @file Core
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////
// NGL

var NGL = {

    REVISION: '0.6dev',
    EPS: 0.0000001,
    disableImpostor: false,
    useWorker: true,
    indexUint16: false,
    debug: false,
    develop: (
        self.location.pathname.indexOf( "core.js" ) !== -1 ||
        self.location.pathname.indexOf( "dev.html" ) !== -1
    ),
    mainScriptFilePath: "../js/build/ngl.full.min.js",
    cssDirectory: "../css/",
    assetsDirectory: "../"

};


// set default log handlers
NGL.log = Function.prototype.bind.call( console.log, console );
NGL.info = Function.prototype.bind.call( console.info, console );
NGL.warn = Function.prototype.bind.call( console.warn, console );
NGL.error = Function.prototype.bind.call( console.error, console );
NGL.time = Function.prototype.bind.call( console.time, console );
NGL.timeEnd = Function.prototype.bind.call( console.timeEnd, console );


NGL.LeftMouseButton = 1;
NGL.MiddleMouseButton = 2;
NGL.RightMouseButton = 3;


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

    if( NGL.develop ){

        importScripts(

            "../three/three.js",
            "../three/Detector.js",
            "../three/TypedArrayUtils.js",
            "../three/controls/TrackballControls.js",
            "../three/loaders/OBJLoader.js",
            "../three/loaders/PLYLoader.js",

            "../lib/async.js",
            "../lib/promise.min.js",
            "../lib/sprintf.min.js",
            "../lib/jszip.min.js",
            "../lib/pako.min.js",
            "../lib/lzma.min.js",
            "../lib/bzip2.min.js",
            "../lib/chroma.min.js",
            "../lib/svd.js",
            "../lib/signals.min.js",

            "../ngl/shims.js",
            // "../ngl/core.js",
            "../ngl/utils.js",
            "../ngl/symmetry.js",
            "../ngl/alignment.js",
            "../ngl/geometry.js",
            "../ngl/selection.js",
            "../ngl/superposition.js",
            "../ngl/structure.js",
            "../ngl/trajectory.js",
            "../ngl/surface.js",
            "../ngl/script.js",
            "../ngl/streamer.js",
            "../ngl/parser.js",
            "../ngl/writer.js",
            "../ngl/loader.js",
            "../ngl/viewer.js",
            "../ngl/buffer.js",
            "../ngl/representation.js",
            "../ngl/stage.js"

        );

    }

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


// Registry

NGL.PluginRegistry = {

    dict: {},

    add: function( name, path ){
        this.dict[ name ] = path;
    },

    get: function( name ){
        if( name in this.dict ){
            return this.dict[ name ];
        }else{
            throw "NGL.PluginRegistry '" + name + "' not defined";
        }
    },

    get names(){
        return Object.keys( this.dict );
    },

    get count(){
        return this.names.length;
    },

    load: function( name, stage ){
        var path = this.get( name );
        stage.loadFile( path, { name: name + " plugin" } );
    }

};


NGL.ExampleRegistry = {

    dict: {},

    add: function( name, fn ){
        this.dict[ name ] = fn;
    },

    addDict: function( dict ){
        Object.keys( dict ).forEach( function( name ){
            this.add( name, dict[ name ] );
        }.bind( this ) );
    },

    get: function( name ){
        return this.dict[ name ];
    },

    get names(){
        return Object.keys( this.dict );
    },

    get count(){
        return this.names.length;
    },

    load: function( name, stage ){
        var fn = this.get( name );
        if( typeof fn === "function" ){
            fn( stage );
        }else{
            NGL.warn( "NGL.ExampleRegistry.load not available:", name );
        }
    }

};
