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
        nameChanged: new SIGNALS.Signal(),

    };

    this.name = name;
    this.path = path;
    this.dir = path.substring( 0, path.lastIndexOf( '/' ) + 1 );

    try {

        this.fn = new Function(

            'stage', 'panel',
            '__name__', '__path__', '__dir__',

            Object.keys( NGL.makeScriptHelper() ).join( ',' ),

            functionBody

        );

    }catch( e ){

        NGL.error( "NGL.Script compilation failed", e );
        this.fn = null;

    }

}

NGL.Script.prototype = {

    constructor: NGL.Script,

    call: function( stage, onFinish ){

        var scope = this;

        var panel = {

            add: function( element ){

                scope.signals.elementAdded.dispatch( arguments );

            },

            setName: function( value ){

                scope.signals.nameChanged.dispatch( value );

            }

        };

        var queue = new NGL.ScriptQueue( stage, this.dir, onFinish );
        var helper = NGL.makeScriptHelper( stage, queue, panel );

        if( this.fn ){

            var args = [
                stage, panel,
                this.name, this.path, this.dir
            ];

            try{

                var fnList = [];
                Object.keys( helper ).forEach( function( name ){
                    fnList.push( helper[ name ] );
                } );

                this.fn.apply(
                    null, args.concat( fnList )
                );

            }catch( e ){

                NGL.error( "NGL.Script.fn", e );

            }

        }else{

            NGL.log( "NGL.Script.call no function available" );

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

    constructor: NGL.ScriptQueue,

    load: function( file, params ){

        var status = {};

        // TODO check for pdbid or http...
        var path = this.dir + file;

        var _onLoad;
        var p = params || {};

        // allow loadFile( path, onLoad ) method signature
        if( typeof params === "function" ){

            _onLoad = params;
            p = {};

        }else{

            _onLoad = p.onLoad;

        }

        p.onLoad = function( component ){

            component.requestGuiVisibility( false );

            if( typeof _onLoad === "function" ){
                _onLoad( component );
            }

            if( status.resolve ){
                status.resolve();
            }else{
                status.success = true;
            }

        };

        p.onError = function( e ){

            if( status.reject ){
                status.reject( e );
            }else{
                status.error = e || "error";
            }

        };

        this.stage.loadFile( path, p );

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

            NGL.error( "NGL.ScriptQueue.then", e );

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

    //

    function components( name ){

        return stage.getComponentsByName( name );

    }

    function representations( name ){

        return stage.getRepresentationsByName( name );

    }

    function structures( name ){

        return stage.getComponentsByName( name, NGL.StructureComponent );

    }

    //

    function color( value, collection ){

        collection.setColor( value );

    }

    function visibility( value, collection ){

        collection.setVisibility( value );

    }

    function hide( collection ){

        visibility( false, collection );

    }

    function show( collection, only ){

        if( only ) hide();

        visibility( true, collection );

    }

    function superpose( comp1, comp2, align, sele1, sele2, xsele1, xsele2 ){

        comp1.superpose( comp2, align, sele1, sele2, xsele1, xsele2 );

    }

    //

    function uiText( text, newline ){

        var elm = new UI.Text( U( text ) );

        panel.add( elm );

        if( newline ) uiBreak( 1 );

        return elm;

    }

    function uiHtml( html, newline ){

        var elm = new UI.Html( U( html ) );

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

        var btn = new UI.Button( U( label ) ).onClick( function(){
            callback( btn );
        } );

        panel.add( btn );

        return btn;

    }

    function uiSelect( options, callback ){

        if( Array.isArray( options ) ){
            var newOptions = {};
            options.forEach( function( name ){
                newOptions[ name ] = name;
            } );
            options = newOptions;
        }

        var select = new UI.Select()
            .setOptions( options )
            .onChange( function(){
                callback( select );
            } );

        panel.add( select );

        return select;

    }

    function uiOpenButton( label, callback, extensionList ){

        var btn = new UI.Button( U( label ) ).onClick( function(){

            NGL.open( callback, extensionList );

        } );

        panel.add( btn );

        return btn;

    }

    function uiDownloadButton( label, callback, downloadName ){

        var btn = new UI.Button( U( label ) ).onClick( function(){

            NGL.download( callback(), downloadName );

        } );

        panel.add( btn );

        return btn;

    }

    function uiToggleButton( labelA, labelB, callbackA, callbackB ){

        var flag = true;

        var btn = new UI.Button( U( labelB ) ).onClick( function(){

            if( flag ){

                flag = false;
                btn.setLabel( U( labelA ) );
                callbackB();

            }else{

                flag = true;
                btn.setLabel( U( labelB ) );
                callbackA();

            }

        } );

        panel.add( btn );

        return btn;

    }

    function uiVisibilitySelect( collection ){

        var list = collection.list;

        function getVisible(){

            var nameList = [];

            list.forEach( function( o ){

                if( o.visible ) nameList.push( o.name );

            } );

            return nameList;

        }

        var options = { "": "[show]" };

        list.forEach( function( o ){

            options[ o.name ] = o.name;

            o.signals.visibilityChanged.add( function(){

                var nameList = getVisible();

                if( nameList.length === list.length ){
                    select.setValue( "" );
                }else if( o.visible ){
                    select.setValue( o.name );
                }else{
                    select.setValue( nameList[ 0 ] );
                }

            } );

        } );

        var select = new UI.Select()
            .setOptions( options )
            .onChange( function(){

                var name = select.getValue();

                if( name === "" ){
                    show( collection );
                }else{
                    hide( collection );
                    show( stage.getAnythingByName( name ) );
                }

            } );

        panel.add( select );

        return select;

    }

    function uiVisibilityButton( label, collection ){

        label = U( label ? label : "all" );
        collection = collection || new NGL.Collection();

        var list = collection.list;

        function isVisible(){

            var visible = false;

            list.forEach( function( o ){

                if( o.visible ) visible = true;

            } );

            return visible;

        }

        function getLabel( value ){

            return ( isVisible() ? "hide " : "show " ) + label;

        }

        list.forEach( function( o ){

            o.signals.visibilityChanged.add( function(){

                btn.setLabel( getLabel() );

            } );

        } );

        var btn = new UI.Button( getLabel() ).onClick( function(){

            visibility( !isVisible(), collection );

        } );

        panel.add( btn );

        return btn;

    }

    function uiPlayButton( label, trajComp, step, timeout, start, end ){

        var traj = trajComp.trajectory;
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

        'components': components,
        'representations': representations,
        'structures': structures,

        'color': color,
        'visibility': visibility,
        'hide': hide,
        'show': show,
        'superpose': superpose,

        'uiText': uiText,
        'uiHtml': uiHtml,
        'uiBreak': uiBreak,
        'uiSelect': uiSelect,
        'uiButton': uiButton,
        'uiOpenButton': uiOpenButton,
        'uiDownloadButton': uiDownloadButton,
        'uiToggleButton': uiToggleButton,
        'uiVisibilitySelect': uiVisibilitySelect,
        'uiVisibilityButton': uiVisibilityButton,
        'uiPlayButton': uiPlayButton,

    };

};
