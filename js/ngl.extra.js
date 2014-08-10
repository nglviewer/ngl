/**
 * @file Extra
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.LeftMouseButton = 1;
NGL.MiddleMouseButton = 2;
NGL.RightMouseButton = 3;


//////////
// Stage

NGL.PickingControls = function( viewer, stage ){

    var gl = viewer.renderer.getContext();
    var pixelBuffer = new Uint8Array( 4 );
    var compList = stage.compList;

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
        compList.forEach( function( o ){

            if( o instanceof NGL.StructureComponent ){

                o.structure.eachAtom( function( a ){

                    if( a.globalindex === ( id - 1 ) ){
                        pickedAtom = a;
                    }

                } );

            }

        } );

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
            console.log( "devicePixelRatio", window.devicePixelRatio )
        }else{
            viewer.render();
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

            // object.addRepresentation( "backbone" );
            // object.addRepresentation( "ribbon", ":A" );
            object.addRepresentation( "tube", "*" );
            object.addRepresentation( "licorice", "hetero" );
            // object.addRepresentation( "spacefill", "protein" );
            // object.addRepresentation( "ball+stick", "! protein" );
            // object.addRepresentation( "trace" );
            // object.addRepresentation( "line" );
            // object.addRepresentation( "hyperball", "135 :B" );
            // object.centerView( "backbone" );
            object.centerView();

        }else if( object instanceof NGL.SurfaceComponent ){

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

                this.loadFile( fileList[ i ] );

            }

        }.bind( this ), false );

    },

    loadFile: function( path, onLoad, params ){

        params = params || {};

        var scope = this;

        NGL.autoLoad( path, function( object ){

            var component;

            if( object instanceof NGL.Structure ){

                component = new NGL.StructureComponent( scope, object, params.sele );

            }else if( object instanceof NGL.Surface ){

                component = new NGL.SurfaceComponent( scope, object );

            }else{

                console.warn( "NGL.Stage.loadFile: object type unknown", object );

            }

            scope.addComponent( component );
            
            if( typeof onLoad === "function" ){

                onLoad( component );

            }else{

                scope.defaultFileRepresentation( component );

            }

        });

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
        
            box.makeEmpty();

            this.compList.forEach( function( comp ){

                box.expandByPoint( comp.getCenter() );

            } );

            box.center( center );
            this.viewer.centerView( center );

        }

    }()

}


NGL.Component = function( stage ){

    var SIGNALS = signals;

    this.signals = {

        representationAdded: new SIGNALS.Signal(),
        representationRemoved: new SIGNALS.Signal(),
        visibilityChanged: new SIGNALS.Signal(),

    };

    this.stage = stage;
    this.viewer = stage.viewer;

    this.reprList = [];

}

NGL.Component.prototype = {

    apply: function( object ){

        // object.atomPosition = NGL.AtomSet.prototype.atomPosition;

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

        this.signals.visibilityChanged.dispatch( value );

    },

    getCenter: function(){

        console.warn( "not implemented" )

    }

}


NGL.StructureComponent = function( stage, structure, sele ){

    NGL.Component.call( this, stage );

    var SIGNALS = signals;

    this.signals.trajectoryAdded = new SIGNALS.Signal();
    this.signals.trajectoryRemoved = new SIGNALS.Signal();

    this.trajList = [];

    this.__structure = structure;
    this.structure = structure;
    this.changeSelection( sele );
    this.name = structure.name;

}

NGL.StructureComponent.prototype = {

    changeSelection: function( sele ){

        if( sele === this.sele ) return;

        this.sele = sele;

        if( sele ){

            this.structure = new NGL.StructureSubset( this.__structure, sele );

        }

        this.rebuildRepresentations();

        var scope = this;

        this.trajList.slice( 0 ).forEach( function( traj ){

            scope.addTrajectory( traj.xtcPath );

            scope.removeTrajectory( traj );

        } );

    },

    rebuildRepresentations: function(){

        var scope = this;

        this.reprList.slice( 0 ).forEach( function( repr ){

            scope.addRepresentation( repr.name, repr._sele );

            scope.removeRepresentation( repr );

        } );

    },

    addRepresentation: function( type, sele ){

        console.time( "NGL.Structure.add " + type );

        var reprType = NGL.representationTypes[ type ];

        if( !reprType ){

            console.error( "NGL.Structure.add: representation type unknown" );
            return;

        }

        var repr = new reprType( this.structure, this.viewer, sele );

        NGL.Component.prototype.addRepresentation.call( this, repr );

        console.timeEnd( "NGL.Structure.add " + type );

        return repr;

    },

    removeRepresentation: function( repr ){

        NGL.Component.prototype.removeRepresentation.call( this, repr );

    },

    updateRepresentations: function(){

        this.reprList.forEach( function( repr ){

            repr.update();

        } );

        this.stage.viewer.render();

    },

    addTrajectory: function( xtcPath ){

        var scope = this;

        var traj = new NGL.Trajectory( xtcPath, this.structure );

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

        // copy via .slice because side effects may change reprList
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

    this.viewer.add( surface.buffer );
    this.viewer.render();

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
        this.viewer.render();

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


////////////
// Surface

NGL.Surface = function( object, name ){

    this.name = name;

    if( object instanceof THREE.Geometry ){

        geo = object;

        // TODO check if needed
        geo.computeFaceNormals( true );
        geo.computeVertexNormals( true );

    }else{

        geo = object.children[0].geometry;

    }

    geo.computeBoundingSphere();

    this.center = new THREE.Vector3().copy( geo.boundingSphere.center );

    var position = NGL.Utils.positionFromGeometry( geo );
    var color = NGL.Utils.colorFromGeometry( geo );
    var index = NGL.Utils.indexFromGeometry( geo );
    var normal = NGL.Utils.normalFromGeometry( geo );

    this.buffer = new NGL.MeshBuffer( position, color, index, normal );

}

NGL.Surface.prototype = {

    setVisibility: function( value ){

        this.buffer.mesh.visible = value;

    }

}


///////////
// Loader

NGL.FileLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.FileLoader.prototype = {

    constructor: NGL.FileLoader,

    load: function ( file, onLoad ) {

        var scope = this;

        var cached = scope.cache.get( file );

        if ( cached !== undefined ) {

            onLoad( cached );
            return;

        }

        var reader = new FileReader();

        reader.onload = function( event ){

            scope.cache.add( file, this.response );

            onLoad( event.target.result );
            scope.manager.itemEnd( file );

        }

        reader.readAsText( file );

        scope.manager.itemStart( file );

    }

};


NGL.PdbLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.PdbLoader.prototype = Object.create( THREE.XHRLoader.prototype );

NGL.PdbLoader.prototype.init = function( str, name ){

    var pdb = new NGL.PdbStructure( name );

    pdb.parse( str );

    return pdb

};


NGL.GroLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.GroLoader.prototype = Object.create( THREE.XHRLoader.prototype );

NGL.GroLoader.prototype.init = function( str, name ){

    var gro = new NGL.GroStructure( name );

    gro.parse( str );

    return gro

};


NGL.ObjLoader = function( manager ){

    // this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ObjLoader.prototype = Object.create( THREE.OBJLoader.prototype );

NGL.ObjLoader.prototype.init = function( data, name ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    return new NGL.Surface( data, name );

};


NGL.PlyLoader = function( manager ){

    // this.cache = new THREE.Cache();
    // this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.PlyLoader.prototype = Object.create( THREE.PLYLoader.prototype );

NGL.PlyLoader.prototype.init = function( data, name ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    return new NGL.Surface( data, name );

};


NGL.autoLoad = function(){

    var loaders = {

        "gro": NGL.GroLoader,
        "pdb": NGL.PdbLoader,

        "obj": NGL.ObjLoader,
        "ply": NGL.PlyLoader,

    }

    return function( file, onLoad ){

        var object;

        var path = ( file instanceof File ) ? file.name : file;
        var name = path.replace( /^.*[\\\/]/, '' );
        var ext = path.split('.').pop().toLowerCase();

        if( name.length===4 ){

            ext = "pdb";
            file = "http://www.rcsb.org/pdb/files/" + name + ".pdb";

        }

        var loader = new loaders[ ext ];

        if( !loader ){

            console.error( "NGL.autoLoading: ext '" + ext + "' unknown" );
            return null;

        }

        function init( data ){

            object = loader.init( data, name );

            if( typeof onLoad === "function" ) onLoad( object );

        }

        if( file instanceof File ){

            name = file.name;

            var fileLoader = new NGL.FileLoader();
            fileLoader.load( file, init )

        }else{

            loader.load( file, init );

        }

        return object;

    }

}();



///////////////////
// Representation

NGL.Representation = function( structure, viewer, sele ){

    var SIGNALS = signals;

    this.signals = {

        visibilityChanged: new SIGNALS.Signal(),

    };

    this.structure = structure;
    this.viewer = viewer;

    this.visible = true;

    this._sele = sele;
    this.selection = new NGL.Selection( sele );

    this.atomSet = new NGL.AtomSet( structure, this.selection );
    this.bondSet = structure.bondSet;

    this.create();
    this.finalize();

};

NGL.Representation.prototype = {

    constructor: NGL.Representation,

    name: "",

    applySelection: function( sele ){

        this.selection = new NGL.Selection( sele );

        this.atomSet.setSelection( this.selection );

        // console.log( this.selection );

    },

    changeSelection: function( sele ){

        if( sele === this._sele ) return;
        this._sele = sele;

        this.applySelection( sele );

        this.dispose();
        this.create();
        this.attach();

        this.setVisibility( this.visible );

    },

    finalize: function(){

        this.attach();

    },

    create: function(){

        this.bufferList = [];

    },

    update: function( just_create ){

        if( this.selection ){

            this.atomSet.setSelection( this.selection );

        }

        if( just_create ){

            this.dispose();
            this.create();
            this.attach();

            this.setVisibility( this.visible );

        }

    },

    attach: function(){

        var viewer = this.viewer;

        this.bufferList.forEach( function( buffer ){

            viewer.add( buffer );

        });

        this.signals.visibilityChanged.dispatch( true );

    },

    setVisibility: function( value ){

        this.visible = value;

        this.bufferList.forEach( function( buffer ){

            buffer.mesh.visible = value;

            if( buffer.pickingMesh ){
                buffer.pickingMesh.visible = value;
            }

        });

        this.viewer.render();

        this.signals.visibilityChanged.dispatch( value );

    },

    dispose: function(){

        viewer = this.viewer;

        this.bufferList.forEach( function( buffer ){

            viewer.remove( buffer );
            buffer.dispose();
            buffer = null;  // aid GC

        });

        this.bufferList = [];
        this.fiberList = [];

    }

};


NGL.SpacefillRepresentation = function( structure, viewer, sele, scale ){

    this.scale = scale || 1.0;

    NGL.Representation.call( this, structure, viewer, sele );

};

NGL.SpacefillRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.SpacefillRepresentation.prototype.name = "spacefill";

NGL.SpacefillRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.atomSet.atomPosition(),
        this.atomSet.atomColor(),
        this.atomSet.atomRadius( null, null, this.scale ),
        this.atomSet.atomColor( null, "picking" )
    );

    this.bufferList = [ this.sphereBuffer ];

};

NGL.SpacefillRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    var position = this.atomSet.atomPosition();

    this.sphereBuffer.setAttributes({
        position: position
    });

};


NGL.BallAndStickRepresentation = function( structure, viewer, sele, sphereScale, cylinderSize ){

    this.sphereScale = sphereScale || 0.2;
    this.cylinderSize = cylinderSize || 0.12;

    NGL.Representation.call( this, structure, viewer, sele );

};

NGL.BallAndStickRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.BallAndStickRepresentation.prototype.name = "ball+stick";

NGL.BallAndStickRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.atomSet.atomPosition(),
        this.atomSet.atomColor(),
        this.atomSet.atomRadius( null, null, this.sphereScale ),
        this.atomSet.atomColor( null, "picking" )
    );

    this.__center = new Float32Array( this.atomSet.bondCount * 3 );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        this.atomSet.bondPosition( null, 0 ),
        this.atomSet.bondPosition( null, 1 ),
        this.atomSet.bondColor( null, 0 ),
        this.atomSet.bondColor( null, 1 ),
        this.atomSet.bondRadius( null, null, this.cylinderSize, null ),
        null,
        null,
        this.atomSet.bondColor( null, 0, "picking" ),
        this.atomSet.bondColor( null, 1, "picking" )
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.BallAndStickRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    this.sphereBuffer.setAttributes({
        position: this.atomSet.atomPosition()
    });

    var from = this.atomSet.bondPosition( null, 0 );
    var to = this.atomSet.bondPosition( null, 1 );

    this.cylinderBuffer.setAttributes({
        position: NGL.Utils.calculateCenterArray( from, to, this.__center ),
        position1: from,
        position2: to
    });

};


NGL.LicoriceRepresentation = function( structure, viewer, sele, size ){

    this.size = size || 0.15;

    NGL.Representation.call( this, structure, viewer, sele );

};

NGL.LicoriceRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.LicoriceRepresentation.prototype.name = "licorice";

NGL.LicoriceRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.atomSet.atomPosition(),
        this.atomSet.atomColor(),
        // this.atomSet.atomColor( null, 0x00FF00 ),
        this.atomSet.atomRadius( null, this.size, null ),
        this.atomSet.atomColor( null, "picking" )
    );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        this.atomSet.bondPosition( null, 0 ),
        this.atomSet.bondPosition( null, 1 ),
        this.atomSet.bondColor( null, 0 ),
        this.atomSet.bondColor( null, 1 ),
        // this.atomSet.bondColor( null, 0, 0x00FF00 ),
        // this.atomSet.bondColor( null, 1, 0x00FF00 ),
        this.atomSet.bondRadius( null, null, this.size, null ),
        null,
        null,
        this.atomSet.bondColor( null, 0, "picking" ),
        this.atomSet.bondColor( null, 1, "picking" )
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.LicoriceRepresentation.prototype.update = function(){

    NGL.BallAndStickRepresentation.prototype.update.call( this );

};


NGL.LineRepresentation = function( structure, viewer, sele ){

    NGL.Representation.call( this, structure, viewer, sele );

};

NGL.LineRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.LineRepresentation.prototype.name = "line";

NGL.LineRepresentation.prototype.create = function(){

    this.lineBuffer = new NGL.LineBuffer(
        this.atomSet.bondPosition( null, 0 ),
        this.atomSet.bondPosition( null, 1 ),
        this.atomSet.bondColor( null, 0 ),
        this.atomSet.bondColor( null, 1 )
    );

    this.bufferList = [ this.lineBuffer ];

};

NGL.LineRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    var from = this.atomSet.bondPosition( null, 0 );
    var to = this.atomSet.bondPosition( null, 1 );

    this.lineBuffer.setAttributes({
        from: from,
        to: to
    });

};


NGL.HyperballRepresentation = function( structure, viewer, sele, scale, shrink ){

    this.scale = scale || 0.2;
    this.shrink = shrink || 0.12;

    NGL.Representation.call( this, structure, viewer, sele );

};

NGL.HyperballRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.HyperballRepresentation.prototype.name = "hyperball";

NGL.HyperballRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.atomSet.atomPosition(),
        this.atomSet.atomColor(),
        this.atomSet.atomRadius( null, null, this.scale ),
        this.atomSet.atomColor( null, "picking" )
    );

    this.cylinderBuffer = new NGL.HyperballStickBuffer(
        this.atomSet.bondPosition( null, 0 ),
        this.atomSet.bondPosition( null, 1 ),
        this.atomSet.bondColor( null, 0 ),
        this.atomSet.bondColor( null, 1 ),
        this.atomSet.bondRadius( null, 0, this.cylinderSize, this.scale ),
        this.atomSet.bondRadius( null, 1, this.cylinderSize, this.scale ),
        this.shrink,
        this.atomSet.bondColor( null, 0, "picking" ),
        this.atomSet.bondColor( null, 1, "picking" )
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.HyperballRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    this.sphereBuffer.setAttributes({
        position: this.atomSet.atomPosition()
    });

    var from = this.atomSet.bondPosition( null, 0 );
    var to = this.atomSet.bondPosition( null, 1 );

    this.cylinderBuffer.setAttributes({
        position: NGL.Utils.calculateCenterArray( from, to ),
        inputPosition1: from,
        inputPosition2: to
    });

};


NGL.BackboneRepresentation = function( structure, viewer, sele, size ){

    this.size = size || 0.25;

    NGL.Representation.call( this, structure, viewer, sele );

};

NGL.BackboneRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.BackboneRepresentation.prototype.name = "backbone";

NGL.BackboneRepresentation.prototype.create = function(){

    var backboneAtomSet, backboneBondSet;
    var sphereBuffer, cylinderBuffer;

    var bufferList = [];
    var atomSetList = [];
    var bondSetList = [];

    var size = this.size;
    var test = this.selection.test;

    this.structure.eachFiber( function( f ){

        backboneAtomSet = new NGL.AtomSet();
        backboneBondSet = new NGL.BondSet();

        atomSetList.push( backboneAtomSet );
        bondSetList.push( backboneBondSet );

        var a1, a2;

        f.eachResidueN( 2, function( r1, r2 ){

            a1 = r1.getAtomByName( f.trace_atomname );
            a2 = r2.getAtomByName( f.trace_atomname );

            if( test( a1 ) && test( a2 ) ){

                backboneAtomSet.addAtom( a1 );
                backboneBondSet.addBond( a1, a2, true );

            }

        } );

        if( test( a1 ) && test( a2 ) ){

            backboneAtomSet.addAtom( a2 );

        }

        sphereBuffer = new NGL.SphereBuffer(
            backboneAtomSet.atomPosition(),
            backboneAtomSet.atomColor(),
            backboneAtomSet.atomRadius( null, size, null ),
            backboneAtomSet.atomColor( null, "picking" )
        );

        cylinderBuffer = new NGL.CylinderBuffer(
            backboneBondSet.bondPosition( null, 0 ),
            backboneBondSet.bondPosition( null, 1 ),
            backboneBondSet.bondColor( null, 0 ),
            backboneBondSet.bondColor( null, 1 ),
            backboneBondSet.bondRadius( null, 0, size, null ),
            null,
            null,
            backboneBondSet.bondColor( null, 0, "picking" ),
            backboneBondSet.bondColor( null, 1, "picking" )
        );

        bufferList.push( sphereBuffer )
        bufferList.push( cylinderBuffer );

    } );

    this.bufferList = bufferList;
    this.atomSetList = atomSetList;
    this.bondSetList = bondSetList;

};

NGL.BackboneRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );
    
    var backboneAtomSet, backboneBondSet;
    var sphereBuffer, cylinderBuffer;

    var i;
    var n = this.atomSetList.length;

    for( i = 0; i < n; ++i ){

        backboneAtomSet = this.atomSetList[ i ];
        backboneBondSet = this.bondSetList[ i ];

        sphereBuffer = this.bufferList[ i * 2 ];
        cylinderBuffer = this.bufferList[ i * 2 + 1 ];

        sphereBuffer.setAttributes({
            position: backboneAtomSet.atomPosition()
        });

        var from = backboneBondSet.bondPosition( null, 0 );
        var to = backboneBondSet.bondPosition( null, 1 );

        cylinderBuffer.setAttributes({
            position: NGL.Utils.calculateCenterArray( from, to ),
            position1: from,
            position2: to
        });

    }

};


NGL.TubeRepresentation = function( structure, viewer, sele, size, subdiv ){

    this.size = size || 0.25;
    this.subdiv = subdiv || 10;

    NGL.Representation.call( this, structure, viewer, sele );

};

NGL.TubeRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.TubeRepresentation.prototype.name = "tube";

NGL.TubeRepresentation.prototype.create = function(){

    var scope = this;

    this.bufferList = [];
    this.fiberList = [];

    this.structure.eachFiber( function( fiber ){

        if( fiber.residueCount < 4 ) return;

        var spline = new NGL.Spline( fiber );
        var sub = spline.getSubdividedPosition( scope.subdiv );

        var rx = 1.5;
        var ry = 0.5;

        if( fiber.isCg() ){
            ry = 1.5;
        }

        scope.bufferList.push(

            new NGL.TubeMeshBuffer(
                sub.position,
                sub.normal,
                sub.binormal,
                sub.tangent,
                sub.color,
                sub.size,
                12,
                sub.pickingColor,
                rx,
                ry
            )

        );

        scope.fiberList.push( fiber );

    }, this.selection, true );

};

NGL.TubeRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    var i = 0;
    var n = this.fiberList.length;

    // console.time( this.name, "update" );

    for( i = 0; i < n; ++i ){

        var fiber = this.fiberList[ i ]

        if( fiber.residueCount < 4 ) return;

        var spline = new NGL.Spline( fiber );
        var sub = spline.getSubdividedPosition( this.subdiv );

        this.bufferList[ i ].setAttributes({
            "position": sub.position,
            "normal": sub.normal,
            "binormal": sub.binormal,
            "tangent": sub.tangent,
            "size": sub.size
        });

    };

    // console.timeEnd( this.name, "update" );

};


NGL.RibbonRepresentation = function( structure, viewer, sele, size, subdiv ){

    this.size = size || 0.25;
    this.subdiv = subdiv || 10;

    NGL.Representation.call( this, structure, viewer, sele );

};

NGL.RibbonRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.RibbonRepresentation.prototype.name = "ribbon";

NGL.RibbonRepresentation.prototype.create = function(){

    var scope = this;

    this.bufferList = [];
    this.fiberList = [];

    this.structure.eachFiber( function( fiber ){

        if( fiber.residueCount < 4 ) return;

        var spline = new NGL.Spline( fiber );
        var sub = spline.getSubdividedPosition( scope.subdiv );
        
        scope.bufferList.push(

            new NGL.RibbonBuffer(
                sub.position,
                sub.binormal,
                sub.normal,
                sub.color,
                sub.size,
                sub.pickingColor
            )

        );

        scope.fiberList.push( fiber );

    }, this.selection, true );

};

NGL.RibbonRepresentation.prototype.update = function(){

    NGL.TraceRepresentation.prototype.update.call( this );

};


NGL.TraceRepresentation = function( structure, viewer, sele, subdiv ){

    this.subdiv = subdiv || 10;

    NGL.Representation.call( this, structure, viewer, sele );

};

NGL.TraceRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.TraceRepresentation.prototype.name = "trace";

NGL.TraceRepresentation.prototype.create = function(){

    var scope = this;

    this.bufferList = [];
    this.fiberList = [];

    this.structure.eachFiber( function( fiber ){

        if( fiber.residueCount < 4 ) return;

        var spline = new NGL.Spline( fiber );
        var sub = spline.getSubdividedPosition( scope.subdiv );

        scope.bufferList.push( new NGL.TraceBuffer( sub.position, sub.color ) );
        scope.fiberList.push( fiber );

    }, this.selection, true );

};

NGL.TraceRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    var i = 0;
    var n = this.fiberList.length;

    for( i = 0; i < n; ++i ){

        var fiber = this.fiberList[ i ]

        if( fiber.residueCount < 4 ) return;

        var spline = new NGL.Spline( fiber );
        var sub = spline.getSubdividedPosition( this.subdiv );

        this.bufferList[ i ].setAttributes({
            "position": sub.position
        });

    };

};


NGL.Spline = function( fiber ){

    this.fiber = fiber;
    this.size = fiber.residueCount - 2;
    this.trace_atomname = fiber.trace_atomname;
    this.direction_atomname1 = fiber.direction_atomname1;
    this.direction_atomname2 = fiber.direction_atomname2;

};

NGL.Spline.prototype = {

    // from THREE.js
    // ASR added tension
    interpolate: function( p0, p1, p2, p3, t ) {

        var tension = 0.9;

        var v0 = ( p2 - p0 ) * tension;
        var v1 = ( p3 - p1 ) * tension;
        var t2 = t * t;
        var t3 = t * t2;
        return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 +
               ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 +
               v0 * t + p1;

    },

    getSubdividedPosition: function( m ){

        var trace_atomname = this.trace_atomname;
        var direction_atomname1 = this.direction_atomname1;
        var direction_atomname2 = this.direction_atomname2;
        var n = this.size;
        var n1 = n - 1;

        var pos = new Float32Array( n1 * m * 3 + 3 );
        var col = new Float32Array( n1 * m * 3 + 3 );
        var tan = new Float32Array( n1 * m * 3 + 3 );
        var norm = new Float32Array( n1 * m * 3 + 3 );
        var bin = new Float32Array( n1 * m * 3 + 3 );
        var size = new Float32Array( n1 * m + 1 );
        var pcol = new Float32Array( n1 * m * 3 + 3 );

        var subdivideData = this._makeSubdivideData( m, trace_atomname );

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            subdivideData( r1, r2, r3, r4, pos, col, tan, norm, bin, size, pcol );

        } );

        var rn = this.fiber.residues[ n ];

        var can = rn.getAtomByName( trace_atomname );

        pos[ n1 * m * 3 + 0 ] = can.x;
        pos[ n1 * m * 3 + 1 ] = can.y;
        pos[ n1 * m * 3 + 2 ] = can.z;

        return {

            "position": pos,
            "color": col,
            "tangent": tan,
            "normal": norm,
            "binormal": bin,
            "size": size,
            "pickingColor": pcol

        }

    },

    _makeSubdivideData: function( m ){

        m = m || 10;

        var elemColors = NGL.ElementColors;
        var trace_atomname = this.trace_atomname;
        var direction_atomname1 = this.direction_atomname1;
        var direction_atomname2 = this.direction_atomname2;
        var interpolate = this.interpolate;
        var getTangent = this._makeGetTangent();

        var dt = 1.0 / m;
        var c = new THREE.Color();
        var pc = new THREE.Color();
        var a1, a2, a3, a4;
        var j, l, d;
        var k = 0;
        var scale = 1;

        var vTmp = new THREE.Vector3();

        var vPos2 = new THREE.Vector3();
        var vDir2 = new THREE.Vector3();
        var vNorm2 = new THREE.Vector3();

        var vPos3 = new THREE.Vector3();
        var vDir3 = new THREE.Vector3();
        var vNorm3 = new THREE.Vector3();

        var vDir = new THREE.Vector3();
        var vNorm = new THREE.Vector3();

        var vTang = new THREE.Vector3();
        var vBin = new THREE.Vector3();

        var first = true;

        return function( r1, r2, r3, r4, pos, col, tan, norm, bin, size, pcol ){

            a1 = r1.getAtomByName( trace_atomname );
            a2 = r2.getAtomByName( trace_atomname );
            a3 = r3.getAtomByName( trace_atomname );
            a4 = r4.getAtomByName( trace_atomname );

            // c.setRGB( Math.random(), Math.random(), Math.random() );
            // c.setHex( elemColors[ a2.element ] || 0xCCCCCC );

            if( a2.ss === "h" ){
                c.setHex( 0xFF0080 );
                scale = 0.5;
            }else if( a2.ss === "s" ){
                c.setHex( 0xFFC800 );
                scale = 0.5;
            }else if( a2.atomname === "P" ){
                c.setHex( 0xAE00FE );
                scale = 0.8;
            }else{
                c.setHex( 0xFFFFFF );
                scale = 0.15;
            }
            
            if( pcol ){
                pc.setHex( a2.globalindex + 1 );
            }

            if( trace_atomname === direction_atomname1 ){

                if( first ){
                    vDir2.set( 0, 0, 1 );
                    vNorm2.copy( a1 ).sub( a3 ).cross( vDir2 ).normalize();
                    first = false;
                }

                vDir3.set( 0, 0, 1 );

            }else{

                if( first ){
                    cAtom = r2.getAtomByName( direction_atomname1 );
                    oAtom = r2.getAtomByName( direction_atomname2 );
                    vTmp.copy( cAtom );
                    vDir2.copy( oAtom ).sub( vTmp ).normalize();
                    vNorm2.copy( a1 ).sub( a3 ).cross( vDir2 ).normalize();
                    first = false;
                }

                cAtom = r3.getAtomByName( direction_atomname1 );
                oAtom = r3.getAtomByName( direction_atomname2 );
                vTmp.copy( cAtom );
                vPos3.copy( a3 );
                vDir3.copy( oAtom ).sub( vTmp ).normalize();

            }

            // ensure the direction vector does not flip
            if( vDir2.dot( vDir3 ) < 0 ) vDir3.multiplyScalar( -1 );

            for( j = 0; j < m; ++j ){

                d = dt * j
                d1 = 1 - d;
                l = k + j * 3;

                pos[ l + 0 ] = interpolate( a1.x, a2.x, a3.x, a4.x, d );
                pos[ l + 1 ] = interpolate( a1.y, a2.y, a3.y, a4.y, d );
                pos[ l + 2 ] = interpolate( a1.z, a2.z, a3.z, a4.z, d );

                col[ l + 0 ] = c.r;
                col[ l + 1 ] = c.g;
                col[ l + 2 ] = c.b;

                if( pcol ){
                    pcol[ l + 0 ] = pc.r;
                    pcol[ l + 1 ] = pc.g;
                    pcol[ l + 2 ] = pc.b;
                }

                vNorm.set(
                    d1 * vDir2.x + d * vDir3.x,
                    d1 * vDir2.y + d * vDir3.y,
                    d1 * vDir2.z + d * vDir3.z
                ).normalize();
                norm[ l + 0 ] = vNorm.x;
                norm[ l + 1 ] = vNorm.y;
                norm[ l + 2 ] = vNorm.z;

                getTangent( a1, a2, a3, a4, d, vTang );
                tan[ l + 0 ] = vTang.x;
                tan[ l + 1 ] = vTang.y;
                tan[ l + 2 ] = vTang.z;
                
                vBin.copy( vNorm ).cross( vTang ).normalize();
                bin[ l + 0 ] = vBin.x;
                bin[ l + 1 ] = vBin.y;
                bin[ l + 2 ] = vBin.z;

                vNorm.copy( vTang ).cross( vBin ).normalize();
                norm[ l + 0 ] = vNorm.x;
                norm[ l + 1 ] = vNorm.y;
                norm[ l + 2 ] = vNorm.z;

                size[ k / 3 + j ] = scale;

            }

            k += 3 * m;

            vDir2.copy( vDir3 );

        };

    },

    getPoint: function( a1, a2, a3, a4, t, v ){

        v.x = NGL.Spline.prototype.interpolate( a1.x, a2.x, a3.x, a4.x, t );
        v.y = NGL.Spline.prototype.interpolate( a1.y, a2.y, a3.y, a4.y, t );
        v.z = NGL.Spline.prototype.interpolate( a1.z, a2.z, a3.z, a4.z, t );

        return v;

    },

    _makeGetTangent: function(){

        var getPoint = this.getPoint;

        var p1 = new THREE.Vector3();
        var p2 = new THREE.Vector3();

        return function( a1, a2, a3, a4, t, v ){

            var delta = 0.0001;
            var t1 = t - delta;
            var t2 = t + delta;

            // Capping in case of danger

            if ( t1 < 0 ) t1 = 0;
            if ( t2 > 1 ) t2 = 1;

            getPoint( a1, a2, a3, a4, t1, p1 );
            getPoint( a1, a2, a3, a4, t2, p2 );

            return v.copy( p2 ).sub( p1 ).normalize();

        };

    }

};


NGL.representationTypes = {

    "spacefill":    NGL.SpacefillRepresentation,
    "ball+stick":   NGL.BallAndStickRepresentation,
    "licorice":     NGL.LicoriceRepresentation,
    "hyperball":    NGL.HyperballRepresentation,
    "line":         NGL.LineRepresentation,
    "backbone":     NGL.BackboneRepresentation,
    "tube":         NGL.TubeRepresentation,
    "ribbon":       NGL.RibbonRepresentation,
    "trace":        NGL.TraceRepresentation,

};













