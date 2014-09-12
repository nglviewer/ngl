/**
 * @file Script
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////
// Script

NGL.Script = function( str, name, path ){

    this.name = name;
    this.path = path;
    this.dir = path.substring( 0, path.lastIndexOf( '/' ) + 1 );

    try {

        this.fn = new Function(
            'stage', 'load', 'then',
            '__name__', '__path__', '__dir__',
            str
        );

    }catch( e ){

        console.error( "NGL.Script compilation failed", e );
        this.fn = null;

    }

}

NGL.Script.prototype = {

    call: function( stage, onFinish ){

        var queue = new NGL.ScriptQueue( stage, this.dir, onFinish );

        if( this.fn ){

            var loadFn = queue.load.bind( queue );
            var thenFn = queue.then.bind( queue );

            this.fn( stage, loadFn, thenFn, this.name, this.path, this.dir );

        }else{

            console.log( "NGL.Script.call no function available" );

        }

        queue.then( function(){

            if( typeof onFinish === "function" ){

                onFinish();

            }

        } );

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

    load: function( file, callback ){

        var status;

        // TODO check for pdbid or http...
        var path = this.dir + file;

        this.stage.loadFile( path, function( component ){

            callback( component );

            if( typeof status === "function" ){

                status();

            }else{

                status = true;

            }

        } );

        var handle = function( resolve, reject ){

            if( status === true ){

                resolve();

            }else{

                status = function(){

                    resolve();

                };

            }

        };

        this.promise = this.promise.then( function(){

            return new Promise( handle );

        } );

    },

    then: function( callback ){

        this.promise = this.promise.then( callback );

    }

};
