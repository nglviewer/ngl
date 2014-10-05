/**
 * @file Script
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////
// Script

NGL.Script = function( functionBody, name, path ){

    var SIGNALS = signals;

    this.signals = {

        elementAdded: new SIGNALS.Signal(),

    };

    this.name = name;
    this.path = path;
    this.dir = path.substring( 0, path.lastIndexOf( '/' ) + 1 );

    try {

        this.fn = new Function(

            'stage', 'script', 'panel',
            '__name__', '__path__', '__dir__',

            Object.keys( NGL.makeScriptHelper() ).join( ',' ),

            functionBody

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
        var helper = NGL.makeScriptHelper( stage, queue, panel );

        if( this.fn ){

            var args = [
                stage, component, panel,
                this.name, this.path, this.dir
            ];

            try{

                this.fn.apply(
                    null, args.concat( Object.values( helper ) )
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


NGL.makeScriptHelper = function( stage, queue, panel ){

    var U = NGL.unicodeHelper;

    //

    function load(){

        queue.load.apply( queue, arguments );

    }


    function then(){

        queue.then.apply( queue, arguments );

    }

    // TODO
    // get, color, radius, center
    // alias, to create some sort of variables?

    function test( what, repr, comp ){

        what = what || {};

        if( what[ "repr" ] &&
            (
                (
                    Array.isArray( what[ "repr" ] ) &&
                    what[ "repr" ].indexOf( repr.name ) === -1
                )
                ||
                (
                    !Array.isArray( what[ "repr" ] ) &&
                    what[ "repr" ] !== repr.name
                )
            )
        ){
            return false;
        }

        if( what[ "comp" ] && what[ "comp" ] !== comp.name ){
            return false;
        }

        return true;

    }


    function visibility( what, value ){

        if( what ){

            stage.eachRepresentation( function( repr, comp ){

                if( test( what, repr, comp ) ){
                    repr.setVisibility( value );
                }

            } );

        }else{

            stage.eachComponent( function( comp ){

                comp.setVisibility( value );

            } );

        }

    }


    function hide( what ){

        visibility( what, false );

    }


    function show( what, only ){

        if( only ) hide();

        visibility( what, true );

    }

    //

    function uiText( text, newline ){

        var elm = new UI.Text( U( text ) );

        panel.add( elm );

        if( newline ) uiBreak( 1 );

        return elm;

    }


    function uiBreak( n ){

        n = n === undefined ? 1 : n;

        for( var i = 0; i < n; ++i ){

            panel.add( new UI.Break() );

        }

    }


    function uiButton( label, callback ){

        var btn = new UI.Button( U( label ) ).onClick( callback );

        panel.add( btn );

        return btn;

    }


    function uiVisibilityButton( label, objList ){

        var forEach;

        if( objList ){

            if( !Array.isArray( objList ) ){
                objList = [ objList ];
            }

            forEach = function( callback ){
                objList.forEach( callback );
            };

        }else{

            label = label || "all";

            forEach = function( callback ){
                stage.eachComponent( callback, NGL.StructureComponent );
            };

        }

        label = U( label );

        function isVisible(){
            var visible = false;
            forEach( function( obj ){
                if( obj.visible ){
                    visible = true;
                }
            } );
            return visible;
        }

        function setVisibility( value ){
            forEach( function( obj ){
                obj.setVisibility( value )
            } );
        }

        function getLabel( value ){
            return ( isVisible() ? "hide " : "show " ) + label;
        }

        var btn = new UI.Button( getLabel() )
            .onClick( function(){
                setVisibility( !isVisible() );
            } )

        forEach( function( obj ){
            obj.signals.visibilityChanged.add( function( value ){
                btn.setLabel( getLabel() );
            } );
        } );

        panel.add( btn );

        return btn;

    }


    function uiPlayButton( label, traj, step, timeout, start, end ){

        label = U( label );

        var player = new NGL.TrajectoryPlayer( traj, step, timeout, start, end );
        player.mode = "once";

        var btn = new UI.Button( "play " + label )
            .onClick( function(){
                player.toggle();
            } );

        player.signals.startedRunning.add( function(){
            btn.setLabel( "pause " + label );
        } );

        player.signals.haltedRunning.add( function(){
            btn.setLabel( "play " + label );
        } );

        panel.add( btn );

        return btn;

    }

    //

    return {

        'load': load,
        'then': then,

        'visibility': visibility,
        'hide': hide,
        'show': show,

        'uiText': uiText,
        'uiBreak': uiBreak,
        'uiButton': uiButton,
        'uiVisibilityButton': uiVisibilityButton,
        'uiPlayButton': uiPlayButton,

    };

};
