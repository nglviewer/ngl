/**
 * @file Stage
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


//////////
// Stage

NGL.Stage = function( eid, params ){

    var p = Object.assign( {}, params );
    var preferencesId = p.preferencesId || "ngl-stage";

    this.parameters = NGL.deepCopy( NGL.Stage.prototype.parameters );
    this.preferences = new NGL.Preferences( preferencesId, p );

    for( var name in this.parameters ){
        p[ name ] = this.preferences.getKey( name );
        if( p.overwritePreferences && params[ name ] !== undefined ){
            p[ name ] = params[ name ];
        }
    }

    //

    var SIGNALS = signals;

    this.signals = {

        themeChanged: new SIGNALS.Signal(),

        componentAdded: new SIGNALS.Signal(),
        componentRemoved: new SIGNALS.Signal(),

        atomPicked: new SIGNALS.Signal(),
        bondPicked: new SIGNALS.Signal(),
        volumePicked: new SIGNALS.Signal(),
        nothingPicked: new SIGNALS.Signal(),
        onPicking: new SIGNALS.Signal()

    };

    //

    this.tasks = new NGL.Counter();
    this.compList = [];
    this.defaultFileParams = {};

    //

    this.viewer = new NGL.Viewer( eid );
    this.setParameters( p );
    this.initFileDragDrop();
    this.viewer.animate();
    this.pickingControls = new NGL.PickingControls( this.viewer, this );

};

NGL.Stage.prototype = {

    constructor: NGL.Stage,

    parameters: {

        theme: {
            type: "select", options: { "light": "light", "dark": "dark" }
        },
        quality: {
            type: "select", options: { "low": "low", "medium": "medium", "high": "high" }
        },
        impostor: {
            type: "boolean"
        },
        overview: {
            type: "boolean"
        },
        rotateSpeed: {
            type: "number", precision: 1, max: 10, min: 0
        },
        zoomSpeed: {
            type: "number", precision: 1, max: 10, min: 0
        },
        panSpeed: {
            type: "number", precision: 1, max: 10, min: 0
        },
        clipNear: {
            type: "range", step: 1, max: 100, min: 0
        },
        clipFar: {
            type: "range", step: 1, max: 100, min: 0
        },
        clipDist: {
            type: "range", step: 1, max: 100, min: 0
        },
        fogNear: {
            type: "range", step: 1, max: 100, min: 0
        },
        fogFar: {
            type: "range", step: 1, max: 100, min: 0
        },

    },

    setParameters: function( params ){

        var p = Object.assign( {}, params );
        var viewer = this.viewer;
        var controls = viewer.controls;

        for( var name in p ){
            if( p[ name ] !== undefined && this.parameters[ name ] ){
                this.parameters[ name ].value = p[ name ];
            }
        }

        // apply parameters
        if( p.theme !== undefined ) this.setTheme( p.theme );
        if( p.quality !== undefined ) this.setQuality( p.quality );
        if( p.impostor !== undefined ) this.setImpostor( p.impostor );
        if( p.rotateSpeed !== undefined ) controls.rotateSpeed = p.rotateSpeed;
        if( p.zoomSpeed !== undefined ) controls.zoomSpeed = p.zoomSpeed;
        if( p.panSpeed !== undefined ) controls.panSpeed = p.panSpeed;

    },

    getParameters: function(){

        var params = {};
        for( var name in this.parameters ){
            params[ name ] = this.parameters[ name ].value;
        }
        return params;

    },

    defaultFileRepresentation: function( object ){

        if( object instanceof NGL.StructureComponent ){

            if( object.structure.atomCount > 100000 ){

                object.addRepresentation( "line" );
                object.centerView( true );

            }else{

                object.addRepresentation( "cartoon", { sele: "*" } );
                object.addRepresentation( "licorice", { sele: "hetero" } );
                object.centerView( true );

            }

            // add frames as trajectory
            if( object.structure.frames.length ) object.addTrajectory();

        }else if( object instanceof NGL.SurfaceComponent ){

            object.addRepresentation( "surface" );
            object.centerView();

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

                // TODO loading params (e.g. set in GUI)
                this.loadFile( fileList[ i ] );

            }

        }.bind( this ), false );

    },

    loadFile: function( path, params ){

        var p = Object.assign( {}, this.defaultFileParams, params );

        // placeholder component
        var component = new NGL.Component( this, p );
        component.name = NGL.getFileInfo( path ).name;
        this.addComponent( component );

        var onLoadFn = function( object ){

            // remove placeholder component
            this.removeComponent( component );

            component = this.addComponentFromObject( object, p );

            if( component instanceof NGL.ScriptComponent ){
                component.run();
            }

            if( p.defaultRepresentation ){
                this.defaultFileRepresentation( component );
            }

            return component;

        }.bind( this );

        var onErrorFn = function( e ){

            component.setStatus( e );
            throw e;

        }

        return NGL.autoLoad( path, p ).then( onLoadFn, onErrorFn );

    },

    addComponent: function( component ){

        if( !component ){

            NGL.warn( "NGL.Stage.addComponent: no component given" );
            return;

        }

        this.compList.push( component );

        this.signals.componentAdded.dispatch( component );

    },

    addComponentFromObject: function( object, params ){

        var component = NGL.makeComponent( this, object, params );

        this.addComponent( component );

        return component;

    },

    removeComponent: function( component ){

        var idx = this.compList.indexOf( component );

        if( idx !== -1 ){

            this.compList.splice( idx, 1 );

        }

        component.dispose();

        this.signals.componentRemoved.dispatch( component );

    },

    removeAllComponents: function( type ){

        this.compList.slice().forEach( function( o, i ){

            if( !type || o instanceof type ){

                this.removeComponent( o );

            }

        }, this );

    },

    handleResize: function(){

        this.viewer.handleResize();

    },

    toggleFullscreen: function( element ){

        if( !document.fullscreenEnabled && !document.mozFullScreenEnabled &&
            !document.webkitFullscreenEnabled && !document.msFullscreenEnabled
        ){
            console.log( "fullscreen mode (currently) not possible" );
            return;
        }

        var self = this;
        element = element || this.viewer.container;
        this.lastFullscreenElement = element;

        //

        function getFullscreenElement(){
            return document.fullscreenElement || document.mozFullScreenElement ||
                document.webkitFullscreenElement || document.msFullscreenElement;
        }

        function resizeElement(){

            if( !getFullscreenElement() && self.lastFullscreenElement ){

                var element = self.lastFullscreenElement;
                element.style.width = element.dataset.normalWidth;
                element.style.height = element.dataset.normalHeight;

                document.removeEventListener( "fullscreenchange", resizeElement );
                document.removeEventListener( "mozfullscreenchange", resizeElement );
                document.removeEventListener( "webkitfullscreenchange", resizeElement );
                document.removeEventListener( "msfullscreenchange", resizeElement );

                self.handleResize();

            }

        }

        //

        if( !getFullscreenElement() ){

            element.dataset.normalWidth = element.style.width;
            element.dataset.normalHeight = element.style.height;
            element.style.width = screen.width + "px";
            element.style.height = screen.height + "px";

            self.handleResize();

            if( element.requestFullscreen ){
                element.requestFullscreen();
            }else if( element.msRequestFullscreen ){
                element.msRequestFullscreen();
            }else if( element.mozRequestFullScreen ){
                element.mozRequestFullScreen();
            }else if( element.webkitRequestFullscreen ){
                element.webkitRequestFullscreen();
            }

            document.addEventListener( "fullscreenchange", resizeElement );
            document.addEventListener( "mozfullscreenchange", resizeElement );
            document.addEventListener( "webkitfullscreenchange", resizeElement );
            document.addEventListener( "msfullscreenchange", resizeElement );

        }else{

            if( document.exitFullscreen ){
                document.exitFullscreen();
            }else if( document.msExitFullscreen ){
                document.msExitFullscreen();
            }else if( document.mozCancelFullScreen ){
                document.mozCancelFullScreen();
            }else if( document.webkitExitFullscreen ){
                document.webkitExitFullscreen();
            }

        }

    },

    centerView: function(){

        if( this.tasks.count > 0 ){

            var centerFn = function( delta, count ){

                if( count === 0 ){

                    this.tasks.signals.countChanged.remove( centerFn, this );

                }

                this.viewer.centerView( true );

            }

            this.tasks.signals.countChanged.add( centerFn, this );

        }

        this.viewer.centerView( true );

    },

    setOrientation: function( orientation ){

        this.tasks.onZeroOnce( function(){

            this.viewer.setOrientation( orientation );

        }, this );

    },

    getOrientation: function(){

        return this.viewer.getOrientation();

    },

    exportImage: function( factor, antialias, transparent, trim, onProgress ){

        var reprParamsList = [];

        // this.eachRepresentation( function( repr ){

        //     if( repr.visible && repr.parent.visible ){

        //         var r = repr.repr;

        //         var op = {
        //             subdiv: r.subdiv,
        //             radialSegments: r.radialSegments,
        //             sphereDetail: r.sphereDetail,
        //             radiusSegments: r.radiusSegments
        //         }

        //         reprParamsList.push( {
        //             repr: repr,
        //             params: op
        //         } );

        //         var p = {};

        //         if( op.subdiv !== undefined ){
        //             p.subdiv = Math.max( 12, op.subdiv );
        //         }

        //         if( op.radialSegments !== undefined ){
        //             p.radialSegments = Math.max( 20, op.radialSegments );
        //         }

        //         if( op.sphereDetail !== undefined ){
        //             p.sphereDetail = Math.max( 2, op.sphereDetail );
        //         }

        //         if( op.radiusSegments !== undefined ){
        //             p.radiusSegments = Math.max( 20, op.radiusSegments );
        //         }

        //         repr.setParameters( p );

        //     }

        // }, NGL.StructureComponent );

        function makeScreenshot(){

            this.viewer.screenshot( {

                factor: factor,
                type: "image/png",
                quality: 1.0,
                antialias: antialias,
                transparent: transparent,
                trim: trim,

                onProgress: function( i, n, finished ){

                    if( typeof onProgress === "function" ){

                        onProgress( i, n, finished );

                    }

                    if( finished ){

                        reprParamsList.forEach( function( d ){

                            d.repr.setParameters( d.params );

                        } );

                    }

                }

            } );

        }

        this.tasks.onZeroOnce( makeScreenshot, this );

    },

    setTheme: function( value ){

        this.parameters.theme.value = value;

        var viewerBackground;
        if( value === "light" ){
            viewerBackground = "white";
        }else{
            viewerBackground = "black";
        }

        this.signals.themeChanged.dispatch( value );
        this.viewer.setBackground( viewerBackground );

    },

    setImpostor: function( value ) {

        this.parameters.impostor.value = value;

        var types = [
            "spacefill", "ball+stick", "licorice", "hyperball",
            "backbone", "rocket", "crossing", "contact",
            "dot"
        ];

        this.eachRepresentation( function( repr ){

            if( repr instanceof NGL.ScriptComponent ) return;

            if( types.indexOf( repr.getType() ) === -1 ){
                return;
            }

            var p = repr.getParameters();
            p.disableImpostor = !value;
            repr.build( p );

        } );

    },

    setQuality: function( value ) {

        this.parameters.quality.value = value;

        var types = [
            "tube", "cartoon", "ribbon", "trace", "rope"
        ];

        var impostorTypes = [
            "spacefill", "ball+stick", "licorice", "hyperball",
            "backbone", "rocket", "crossing", "contact",
            "dot"
        ];

        this.eachRepresentation( function( repr ){

            if( repr instanceof NGL.ScriptComponent ) return;

            var p = repr.getParameters();

            if( types.indexOf( repr.getType() ) === -1 ){

                if( impostorTypes.indexOf( repr.getType() ) === -1 ){
                    return;
                }

                if( NGL.extensionFragDepth && !p.disableImpostor ){
                    repr.repr.quality = value;
                    return;
                }

            }

            p.quality = value;
            repr.build( p );

        } );

    },

    eachComponent: function( callback, type ){

        this.compList.forEach( function( o, i ){

            if( !type || o instanceof type ){

                callback( o, i );

            }

        } );

    },

    eachRepresentation: function( callback, componentType ){

        this.eachComponent( function( comp ){

            comp.reprList.forEach( function( repr ){

                callback( repr, comp );

            } );

        }, componentType );

    },

    getComponentsByName: function( name, componentType ){

        var compList = [];

        this.eachComponent( function( comp ){

            if( name === undefined || comp.name.match( name ) !== null ){
                compList.push( comp );
            }

        }, componentType );

        return new NGL.ComponentCollection( compList );

    },

    getRepresentationsByName: function( name, componentType ){

        var compName, reprName;

        if( typeof name !== "object" ){
            compName = undefined;
            reprName = name;
        }else{
            compName = name.comp;
            reprName = name.repr;
        }

        var reprList = [];

        this.eachRepresentation( function( repr, comp ){

            if( compName !== undefined && comp.name.match( compName ) === null ){
                return;
            }

            if( reprName === undefined || repr.name.match( reprName ) !== null ){
                reprList.push( repr );
            }

        }, componentType );

        return new NGL.RepresentationCollection( reprList );

    },

    getAnythingByName: function( name ){

        var compList = this.getComponentsByName( name ).list;
        var reprList = this.getRepresentationsByName( name ).list;

        return new NGL.Collection( compList.concat( reprList ) );

    },

    dispose: function(){

        this.tasks.dispose();

    }

};


////////////
// Picking

NGL.PickingControls = function( viewer, stage ){

    var position = new THREE.Vector3();

    var mouse = {

        position: new THREE.Vector2(),
        down: new THREE.Vector2(),
        moving: false,
        distance: function(){
            return mouse.position.distanceTo( mouse.down );
        }

    };

    viewer.renderer.domElement.addEventListener( 'mousemove', function( e ){

        e.preventDefault();
        // e.stopPropagation();

        mouse.moving = true;
        mouse.position.x = e.layerX;
        mouse.position.y = e.layerY;

    } );

    viewer.renderer.domElement.addEventListener( 'mousedown', function( e ){

        e.preventDefault();
        // e.stopPropagation();

        mouse.moving = false;
        mouse.down.x = e.layerX;
        mouse.down.y = e.layerY;

    } );

    viewer.renderer.domElement.addEventListener( 'mouseup', function( e ){

        e.preventDefault();
        // e.stopPropagation();

        if( mouse.distance() > 3 || e.which === NGL.RightMouseButton ) return;

        var box = viewer.renderer.domElement.getBoundingClientRect();

        var offsetX = e.clientX - box.left;
        var offsetY = e.clientY - box.top;

        var pickingData = viewer.pick(
            offsetX,
            box.height - offsetY
        );
        var gid = pickingData.gid;
        var instance = pickingData.instance;

        var pickedAtom = undefined;
        var pickedBond = undefined;
        var pickedVolume = undefined;

        var picked = NGL.GidPool.getByGid( gid );

        if( picked instanceof NGL.Atom || picked instanceof NGL.ProxyAtom ){

            pickedAtom = picked;

        }else if( picked instanceof NGL.Bond ){

            pickedBond = picked;

        }else if( picked && picked.volume instanceof NGL.Volume ){

            pickedVolume = picked;

        }

        //

        if( ( pickedAtom || pickedBond || pickedVolume ) &&
                e.which === NGL.MiddleMouseButton
        ){

            if( pickedAtom ){

                position.copy( pickedAtom );

            }else if( pickedBond ){

                position.set( 0, 0, 0 )
                    .addVectors( pickedBond.atom1, pickedBond.atom2 )
                    .multiplyScalar( 0.5 );

            }else if( pickedVolume ){

                position.copy( pickedVolume );

            }

            if( instance ){

                position.applyProjection( instance.matrix );

            }

            viewer.centerView( false, position );

        }

        //

        if( pickedAtom ){

            stage.signals.atomPicked.dispatch( pickedAtom );

        }else if( pickedBond ){

            stage.signals.bondPicked.dispatch( pickedBond );

        }else if( pickedVolume ){

            stage.signals.volumePicked.dispatch( pickedVolume );

        }else{

            stage.signals.nothingPicked.dispatch();

        }

        stage.signals.onPicking.dispatch( {

            "atom": pickedAtom,
            "bond": pickedBond,
            "volume": pickedVolume,
            "instance": instance

        } );

        //

        if( NGL.debug ){

            NGL.log( "picked atom", pickedAtom );
            NGL.log( "picked bond", pickedBond );
            NGL.log( "picked volume", pickedVolume );

        }

    } );

};


////////////////
// Preferences

NGL.Preferences = function( id, defaultParams ){

    this.id = id || "ngl-stage";
    var dp = Object.assign( {}, defaultParams );

    this.storage = {
        impostor: true,
        quality: "medium",
        theme: "dark",
        overview: true,
        rotateSpeed: 2.0,
        zoomSpeed: 1.2,
        panSpeed: 0.8,
        clipNear: 0,
        clipFar: 100,
        clipDist: 10,
        fogNear: 50,
        fogFar: 100,
    };

    // overwrite default values with params
    for( var key in this.storage ){
        if( dp[ key ] !== undefined ){
            this.storage[ key ] = dp[ key ];
        }
    }

    try{
        if ( window.localStorage[ this.id ] === undefined ) {
            window.localStorage[ this.id ] = JSON.stringify( this.storage );
        } else {
            var data = JSON.parse( window.localStorage[ this.id ] );
            for ( var key in data ) {
                this.storage[ key ] = data[ key ];
            }
        }
    }catch( e ){
        NGL.error( "localStorage not accessible/available" );
    }

};

NGL.Preferences.prototype = {

    constructor: NGL.Preferences,

    getKey: function( key ){

        return this.storage[ key ];

    },

    setKey: function( key, value ){

        this.storage[ key ] = value;

        try{
            window.localStorage[ this.id ] = JSON.stringify( this.storage );
        }catch( e ){
            // Webkit === 22 / Firefox === 1014
            if( e.code === 22 || e.code === 1014 ){
                NGL.error( "localStorage full" );
            }else{
                NGL.error( "localStorage not accessible/available" );
            }
        }

    },

    clear: function(){

        try{
            delete window.localStorage[ this.id ];
        }catch( e ){
            NGL.error( "localStorage not accessible/available" );
        }

    }

};


//////////////
// Component

NGL.makeComponent = function( stage, object, params ){

    var component;

    if( object instanceof NGL.Structure ){

        component = new NGL.StructureComponent( stage, object, params );

    }else if( object instanceof NGL.Surface || object instanceof NGL.Volume ){

        component = new NGL.SurfaceComponent( stage, object, params );

    }else if( object instanceof NGL.Script ){

        component = new NGL.ScriptComponent( stage, object, params );

    }else{

        NGL.warn( "NGL.makeComponent: object type unknown", object );

    }

    return component;

};


NGL.nextComponentId = 0;


NGL.Component = function( stage, params ){

    Object.defineProperty( this, 'id', { value: NGL.nextComponentId++ } );

    var p = params || {};

    this.name = p.name;
    this.uuid = THREE.Math.generateUUID();
    this.visible = p.visible !== undefined ? p.visible : true;

    // construct instance signals
    var signalNames = Object.keys( this.signals );
    this.signals = {};
    signalNames.forEach( function( name ){
        this.signals[ name ] = new signals.Signal();
    }, this );

    this.stage = stage;
    this.viewer = stage.viewer;

    this.reprList = [];

}

NGL.Component.prototype = {

    constructor: NGL.Component,

    type: "component",

    signals: {

        representationAdded: null,
        representationRemoved: null,
        visibilityChanged: null,
        requestGuiVisibility: null,

        statusChanged: null,
        nameChanged: null,
        disposed: null,

    },

    addRepresentation: function( type, object, params ){

        var p = params || {};
        var sp = this.stage.getParameters();
        p.quality = p.quality || sp.quality;
        p.disableImpostor = NGL.defaults( p.disableImpostor, !sp.impostor );
        p.visible = NGL.defaults( p.visible, true );

        var p2 = Object.assign( {}, p, { visible: this.visible && p.visible } );

        var repr = NGL.makeRepresentation(
            type, object, this.viewer, p2
        );

        var reprComp = new NGL.RepresentationComponent(
            this.stage, repr, p, this
        );

        this.reprList.push( reprComp );

        this.signals.representationAdded.dispatch( reprComp );

        return reprComp;

    },

    addBufferRepresentation: function( buffer, params ){

        return NGL.Component.prototype.addRepresentation.call(
            this, "buffer", buffer, params
        );

    },

    removeRepresentation: function( repr ){

        var idx = this.reprList.indexOf( repr );

        if( idx !== -1 ){

            this.reprList.splice( idx, 1 );

        }

        this.signals.representationRemoved.dispatch( repr );

    },

    updateRepresentations: function( what ){

        this.reprList.forEach( function( repr ){

            repr.update( what );

        } );

        this.stage.viewer.requestRender();

    },

    clearRepresentations: function(){

        // copy via .slice because side effects may change reprList
        this.reprList.slice().forEach( function( repr ){

            repr.dispose();

        } );

    },

    dispose: function(){

        this.clearRepresentations();

        delete this.reprList;

        this.signals.disposed.dispatch();

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

    setName: function( value ){

        this.name = value;
        this.signals.nameChanged.dispatch( value );

        return this;

    },

    getCenter: function(){

        // NGL.warn( "not implemented" )

    },

    requestGuiVisibility: function( value ){

        this.signals.requestGuiVisibility.dispatch( value );

        return this;

    },

    eachRepresentation: function( callback ){

        this.reprList.forEach( callback );

    }

};


NGL.StructureComponent = function( stage, structure, params ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : structure.name;

    NGL.Component.call( this, stage, p );

    this.__structure = structure;
    this.structure = structure;

    this.trajList = [];
    this.initSelection( p.sele );

    if( p.assembly !== undefined ){
        this.structure.setDefaultAssembly( p.assembly );
    }

};

NGL.StructureComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    constructor: NGL.StructureComponent,

    type: "structure",

    signals: Object.assign( {

        trajectoryAdded: null,
        trajectoryRemoved: null

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
                this.__structure, this.selection
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

            repr.build( repr.getParameters() );

        }, this );

    },

    rebuildTrajectories: function(){

        this.trajList.slice( 0 ).forEach( function( trajComp ){

            trajComp.trajectory.setStructure( this.structure );

        }, this );

    },

    addRepresentation: function( type, params ){

        return NGL.Component.prototype.addRepresentation.call(
            this, type, this.structure, params
        );

    },

    addTrajectory: function( trajPath, sele, i ){

        var params = { "i": i };

        var traj = NGL.makeTrajectory(
            trajPath, this.structure, sele
        );

        traj.signals.frameChanged.add( function( value ){

            this.updateRepresentations( { "position": true } );

        }, this );

        var trajComp = new NGL.TrajectoryComponent(
            this.stage, traj, params, this
        );

        this.trajList.push( trajComp );

        this.signals.trajectoryAdded.dispatch( trajComp );

        return trajComp;

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

        // copy via .slice because side effects may change trajList
        this.trajList.slice().forEach( function( traj ){

            traj.dispose();

        } );

        this.trajList = [];

        this.structure.dispose();
        this.__structure.dispose();

        NGL.Component.prototype.dispose.call( this );

    },

    centerView: function( zoom, sele ){

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

        this.viewer.centerView( zoom, center );

        return this;

    },

    getCenter: function(){

        return this.structure.center;

    },

    superpose: function( component, align, sele1, sele2, xsele1, xsele2 ){

        NGL.superpose(
            this.structure, component.structure,
            align, sele1, sele2, xsele1, xsele2
        );


        // FIXME there should be a better way
        if( this.structure !== this.__structure ){

            NGL.superpose(
                this.__structure, component.structure,
                align, sele1, sele2, xsele1, xsele2
            );

        }

        this.updateRepresentations( { "position": true } );

        return this;

    },

    setVisibility: function( value ){

        NGL.Component.prototype.setVisibility.call( this, value );

        this.trajList.forEach( function( traj ){

            // FIXME ???
            traj.setVisibility( value );

        } );

        return this;

    },

} );


NGL.SurfaceComponent = function( stage, surface, params ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : surface.name;

    NGL.Component.call( this, stage, p );

    this.surface = surface;

};

NGL.SurfaceComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    constructor: NGL.SurfaceComponent,

    type: "surface",

    addRepresentation: function( type, params ){

        return NGL.Component.prototype.addRepresentation.call(
            this, type, this.surface, params
        );

    },

    dispose: function(){

        this.surface.dispose();

        NGL.Component.prototype.dispose.call( this );

    },

    centerView: function( zoom ){

        var center = this.surface.center;

        if( zoom ){
            zoom = this.surface.boundingBox.size().length();
        }

        this.viewer.centerView( zoom, center );

    },

} );


NGL.TrajectoryComponent = function( stage, trajectory, params, parent ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : trajectory.name;

    NGL.Component.call( this, stage, p );

    this.trajectory = trajectory;
    this.parent = parent;
    this.status = "loaded";

    // signals

    trajectory.signals.frameChanged.add( function( i ){

        this.signals.frameChanged.dispatch( i );

    }, this );

    trajectory.signals.playerChanged.add( function( player ){

        this.signals.playerChanged.dispatch( player );

    }, this );

    trajectory.signals.gotNumframes.add( function( n ){

        this.signals.gotNumframes.dispatch( n );

    }, this );

    //

    if( p.i !== undefined ){

        this.setFrame( p.i );

    }

};

NGL.TrajectoryComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    constructor: NGL.TrajectoryComponent,

    type: "trajectory",

    signals: Object.assign( {

        frameChanged: null,
        playerChanged: null,
        gotNumframes: null,
        parametersChanged: null

    }, NGL.Component.prototype.signals ),

    addRepresentation: function( type, params ){

        return NGL.Component.prototype.addRepresentation.call(
            this, type, this.trajectory, params
        );

    },

    setFrame: function( i ){

        this.trajectory.setFrame( i );

    },

    setParameters: function( params ){

        this.trajectory.setParameters( params );
        this.signals.parametersChanged.dispatch( params );

        return this;

    },

    dispose: function(){

        this.trajectory.dispose();

        NGL.Component.prototype.dispose.call( this );

    },

    getCenter: function(){}

} );


NGL.ScriptComponent = function( stage, script, params ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : script.name;

    NGL.Component.call( this, stage, p );

    this.script = script;
    this.status = "loaded";

    this.script.signals.nameChanged.add( function( value ){

        this.setName( value );

    }, this );

};

NGL.ScriptComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    constructor: NGL.ScriptComponent,

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

        this.signals.disposed.dispatch();

    },

    setVisibility: function( value ){},

    getCenter: function(){}

} );


NGL.RepresentationComponent = function( stage, repr, params, parent ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : repr.type;

    NGL.Component.call( this, stage, p );

    this.parent = parent;

    this.setRepresentation( repr );

};

NGL.RepresentationComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    constructor: NGL.RepresentationComponent,

    type: "representation",

    signals: Object.assign( {

        parametersChanged: null,

    }, NGL.Component.prototype.signals ),

    getType: function(){

        return this.repr.type;

    },

    setRepresentation: function( repr ){

        if( this.repr ){
            this.repr.dispose();
        }

        this.repr = repr;
        // this.name = repr.type;

        this.stage.tasks.listen( this.repr.tasks )

        this.updateVisibility();

    },

    addRepresentation: function( type ){},

    removeRepresentation: function( repr ){},

    dispose: function(){

        if( this.parent ){

            this.parent.removeRepresentation( this );

        }

        this.repr.dispose();

        this.signals.disposed.dispatch();

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

    build: function( params ){

        this.repr.build( params );

        return this;

    },

    setStructure: function( structure ){

        this.repr.setStructure( structure );

        return this;

    },

    setSelection: function( string ){

        this.repr.setSelection( string );

        return this;

    },

    setParameters: function( params ){

        this.repr.setParameters( params );
        this.signals.parametersChanged.dispatch(
            this.repr.getParameters()
        );

        return this;

    },

    getParameters: function(){

        return this.repr.getParameters();

    },

    setColor: function( value ){

        this.repr.setColor( value );

        return this;

    },

    getCenter: function(){}

} );


///////////////
// Collection

NGL.Collection = function( list ){

    this.list = list || [];

    // remove elements from list when they get disposed

    var n = this.list.length;

    for( var i = 0; i < n; ++i ){

        var elm = this.list[ i ];

        elm.signals.disposed.add( function(){

            this._remove( elm );

        }, this );

    }

};

NGL.Collection.prototype = {

    constructor: NGL.Collection,

    _remove: function( elm ){

        var idx = this.list.indexOf( elm );

        if( idx !== -1 ){

            this.list.splice( idx, 1 );

        }

    },

    _invoke: function( methodName, methodArgs ){

        var n = this.list.length;

        for( var i = 0; i < n; ++i ){

            var elm = this.list[ i ];
            var method = elm[ methodName ];

            if( typeof method === "function" ){

                method.apply( elm, methodArgs );

            }

        }

        return this;

    },

    setVisibility: function( value ){

        return this._invoke( "setVisibility", [ value ] );

    },

    setSelection: function( string ){

        return this._invoke( "setSelection", [ string ] );

    },

    requestGuiVisibility: function( value ){

        return this._invoke( "requestGuiVisibility", [ value ] );

    },

    dispose: function(){

        return this._invoke( "dispose" );

    }

};


NGL.ComponentCollection = function( compList ){

    NGL.Collection.call( this, compList );

};

NGL.ComponentCollection.prototype = NGL.createObject(

    NGL.Collection.prototype, {

    constructor: NGL.ComponentCollection,

    addRepresentation: function( name, params ){

        return this._invoke( "addRepresentation", [ name, params ] );

    },

    centerView: function( zoom, sele ){

        return this._invoke( "centerView", [ zoom, sele ] );

    }

} );


NGL.RepresentationCollection = function( reprList ){

    NGL.Collection.call( this, reprList );

};

NGL.RepresentationCollection.prototype = NGL.createObject(

    NGL.Collection.prototype, {

    constructor: NGL.RepresentationCollection,

    setParameters: function( params ){

        return this._invoke( "setParameters", [ params ] );

    },

    setColor: function( color ){

        return this._invoke( "setColor", [ color ] );

    }

} );
