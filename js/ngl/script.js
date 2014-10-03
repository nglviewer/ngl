/**
 * @file Script
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////
// Script

NGL.Script = function( str, name, path ){

    var SIGNALS = signals;

    this.signals = {

        elementAdded: new SIGNALS.Signal(),

    };

    this.name = name;
    this.path = path;
    this.dir = path.substring( 0, path.lastIndexOf( '/' ) + 1 );

    try {

        this.fn = new Function(
            'stage', 'component', 'load', 'then', 'panel',
            '__name__', '__path__', '__dir__',
            str
        );

    }catch( e ){

        console.error( "NGL.Script compilation failed", e );
        this.fn = null;

    }

}

NGL.Script.prototype = {

    call: function( stage, component, onFinish ){

        var scope = this;

        var panel = {

            add: function( element ){

                scope.signals.elementAdded.dispatch( arguments );

            }

        };

        var queue = new NGL.ScriptQueue( stage, this.dir, onFinish );

        if( this.fn ){

            var loadFn = queue.load.bind( queue );
            var thenFn = queue.then.bind( queue );

            try{

                this.fn(
                    stage, component, loadFn, thenFn, panel,
                    this.name, this.path, this.dir
                );

            }catch( e ){

                console.error( "NGL.Script.fn", e );

            }

        }else{

            console.log( "NGL.Script.call no function available" );

        }

        function finish(){
            if( typeof onFinish === "function" ) onFinish();
        }

        function error(){
            panel.add( new UI.Text( "ERROR" ) );
            finish();
        }

        queue.then( finish, error );

    }

}


NGL.ScriptQueue = function( stage, dir, onFinish ){

    this.stage = stage;
    this.dir = dir || "";
    this.onFinish = onFinish;

    this.promise = new Promise( function( resolve, reject ){

        resolve();

    } );

};

NGL.ScriptQueue.prototype = {

    load: function( file, callback, params ){

        var status = {};

        // TODO check for pdbid or http...
        var path = this.dir + file;

        this.stage.loadFile(

            path,

            function( component ){

                callback( component );

                if( status.resolve ){
                    status.resolve();
                }else{
                    status.success = true;
                }

            },

            params,

            function( e ){

                if( status.reject ){
                    status.reject( e );
                }else{
                    status.error = e || "error";
                }

            }

        );

        var handle = function( resolve, reject ){

            if( status.success === true ){
                resolve();
            }else if( status.error !== undefined ){
                reject( status.error );
            }else{
                status.resolve = resolve;
                status.reject = reject;
            }

        };

        this.promise = this.promise.then( function(){

            return new Promise( handle );

        } );

    },

    then: function( callback, onError ){

        this.promise = this.promise.then( callback, function( e ){

            console.error( "NGL.ScriptQueue.then", e );

            if( typeof onError === "function" ) onError();

        } );

    }

};
