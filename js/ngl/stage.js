/**
 * @file Stage
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


//////////
// Stage

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

    this.viewer = new NGL.Viewer( eid );

    this.initFileDragDrop();

    this.viewer.animate();

    this.pickingControls = new NGL.PickingControls( this.viewer, this );

}

NGL.Stage.prototype = {

    defaultFileRepresentation: function( object ){

        if( object instanceof NGL.StructureComponent ){

            object.addRepresentation( "cartoon", { sele: "*" } );
            object.addRepresentation( "licorice", { sele: "hetero" } );
            object.centerView();

        }else if( object instanceof NGL.SurfaceComponent ){

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

    loadFile: function( path, onLoad, params ){

        var component;
        var scope = this;

        NGL.autoLoad( path, function( object ){

            // check for placeholder component
            if( component ){

                scope.removeComponent( component );

            }

            if( object instanceof NGL.Structure ){

                component = new NGL.StructureComponent( scope, object, params );

            }else if( object instanceof NGL.Surface ){

                component = new NGL.SurfaceComponent( scope, object );

            }else if( object instanceof NGL.Script ){

                component = new NGL.ScriptComponent( scope, object );

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

        });

        // ensure that component is yet ready
        if( !component ){

            component = new NGL.Component( this );
            var path2 = ( path instanceof File ) ? path.name : path;
            component.name = path2.replace( /^.*[\\\/]/, '' );

            this.addComponent( component );

        }

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

        var box = new THREE.Box3();
        var center = new THREE.Vector3();

        return function(){
        
            // box.makeEmpty();

            // this.eachComponent( function( o ){

            //     var point = o.getCenter();

            //     if( point ){

            //         box.expandByPoint( point );

            //     }

            // } );

            // box.center( center );
            // this.viewer.centerView( center );

            this.viewer.centerView(
                this.viewer.boundingBox.center()
            );
            

        }

    }(),

    eachComponent: function( callback, type ){

        this.compList.forEach( function( o, i ){
            
            if( !type || o instanceof type ){

                callback( o, i );

            }

        } );

    }

}


//////////////
// Component

NGL.Component = function( stage ){

    var SIGNALS = signals;

    this.signals = {

        representationAdded: new SIGNALS.Signal(),
        representationRemoved: new SIGNALS.Signal(),
        visibilityChanged: new SIGNALS.Signal(),
        nameChanged: new SIGNALS.Signal(),

    };

    this.stage = stage;
    this.viewer = stage.viewer;

    this.visible = true;
    this.reprList = [];

}

NGL.Component.prototype = {

    apply: function( object ){

        object.setName = NGL.Component.prototype.setName;

    },

    addRepresentation: function( repr ){

        this.reprList.push( repr );

        this.signals.representationAdded.dispatch( repr );

        return repr;

    },

    removeRepresentation: function( repr ){

        var idx = this.reprList.indexOf( repr );

        if( idx !== -1 ){

            this.reprList.splice( idx, 1 );

        }

        repr.dispose();

        this.signals.representationRemoved.dispatch( repr );

    },

    dispose: function(){

        // copy via .slice because side effects may change reprList
        this.reprList.slice().forEach( function( repr ){

            repr.dispose();

        } );

        this.reprList = [];

    },

    setVisibility: function( value ){

        this.visible = value;
        this.signals.visibilityChanged.dispatch( value );

    },

    setName: function( value ){

        this.name = value;
        this.signals.nameChanged.dispatch( value );

    },

    getCenter: function(){

        // console.warn( "not implemented" )

    }

}


NGL.StructureComponent = function( stage, structure, params ){

    params = params || {};

    NGL.Component.call( this, stage );

    var SIGNALS = signals;

    this.signals.trajectoryAdded = new SIGNALS.Signal();
    this.signals.trajectoryRemoved = new SIGNALS.Signal();

    this.trajList = [];

    this.__structure = structure;
    this.structure = structure;
    this.initSelection( params.sele );
    this.name = structure.name;

}

NGL.StructureComponent.prototype = {

    initSelection: function( string ){

        var scope = this;

        this.selection = new NGL.Selection( string );

        this.selection.signals.stringChanged.add( function( string ){

            scope.applySelection();

            scope.rebuildRepresentations();
            scope.rebuildTrajectories();

        } );

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

    rebuildRepresentations: function(){

        var scope = this;

        this.reprList.slice( 0 ).forEach( function( repr ){

            scope.addRepresentation( repr.name, repr.getParameters() );

            scope.removeRepresentation( repr );

        } );

    },

    rebuildTrajectories: function(){

        var scope = this;

        scope.trajList.slice( 0 ).forEach( function( traj ){

            scope.addTrajectory( traj.xtcPath, traj._sele, traj.currentFrame );

            scope.removeTrajectory( traj );

        } );

    },

    addRepresentation: function( type, params ){

        console.time( "NGL.StructureComponent.add " + type );

        var ReprClass = NGL.representationTypes[ type ];

        if( !ReprClass ){

            console.error( "NGL.StructureComponent.add: representation type unknown" );
            return;

        }

        var repr = new ReprClass( this.structure, this.viewer, params );

        NGL.Component.prototype.addRepresentation.call( this, repr );

        console.timeEnd( "NGL.StructureComponent.add " + type );

        return repr;

    },

    removeRepresentation: function( repr ){

        NGL.Component.prototype.removeRepresentation.call( this, repr );

    },

    updateRepresentations: function(){

        this.reprList.forEach( function( repr ){

            repr.update();

        } );

        this.stage.viewer.requestRender();

    },

    addTrajectory: function( xtcPath, sele, i ){

        var scope = this;

        var traj = new NGL.Trajectory( xtcPath, this.structure, sele );

        traj.setFrame( i );

        traj.signals.frameChanged.add( function( value ){

            // console.time( "frameUpdate" );

            scope.updateRepresentations();

            // console.timeEnd( "frameUpdate" );
            
        } );

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

    setVisibility: function( value ){

        this.reprList.forEach( function( repr ){

            repr.setVisibility( value );

        } );

        NGL.Component.prototype.setVisibility.call( this, value );

    },

    centerView: function( sele ){

        var center;

        if( sele ){
            center = this.structure.atomCenter( new NGL.Selection( sele ) );
        }else{
            center = this.structure.center;
        }

        this.viewer.centerView( center );

    },

    getCenter: function(){

        return this.structure.center;

    }

};

NGL.Component.prototype.apply( NGL.StructureComponent.prototype );


NGL.SurfaceComponent = function( stage, surface ){

    NGL.Component.call( this, stage );

    this.surface = surface;
    this.name = surface.name;

    // this.viewer.add( surface.buffer );

    var mesh = surface.buffer.getMesh( "background" );
    this.viewer.backgroundModelGroup.add( mesh );

};

NGL.SurfaceComponent.prototype = {

    addRepresentation: function( type ){},

    removeRepresentation: function( repr ){},

    dispose: function(){

        this.viewer.remove( this.surface.buffer );

        this.surface.buffer.dispose();
        this.surface.buffer = null;  // aid GC

    },

    setVisibility: function( value ){

        this.surface.setVisibility( value );
        this.viewer.requestRender();

        NGL.Component.prototype.setVisibility.call( this, value );

    },

    centerView: function(){

        this.viewer.centerView( this.surface.center );

    },

    getCenter: function(){

        return this.surface.center;

    }

};

NGL.Component.prototype.apply( NGL.SurfaceComponent.prototype );


NGL.ScriptComponent = function( stage, script ){

    NGL.Component.call( this, stage );

    var SIGNALS = signals;

    this.signals.statusChanged = new SIGNALS.Signal();

    this.script = script;
    this.name = script.name;

    this.status = "loaded";

};

NGL.ScriptComponent.prototype = {

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

    setStatus: function( value ){

        this.status = value;
        this.signals.statusChanged.dispatch( value );

        return this;

    },

    dispose: function(){

        // TODO

    },

    setVisibility: function( value ){},

    getCenter: function(){}

};

NGL.Component.prototype.apply( NGL.ScriptComponent.prototype );
