/**
 * @file Extra
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */



NGL.getNextAvailablePropertyName = function( name, o ){

    var i = 1;
    var baseName = name;

    while( true ){

        if( o.hasOwnProperty( name ) ){

            name = baseName + " (" + (i++) + ")";

        }else{

            return name;

        }

    }

};


////////////
// Surface

NGL.initSurface = function( object, viewer, name ){

    if( object instanceof THREE.Geometry ){

        geo = object;

        // TODO check if needed
        geo.computeFaceNormals( true );
        geo.computeVertexNormals( true );

    }else{

        geo = object.children[0].geometry;

    }

    var position = NGL.Utils.positionFromGeometry( geo );
    var color = NGL.Utils.colorFromGeometry( geo );
    var index = NGL.Utils.indexFromGeometry( geo );
    var normal = NGL.Utils.normalFromGeometry( geo );

    surface = new NGL.MeshBuffer( position, color, index, normal );

    viewer.add( surface );
    viewer.render();

    return surface;

}


///////////
// Loader

NGL.FileLoader = function ( manager ) {

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


NGL.PdbLoader = function ( manager ) {

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.PdbLoader.prototype = Object.create( THREE.XHRLoader.prototype );

NGL.PdbLoader.prototype.init = function( str, viewer, name ){

    var pdb = new NGL.PdbStructure( name, viewer );

    pdb.parse( str );
    pdb.initGui();

    return pdb

};


NGL.GroLoader = function ( manager ) {

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.GroLoader.prototype = Object.create( THREE.XHRLoader.prototype );

NGL.GroLoader.prototype.init = function( str, viewer, name ){

    var gro = new NGL.GroStructure( name, viewer );

    gro.parse( str );
    gro.initGui();

    return gro

};


NGL.ObjLoader = function ( manager ) {

    // this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ObjLoader.prototype = Object.create( THREE.OBJLoader.prototype );

NGL.ObjLoader.prototype.init = function( data, viewer, name ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    return NGL.initSurface( data, viewer, name );

};


NGL.PlyLoader = function ( manager ) {

    // this.cache = new THREE.Cache();
    // this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.PlyLoader.prototype = Object.create( THREE.PLYLoader.prototype );

NGL.PlyLoader.prototype.init = function( data, viewer, name ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    return NGL.initSurface( data, viewer, name );

};


NGL.autoLoad = function(){

    var loaders = {

        "gro": NGL.GroLoader,
        "pdb": NGL.PdbLoader,

        "obj": NGL.ObjLoader,
        "ply": NGL.PlyLoader,

    }

    return function( file, viewer, onLoad ){

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

            object = loader.init( data, viewer, name );

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

NGL.Representation = function( structure, sele ){

    this.structure = structure;

    this.viewer = structure.viewer;

    this.atomSet = structure.atomSet;
    this.bondSet = structure.bondSet;

    if( sele ){

        this.selection = new NGL.Selection( sele );
        this.applySelection();

    }

    this.create();
    this.finalize();

};

NGL.Representation.prototype = {

    constructor: NGL.Representation,

    name: "",

    applySelection: function(){

        var na = this.structure.atomSet.size;
        var atoms = this.structure.atomSet.atoms;

        var selectionTest = this.selection.makeTest();

        var selectionAtoms = [];

        var a;

        for( var i = 0; i < na; ++i ){

            a = atoms[ i ];

            if( selectionTest( a ) ) selectionAtoms.push( a );

        }

        // TODO filter bonds instead of re-calculationg

        this.atomSet = new NGL.AtomSet( selectionAtoms );
        this.bondSet = new NGL.BondSet( this.atomSet );

    },

    finalize: function(){

        this.attach();
        this.initGui();

    },

    create: function(){

        this.bufferList = [];

    },

    update: function(){

        if( this.selection ){

            this.applySelection();

        }

    },

    attach: function(){

        var viewer = this.viewer;

        this.bufferList.forEach( function( buffer ){

            viewer.add( buffer );

        });

    },

    toggle: function(){

        this.bufferList.forEach( function( buffer ){

            buffer.mesh.visible = !buffer.mesh.visible;

        });

        this.viewer.render();

    },

    dispose: function(){

        viewer = this.viewer;

        this.bufferList.forEach( function( buffer ){

            buffer.remove();
            viewer.remove( buffer );

        });

        this.structure.remove( this );

        this.structure.gui.removeFolder( this.__guiName );

    },

    initGui: function(){

        this.__guiName = NGL.getNextAvailablePropertyName(
            this.name, this.structure.gui.__folders
        );

        this.gui = this.structure.gui.addFolder( this.__guiName );

        this.gui.add( this, 'toggle' );
        this.gui.add( this, 'dispose' );

        var params = { "sele": "" };

        if( this.selection ) params.sele = this.selection.selectionStr;

        var oldSele = "";

        this.gui.add( params, 'sele' ).listen().onFinishChange( function( sele ){

            if( sele===oldSele ) return;
            oldSele = sele;

            this.selection = new NGL.Selection( sele );
            this.applySelection();

            viewer = this.viewer;

            this.bufferList.forEach( function( buffer ){

                buffer.remove();
                viewer.remove( buffer );

            });

            this.create();
            this.attach();

        }.bind( this ) );

    }

};


NGL.SpacefillRepresentation = function( structure, sele, scale ){

    this.scale = scale || 1.0;

    NGL.Representation.call( this, structure, sele );

};

NGL.SpacefillRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.SpacefillRepresentation.prototype.name = "spacefill";

NGL.SpacefillRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.structure.atomPosition( this.selection ),
        this.structure.atomColor( this.selection ),
        this.structure.atomRadius( this.selection, null, this.scale )
    );

    this.bufferList = [ this.sphereBuffer ];

};

NGL.SpacefillRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    this.sphereBuffer.setAttributes({
        position: this.structure.atomPosition( this.selection )
    });

};


NGL.BallAndStickRepresentation = function( structure, sele, sphereScale, cylinderSize ){

    this.sphereScale = sphereScale || 0.2;
    this.cylinderSize = cylinderSize || 0.12;

    NGL.Representation.call( this, structure, sele );

};

NGL.BallAndStickRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.BallAndStickRepresentation.prototype.name = "ball+stick";

NGL.BallAndStickRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.structure.atomPosition( this.selection ),
        this.structure.atomColor( this.selection ),
        this.structure.atomRadius( this.selection, null, this.sphereScale )
    );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        this.bondSet.from,
        this.bondSet.to,
        this.bondSet.getColor( 0 ),
        this.bondSet.getColor( 1 ),
        this.bondSet.getRadius( null, this.cylinderSize, null )
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.BallAndStickRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    if( this.selection ){

        this.applySelection();

    }

    this.sphereBuffer.setAttributes({
        position: this.atomSet.position
    });

    this.cylinderBuffer.setAttributes({
        position: NGL.Utils.calculateCenterArray(
            this.bondSet.from, this.bondSet.to
        ),
        position1: this.bondSet.from,
        position2: this.bondSet.to
    });

};


NGL.LicoriceRepresentation = function( structure, sele, size ){

    this.size = size || 0.15;

    NGL.Representation.call( this, structure, sele );

};

NGL.LicoriceRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.LicoriceRepresentation.prototype.name = "licorice";

NGL.LicoriceRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.atomSet.position,
        this.atomSet.getColor(),
        this.atomSet.getRadius( this.size, null )
    );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        this.bondSet.from,
        this.bondSet.to,
        this.bondSet.getColor( 0 ),
        this.bondSet.getColor( 1 ),
        this.bondSet.getRadius( null, this.size, null )
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.LicoriceRepresentation.prototype.update = function(){

    NGL.BallAndStickRepresentation.prototype.update.call( this );

};


NGL.LineRepresentation = function( structure, sele ){

    NGL.Representation.call( this, structure, sele );

};

NGL.LineRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.LineRepresentation.prototype.name = "line";

NGL.LineRepresentation.prototype.create = function(){

    this.lineBuffer = new NGL.LineBuffer(
        this.bondSet.from,
        this.bondSet.to,
        this.bondSet.getColor( 0 ),
        this.bondSet.getColor( 1 )
    );

    this.bufferList = [ this.lineBuffer ];

};

NGL.LineRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    this.lineBuffer.setAttributes({
        from: this.bondSet.from,
        to: this.bondSet.to
    });

};


NGL.HyperballRepresentation = function( structure, sele, scale, shrink ){

    this.scale = scale || 0.2;
    this.shrink = shrink || 0.12;

    NGL.Representation.call( this, structure, sele );

};

NGL.HyperballRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.HyperballRepresentation.prototype.name = "hyperball";

NGL.HyperballRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.atomSet.position,
        this.atomSet.getColor(),
        this.atomSet.getRadius( null, this.scale )
    );

    this.cylinderBuffer = new NGL.HyperballStickBuffer(
        this.bondSet.from,
        this.bondSet.to,
        this.bondSet.getColor( 0 ),
        this.bondSet.getColor( 1 ),
        this.bondSet.getRadius( 0, null, this.scale ),
        this.bondSet.getRadius( 1, null, this.scale ),
        this.shrink
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.HyperballRepresentation.prototype.update = function(){

    NGL.BallAndStickRepresentation.prototype.update.call( this );

};


NGL.BackboneRepresentation = function( structure, sele, size ){

    this.size = size || 0.25;

    NGL.Representation.call( this, structure, sele );

};

NGL.BackboneRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.BackboneRepresentation.prototype.name = "backbone";

NGL.BackboneRepresentation.prototype.create = function(){

    this.makeBackboneSets();

    this.sphereBuffer = new NGL.SphereBuffer(
        this.backboneAtomSet.position,
        this.backboneAtomSet.getColor(),
        this.backboneAtomSet.getRadius( this.size, null )
    );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        this.backboneBondSet.from,
        this.backboneBondSet.to,
        this.backboneBondSet.getColor( 0 ),
        this.backboneBondSet.getColor( 1 ),
        this.backboneBondSet.getRadius( null, this.size, null )
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.BackboneRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    this.makeBackboneSets();

    this.sphereBuffer.setAttributes({
        position: this.backboneAtomSet.position
    });

    this.cylinderBuffer.setAttributes({
        position: NGL.Utils.calculateCenterArray(
            this.backboneBondSet.from, this.backboneBondSet.to
        ),
        position1: this.backboneBondSet.from,
        position2: this.backboneBondSet.to
    });

};

NGL.BackboneRepresentation.prototype.makeBackboneSets = function(){

    var backbone = NGL.makeBackboneSets( this.atomSet );

    this.backboneAtomSet = backbone.atomSet;
    this.backboneBondSet = backbone.bondSet;

};


NGL.TubeRepresentation = function( structure, sele, size ){

    this.size = size || 0.25;

    NGL.Representation.call( this, structure, sele );

};

NGL.TubeRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.TubeRepresentation.prototype.name = "tube";

NGL.TubeRepresentation.prototype.create = function(){

    this.makeBackboneSets();

    var pd = NGL.getPathData(
        this.backboneAtomSet.position,
        this.backboneAtomSet.getColor(),
        this.backboneAtomSet.getRadius( this.size, null ),
        3
    );

    this.tubeBuffer = new NGL.TubeImpostorBuffer(
        pd.position,
        pd.normal,
        pd.dir,
        pd.color,
        pd.size
    );

    // this.bufferList = [ this.tubeBuffer ];

    this.tubebuffer2 = new NGL.TubeGroup(
        this.backboneAtomSet.position,
        this.backboneAtomSet.getColor(),
        this.backboneAtomSet.getRadius( this.size, null ),
        3
    );

    this.bufferList = [ this.tubebuffer2 ];

};

NGL.TubeRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    // TODO

};

NGL.TubeRepresentation.prototype.makeBackboneSets = function(){

    var backbone = NGL.makeBackboneSets( this.atomSet );

    this.backboneAtomSet = backbone.atomSet;
    this.backboneBondSet = backbone.bondSet;

};


NGL.RibbonRepresentation = function( structure, sele, size ){

    this.size = size || 0.25;

    NGL.Representation.call( this, structure, sele );

};

NGL.RibbonRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.RibbonRepresentation.prototype.name = "ribbon";

NGL.RibbonRepresentation.prototype.create = function(){

    this.makeBackboneSets();

    var pd = NGL.getPathData(
        this.backboneAtomSet.position,
        this.backboneAtomSet.getColor(),
        this.backboneAtomSet.getRadius( this.size, null ),
        3
    );

    this.ribbonBuffer = new NGL.RibbonBuffer(
        pd.position,
        pd.normal,
        pd.dir,
        pd.color,
        pd.size
    );

    this.bufferList = [ this.ribbonBuffer ];

};

NGL.RibbonRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    // TODO

};

NGL.RibbonRepresentation.prototype.makeBackboneSets = function(){

    var backbone = NGL.makeBackboneSets( this.atomSet );

    this.backboneAtomSet = backbone.atomSet;
    this.backboneBondSet = backbone.bondSet;

};


NGL.TraceRepresentation = function( structure, sele ){

    NGL.Representation.call( this, structure, sele );

};

NGL.TraceRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.TraceRepresentation.prototype.name = "trace";

NGL.TraceRepresentation.prototype.create = function(){

    var bufferList = [];

    var c, pos, col;
    var elemColors = NGL.ElementColors;

    var selection = new NGL.Selection( ".CA .P" );

    this.structure.eachChain( function( c ){

        pos = c.atomPosition( selection );
        col = c.atomColor( selection );

        if( !pos || pos.length/3 < 4 ) return;

        var sub = 10;

        var spline = new NGL.Spline( pos );
        var subPos = spline.getSubdividedPosition( sub );
        var subCol = NGL.Utils.replicateArray3Entries(
            // NGL.Utils.randomColorArray( pos.length / 3 ),
            col,
            sub
        );

        bufferList.push( new NGL.TraceBuffer( subPos, subCol ) );

    } );

    this.bufferList = bufferList;

};

NGL.TraceRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    // TODO

};


// Or better name it BioSpline?
NGL.Spline = function( position ){

    this.position = position;
    this.size = position.length / 3;

    // FIXME handle less than two positions

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

        var n = this.size;
        var n1 = n - 1;
        var n2 = n - 2;
        var n3 = n - 3;
        var n13 = n1 * 3;
        var n23 = n2 * 3;
        var n33 = n3 * 3;

        var pos = this.position;
        var interpolate = this.interpolate;

        var dt = 1.0 / m;
        var subPos = new Float32Array( n1 * m * 3 + 3 );

        // ghost point for initial position
        var p0x = pos[ 0 + 0 ] + ( pos[ 3 + 0 ] - pos[ 0 + 0 ] );
        var p0y = pos[ 0 + 1 ] + ( pos[ 3 + 1 ] - pos[ 0 + 1 ] );
        var p0z = pos[ 0 + 2 ] + ( pos[ 3 + 2 ] - pos[ 0 + 2 ] );

        var p1x = pos[ 0 + 0 ];
        var p1y = pos[ 0 + 1 ];
        var p1z = pos[ 0 + 2 ];

        var p2x = pos[ 3 + 0 ];
        var p2y = pos[ 3 + 1 ];
        var p2z = pos[ 3 + 2 ];

        var p3x, p3y, p3z;

        var i, j, k, l;

        for( i = 0; i < n1; ++i ){

            k = i * m * 3;
            v = ( i + 2 ) * 3;

            if( i === n2 ){
                // ghost point for last position
                p3x = pos[ n13 + 0 ] + ( pos[ n13 + 0 ] - pos[ n23 + 0 ] );
                p3y = pos[ n13 + 1 ] + ( pos[ n13 + 1 ] - pos[ n23 + 1 ] );
                p3z = pos[ n13 + 2 ] + ( pos[ n13 + 2 ] - pos[ n23 + 2 ] );
            }else{
                p3x = pos[ v + 0 ];
                p3y = pos[ v + 1 ];
                p3z = pos[ v + 2 ];
            }

            for( j = 0; j < m; ++j ){

                l = k + j * 3;

                subPos[ l + 0 ] = interpolate( p0x, p1x, p2x, p3x, dt * j );
                subPos[ l + 1 ] = interpolate( p0y, p1y, p2y, p3y, dt * j );
                subPos[ l + 2 ] = interpolate( p0z, p1z, p2z, p3z, dt * j );

            }

            p0x = p1x; p0y = p1y; p0z = p1z;
            p1x = p2x; p1y = p2y; p1z = p2z;
            p2x = p3x; p2y = p3y; p2z = p3z;

        }

        // add last position to the array of subdivided positions
        subPos[ n1 * m * 3 + 0 ] = pos[ n13 + 0 ];
        subPos[ n1 * m * 3 + 1 ] = pos[ n13 + 1 ];
        subPos[ n1 * m * 3 + 2 ] = pos[ n13 + 2 ];

        return subPos;

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













