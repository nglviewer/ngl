/**
 * @file Stage
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


//////////
// Stage

NGL.Stage = function( eid ){

    var SIGNALS = signals;

    this.signals = {

        themeChanged: new SIGNALS.Signal(),

        componentAdded: new SIGNALS.Signal(),
        componentRemoved: new SIGNALS.Signal(),

        atomPicked: new SIGNALS.Signal(),

        windowResize: new SIGNALS.Signal()

    };

    this.compList = [];

    this.preferences =  new NGL.Preferences( this );

    this.viewer = new NGL.Viewer( eid );

    this.preferences.setTheme();

    this.initFileDragDrop();

    this.viewer.animate();

    this.pickingControls = new NGL.PickingControls( this.viewer, this );

}

NGL.Stage.prototype = {

    defaultFileRepresentation: function( object ){

        if( object instanceof NGL.StructureComponent ){

            object.addRepresentation( "cartoon", { sele: "*" } );
            object.addRepresentation( "licorice", { sele: "hetero" } );
            object.centerView( undefined, true );

        }else if( object instanceof NGL.SurfaceComponent ){

            object.addRepresentation();
            object.centerView();

        }else if( object instanceof NGL.ScriptComponent ){

            object.run();

        }

    },

    initFileDragDrop: function(){

        this.viewer.container.addEventListener( 'dragover', function( e ){

            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';

        }, false );

        this.viewer.container.addEventListener( 'drop', function( e ){

            e.stopPropagation();
            e.preventDefault();

            var fileList = e.dataTransfer.files;
            var n = fileList.length;

            for( var i=0; i<n; ++i ){

                this.loadFile( fileList[ i ] );

            }

        }.bind( this ), false );

    },

    loadFile: function( path, onLoad, params, onError ){

        var component;
        var scope = this;

        function load( object ){

            // check for placeholder component
            if( component ){

                scope.removeComponent( component );

            }

            if( object instanceof NGL.Structure ){

                component = new NGL.StructureComponent( scope, object, params );

            }else if( object instanceof NGL.Surface ){

                component = new NGL.SurfaceComponent( scope, object, params );

            }else if( object instanceof NGL.Script ){

                component = new NGL.ScriptComponent( scope, object, params );

            }else{

                console.warn( "NGL.Stage.loadFile: object type unknown", object );
                return;

            }

            scope.addComponent( component );

            if( typeof onLoad === "function" ){

                onLoad( component );

            }else{

                scope.defaultFileRepresentation( component );

            }

        }

        var _e;

        function error( e ){

            _e = e;

            if( component ) component.setStatus( e );

            if( typeof onError === "function" ) onError( e );

        }

        NGL.autoLoad( path, load, undefined, error );

        // ensure that component isn't ready yet
        if( !component ){

            component = new NGL.Component( this, params );
            var path2 = ( path instanceof File ) ? path.name : path;
            component.name = path2.replace( /^.*[\\\/]/, '' );

            this.addComponent( component );

        }

        // set error status when already known
        if( _e ) component.setStatus( _e );

    },

    addComponent: function( component ){

        if( !component ){

            console.warn( "NGL.Stage.addComponent: no component given" );
            return;

        }

        this.compList.push( component );

        this.signals.componentAdded.dispatch( component );

    },

    removeComponent: function( component ){

        var idx = this.compList.indexOf( component );

        if( idx !== -1 ){

            this.compList.splice( idx, 1 );

        }

        component.dispose();

        this.signals.componentRemoved.dispatch( component );

    },

    centerView: function(){

        this.viewer.centerView( undefined, true );

    },

    setTheme: function( value ){

        var cssPath, viewerBackground;

        if( value === "light" ){
            cssPath = "../css/light.css";
            viewerBackground = "white";
        }else{
            cssPath = "../css/dark.css";
            viewerBackground = "black";
        }

        document.getElementById( 'theme' ).href = cssPath;
        this.viewer.setBackground( viewerBackground );

    },

    eachComponent: function( callback, type ){

        this.compList.forEach( function( o, i ){

            if( !type || o instanceof type ){

                callback( o, i );

            }

        } );

    },

    eachRepresentation: function( callback, componentType ){

        this.eachComponent( function( o ){

            o.reprList.forEach( function( repr ){

                callback( repr, o );

            } );

        }, componentType );

    }

}


////////////
// Picking

NGL.PickingControls = function( viewer, stage ){

    var gl = viewer.renderer.getContext();
    var pixelBuffer = new Uint8Array( 4 );

    var mouse = {

        position: new THREE.Vector2(),
        down: new THREE.Vector2(),
        moving: false,
        distance: function(){
            return mouse.position.distanceTo( mouse.down );
        }

    };

    viewer.renderer.domElement.addEventListener( 'mousemove', function( e ){

        mouse.moving = true;
        mouse.position.x = e.layerX;
        mouse.position.y = e.layerY;

    } );

    viewer.renderer.domElement.addEventListener( 'mousedown', function( e ){

        mouse.moving = false;
        mouse.down.x = e.layerX;
        mouse.down.y = e.layerY;

    } );

    viewer.renderer.domElement.addEventListener( 'mouseup', function( e ){

        if( mouse.distance() > 3 || e.which === NGL.RightMouseButton ) return;

        viewer.render( null, true );

        var box = viewer.renderer.domElement.getBoundingClientRect();

        var offsetX = e.clientX - box.left;
        var offsetY = e.clientY - box.top;

        gl.readPixels(
            offsetX * window.devicePixelRatio,
            (box.height - offsetY) * window.devicePixelRatio,
            1, 1,
            gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer
        );

        var rgba = Array.apply( [], pixelBuffer );

        var id =
            ( pixelBuffer[0] << 16 ) |
            ( pixelBuffer[1] << 8 ) |
            ( pixelBuffer[2] );

        // TODO early exit, binary search
        var pickedAtom = undefined;
        stage.eachComponent( function( o ){

            o.structure.eachAtom( function( a ){

                if( a.globalindex === ( id - 1 ) ){
                    pickedAtom = a;
                }

            } );

        }, NGL.StructureComponent );

        stage.signals.atomPicked.dispatch( pickedAtom );

        if( NGL.GET( "debug" ) ){

            console.log(
                "picked color",
                [
                    ( rgba[0]/255 ).toPrecision(2),
                    ( rgba[1]/255 ).toPrecision(2),
                    ( rgba[2]/255 ).toPrecision(2),
                    ( rgba[3]/255 ).toPrecision(2)
                ]
            );
            console.log( "picked id", id );
            console.log(
                "picked position",
                offsetX, box.height - offsetY
            );
            console.log( "devicePixelRatio", window.devicePixelRatio );

        }else{

            viewer.requestRender();

        }

        if( pickedAtom && e.which === NGL.MiddleMouseButton ){

            viewer.centerView( pickedAtom );

        }

    } );

};


////////////////
// Preferences

NGL.Preferences = function( stage, id ){

    this.id = id || "ngl-stage";

    this.stage = stage;

    this.storage = {

        impostor: true,
        quality: "medium",
        theme: "dark",

    };

    if ( window.localStorage[ this.id ] === undefined ) {

        window.localStorage[ this.id ] = JSON.stringify( this.storage );

    } else {

        var data = JSON.parse( window.localStorage[ this.id ] );

        for ( var key in data ) {

            this.storage[ key ] = data[ key ];

        }

    }

};

NGL.Preferences.prototype = {

    setImpostor: function( value ) {

        if( value !== undefined ){
            this.setKey( "impostor", value );
        }else{
            value = this.getKey( "impostor" );
        }

        var types = [
            "spacefill", "ball+stick", "licorice", "hyperball", "backbone"
        ];

        this.stage.eachRepresentation( function( repr ){

            if( types.indexOf( repr.type ) === -1 ){
                return;
            }

            var p = repr.getParameters();
            p.disableImpostor = !value;
            repr.rebuild( p );

        }, NGL.StructureComponent );

    },

    setQuality: function( value ) {

        if( value !== undefined ){
            this.setKey( "quality", value );
        }else{
            value = this.getKey( "quality" );
        }

        var types = [
            "tube", "cartoon", "ribbon", "trace"
        ];

        var impostorTypes = [
            "spacefill", "ball+stick", "licorice", "hyperball", "backbone"
        ];

        this.stage.eachRepresentation( function( repr ){

            var p = repr.getParameters();

            if( types.indexOf( repr.type ) === -1 ){

                if( impostorTypes.indexOf( repr.type ) === -1 ){
                    return;
                }

                if( NGL.extensionFragDepth && !p.disableImpostor ){
                    repr.quality = value;
                    return;
                }

            }

            p.quality = value;
            repr.rebuild( p );

        }, NGL.StructureComponent );

    },

    setTheme: function( value ) {

        if( value !== undefined ){
            this.setKey( "theme", value );
        }else{
            value = this.getKey( "theme" );
        }

        this.stage.setTheme( value );

    },

    getKey: function( key ){

        return this.storage[ key ];

    },

    setKey: function( key, value ){

        this.storage[ key ] = value;

        window.localStorage[ this.id ] = JSON.stringify( this.storage );

    },

    clear: function(){

        delete window.localStorage[ this.id ];

    }

};


//////////////
// Component

NGL.Component = function( stage, params ){

    params = params || {};

    if( params.name !== undefined ){
        this.name = params.name;
    }
    this.id = params.id;
    this.tags = params.tags || [];
    this.visible = params.visible !== undefined ? params.visible : true;

    this.signals = NGL.makeObjectSignals( this );

    this.stage = stage;
    this.viewer = stage.viewer;

    this.reprList = [];

}

NGL.Component.prototype = {

    type: "component",

    signals: {

        representationAdded: null,
        representationRemoved: null,
        visibilityChanged: null,
        requestGuiVisibility: null,

        statusChanged: null,

    },

    addRepresentation: function( repr ){

        this.reprList.push( repr );

        this.signals.representationAdded.dispatch( repr );

        return this;

    },

    removeRepresentation: function( repr ){

        var idx = this.reprList.indexOf( repr );

        if( idx !== -1 ){

            this.reprList.splice( idx, 1 );

        }

        this.signals.representationRemoved.dispatch( repr );

        repr.dispose();

    },

    updateRepresentations: function( what ){

        this.reprList.forEach( function( repr ){

            repr.update( what );

        } );

        this.stage.viewer.requestRender();

    },

    dispose: function(){

        // copy via .slice because side effects may change reprList
        this.reprList.slice().forEach( function( repr ){

            repr.dispose();

        } );

        delete this.reprList;

    },

    setVisibility: function( value ){

        this.visible = value;

        this.eachRepresentation( function( repr ){

            repr.updateVisibility();

        } );

        this.signals.visibilityChanged.dispatch( value );

        return this;

    },

    setStatus: function( value ){

        this.status = value;
        this.signals.statusChanged.dispatch( value );

        return this;

    },

    getCenter: function(){

        // console.warn( "not implemented" )

    },

    requestGuiVisibility: function( value ){

        this.signals.requestGuiVisibility.dispatch( value );

        return this;

    },

    eachRepresentation: function( callback ){

        this.reprList.forEach( callback );

    }

};

NGL.ObjectMetadata.prototype.apply( NGL.Component.prototype );


NGL.StructureComponent = function( stage, structure, params ){

    params = params || {};

    this.__structure = structure;
    this.structure = structure;
    this.name = structure.name;  // may get overwritten by params.name

    NGL.Component.call( this, stage, params );

    this.trajList = [];
    this.initSelection( params.sele );

};

NGL.StructureComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    type: "structure",

    signals: Object.assign( {

        "trajectoryAdded": null,
        "trajectoryRemoved": null

    }, NGL.Component.prototype.signals ),

    initSelection: function( string ){

        this.selection = new NGL.Selection( string );

        this.selection.signals.stringChanged.add( function( string ){

            this.applySelection();

            this.rebuildRepresentations( true );
            this.rebuildTrajectories();

        }, this );

        this.applySelection();

    },

    applySelection: function(){

        if( this.selection.string ){

            this.structure = new NGL.StructureSubset(
                this.__structure, this.selection.string
            );

        }else{

            this.structure = this.__structure;

        }

    },

    setSelection: function( string ){

        this.selection.setString( string );

        return this;

    },

    rebuildRepresentations: function( setStructure ){

        this.reprList.forEach( function( repr ){

            if( setStructure ){
                repr.setStructure( this.structure );
            }

            repr.rebuild( repr.getParameters() );

        }, this );

    },

    rebuildTrajectories: function(){

        var scope = this;

        scope.trajList.slice( 0 ).forEach( function( traj ){

            // TODO should use traj.rebuild when available
            scope.addTrajectory( traj.trajPath, traj._sele, traj.currentFrame );
            scope.removeTrajectory( traj );

        } );

    },

    addRepresentation: function( type, params, returnRepr ){

        var pref = this.stage.preferences;
        params = params || {};
        params.quality = params.quality || pref.getKey( "quality" );
        params.disableImpostor = params.disableImpostor !== undefined ? params.disableImpostor : !pref.getKey( "impostor" );

        var repr = NGL.makeRepresentation(
            type, this.structure, this.viewer, params
        );

        var reprComp = new NGL.RepresentationComponent(
            this.stage, repr, {}, this
        );

        NGL.Component.prototype.addRepresentation.call( this, reprComp );

        return returnRepr ? reprComp : this;

    },

    addTrajectory: function( trajPath, sele, i ){

        var traj = new NGL.Trajectory( trajPath, this.structure, sele );

        traj.setFrame( i );

        traj.signals.frameChanged.add( function( value ){

            this.updateRepresentations( { "position": true } );

        }, this );

        this.trajList.push( traj );

        this.signals.trajectoryAdded.dispatch( traj );

        return traj;

    },

    removeTrajectory: function( traj ){

        var idx = this.trajList.indexOf( traj );

        if( idx !== -1 ){

            this.trajList.splice( idx, 1 );

        }

        traj.dispose();

        this.signals.trajectoryRemoved.dispatch( traj );

    },

    dispose: function(){

        NGL.Component.prototype.dispose.call( this );

        // copy via .slice because side effects may change trajList
        this.trajList.slice().forEach( function( traj ){

            traj.dispose();

        } );

        this.trajList = [];

    },

    centerView: function( sele, zoom ){

        var center;

        if( sele ){

            var selection = new NGL.Selection( sele );

            center = this.structure.atomCenter( selection );

            if( zoom ){
                var bb = this.structure.getBoundingBox( selection );
                zoom = bb.size().length();
            }

        }else{

            center = this.structure.center;

            if( zoom ){
                zoom = this.structure.boundingBox.size().length();
            }

        }

        this.viewer.centerView( center, zoom );

        return this;

    },

    getCenter: function(){

        return this.structure.center;

    },

    superpose: function( component, align, sele1, sele2, xsele1, xsele2 ){

        NGL.superpose(
            this.structure,
            component.structure,
            align,
            sele1,
            sele2,
            xsele1,
            xsele2
        );

        this.updateRepresentations( { "position": true } );

        return this;

    }

} );


NGL.SurfaceComponent = function( stage, surface, params ){

    this.surface = surface;
    this.name = surface.name;

    NGL.Component.call( this, stage, params );

};

NGL.SurfaceComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    type: "surface",

    addRepresentation: function( type, params ){

        var repr = new NGL.SurfaceRepresentation(
            this.surface, this.stage.viewer, params
        );

        return NGL.Component.prototype.addRepresentation.call( this, repr );

    },

    centerView: function(){

        this.viewer.centerView();

    },

} );


NGL.ScriptComponent = function( stage, script, params ){

    this.script = script;
    this.name = script.name;

    this.status = "loaded";

    NGL.Component.call( this, stage, params );

    this.script.signals.nameChanged.add( function( value ){

        this.setName( value );

    }, this );

};

NGL.ScriptComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    type: "script",

    addRepresentation: function( type ){},

    removeRepresentation: function( repr ){},

    run: function(){

        var scope = this;

        this.setStatus( "running" );

        this.script.call( this.stage, function(){

            scope.setStatus( "finished" );

        } );

        this.setStatus( "called" );

    },

    dispose: function(){

        // TODO

    },

    setVisibility: function( value ){},

    getCenter: function(){}

} );


NGL.RepresentationComponent = function( stage, repr, params, parent ){

    this.name = repr.type;
    this.parent = parent;

    NGL.Component.call( this, stage, params );

    this.setRepresentation( repr );

};

NGL.RepresentationComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    type: "representation",

    signals: {

        // TODO not all generally applicable, move downstream
        visibilityChanged: null,
        colorChanged: null,
        radiusChanged: null,
        scaleChanged: null,
        parametersChanged: null,

    },

    setRepresentation: function( repr ){

        if( this.repr ){
            this.repr.dispose();
        }

        this.repr = repr;
        this.name = repr.type;

        this.updateVisibility();

    },

    addRepresentation: function( type ){},

    removeRepresentation: function( repr ){},

    dispose: function(){

        if( this.parent ){

            this.parent.removeRepresentation( this );

        }

        this.repr.dispose();

    },

    setVisibility: function( value ){

        this.visible = value;
        this.updateVisibility();
        this.signals.visibilityChanged.dispatch( this.visible );

        return this;

    },

    updateVisibility: function(){

        if( this.parent ){

            this.repr.setVisibility( this.parent.visible && this.visible );

        }else{

            this.repr.setVisibility( this.visible );

        }

    },

    update: function( what ){

        this.repr.update( what );

        return this;

    },

    setParameters: function( params ){

        this.repr.setParameters( params );
        this.signals.parametersChanged.dispatch();

        return this;

    },

    getParameters: function(){

        return this.repr.getParameters();

    },

    setRadius: function( type, scale ){

        this.repr.setRadius( type, scale );
        this.signals.radiusChanged.dispatch( this.repr.radius );
        this.signals.scaleChanged.dispatch( this.repr.scale );

        return this;

    },

    setScale: function( scale ){

        this.repr.setScale( scale );
        this.signals.scaleChanged.dispatch( this.repr.scale );

        return this;

    },

    setColor: function( value ){

        this.repr.setColor( value );
        this.signals.colorChanged.dispatch( this.repr.color );

        return this;

    },

    getCenter: function(){}

} );
