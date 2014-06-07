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

            this.applySelection( sele );

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
        this.atomSet.atomPosition(),
        this.atomSet.atomColor(),
        this.atomSet.atomRadius( null, null, this.scale )
    );

    this.bufferList = [ this.sphereBuffer ];

};

NGL.SpacefillRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    this.sphereBuffer.setAttributes({
        position: this.atomSet.atomPosition()
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
        this.atomSet.atomPosition(),
        this.atomSet.atomColor(),
        this.atomSet.atomRadius( null, null, this.sphereScale )
    );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        this.atomSet.bondPosition( null, 0 ),
        this.atomSet.bondPosition( null, 1 ),
        this.atomSet.bondColor( null, 0 ),
        this.atomSet.bondColor( null, 1 ),
        this.atomSet.bondRadius( null, null, this.cylinderSize, null )
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
        this.atomSet.atomPosition(),
        this.atomSet.atomColor(),
        this.atomSet.atomRadius( null, this.size, null )
    );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        this.atomSet.bondPosition( null, 0 ),
        this.atomSet.bondPosition( null, 1 ),
        this.atomSet.bondColor( null, 0 ),
        this.atomSet.bondColor( null, 1 ),
        this.atomSet.bondRadius( null, null, this.size, null )
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
        this.atomSet.bondPosition( null, 0 ),
        this.atomSet.bondPosition( null, 1 ),
        this.atomSet.bondColor( null, 0 ),
        this.atomSet.bondColor( null, 1 )
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
        this.atomSet.atomPosition(),
        this.atomSet.atomColor(),
        this.atomSet.atomRadius( null, null, this.scale )
    );

    this.cylinderBuffer = new NGL.HyperballStickBuffer(
        this.atomSet.bondPosition( null, 0 ),
        this.atomSet.bondPosition( null, 1 ),
        this.atomSet.bondColor( null, 0 ),
        this.atomSet.bondColor( null, 1 ),
        this.atomSet.bondRadius( null, 0, this.cylinderSize, this.scale ),
        this.atomSet.bondRadius( null, 1, this.cylinderSize, this.scale ),
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

    var bufferList = [];

    var c, pos, col, caAtom, oAtom, prev, dot;
    var elemColors = NGL.ElementColors;

    var vPos = new THREE.Vector3();
    var vC = new THREE.Vector3();
    var vNorm = new THREE.Vector3();
    var vDir = new THREE.Vector3();

    var vPosPrev = new THREE.Vector3();
    var vNormPrev = new THREE.Vector3();
    var vDirPrev = new THREE.Vector3();

    var selection = new NGL.Selection( ".CA .P" );

    this.structure.eachChain( function( c ){

        var subPos = [];
        var subNorm = [];
        var subDir = [];
        var subCol = [];
        var subSize = [];

        prev = false;

        c.eachResidue( function( r ){

            caAtom = r.getAtomByName( "CA" );
            cAtom = r.getAtomByName( "C" );
            oAtom = r.getAtomByName( "O" );

            if( !caAtom || !cAtom || !oAtom ){

                prev = false;
                return;

            }

            vPos.set( caAtom.x, caAtom.y, caAtom.z );
            vC.set( cAtom.x, cAtom.y, cAtom.z );
            vDir.set( oAtom.x, oAtom.y, oAtom.z ).sub( vC ).normalize();

            // ensure the direction vector does not flip
            if( vDir.dot( vDirPrev ) < 0 ) vDir.multiplyScalar( -1 );

            vNorm.copy( vPos ).sub( vPosPrev ).cross( vDir ).normalize();

            if( prev ){

                // console.log( caAtom.resno )

                subPos.push( caAtom.x );
                subPos.push( caAtom.y );
                subPos.push( caAtom.z );

                subNorm.push( vNorm.x );
                subNorm.push( vNorm.y );
                subNorm.push( vNorm.z );

                subDir.push( -vDir.x );
                subDir.push( -vDir.y );
                subDir.push( -vDir.z );

                subCol.push( 1.0 );
                subCol.push( 0.0 );
                subCol.push( 0.0 );

                subSize.push( 1.0 );

            }

            vPosPrev.copy( vPos );
            vNormPrev.copy( vNorm );
            vDirPrev.copy( vDir );

            prev = true;

        } );

        bufferList.push(

            new NGL.RibbonBuffer(
                new Float32Array( subPos ),
                new Float32Array( subNorm ),
                new Float32Array( subDir ),
                new Float32Array( subCol ),
                new Float32Array( subSize )
            )

        );

    } );

    this.bufferList = bufferList;

    /*this.makeBackboneSets();

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

    this.bufferList = [ this.ribbonBuffer ];*/

};

NGL.RibbonRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    // TODO

};


NGL.TraceRepresentation = function( structure, sele ){

    NGL.Representation.call( this, structure, sele );

};

NGL.TraceRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.TraceRepresentation.prototype.name = "trace";

NGL.TraceRepresentation.prototype.create = function(){

    var bufferList = [];
    var subdiv = 10;

    this.structure.eachFiber( function( f ){

        // console.log( f.residueCount, f.residues[ 0 ].resno, f.residues[ 0 ].resname );

        var spline = new NGL.Spline( f );
        var sub = spline.getSubdividedPosition( subdiv );

        bufferList.push( new NGL.TraceBuffer( sub.pos, sub.col ) );

    } );

    // this.structure.eachChain( function( c ){

    //     var spline = new NGL.Spline( c );
    //     var sub = spline.getSubdividedPosition( subdiv );

    //     bufferList.push( new NGL.TraceBuffer( sub.pos, sub.col ) );

    // } );

    this.bufferList = bufferList;

};

NGL.TraceRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    // TODO

};


// Or better name it BioSpline?
NGL.Spline = function( fiber ){

    this.fiber = fiber;
    this.size = fiber.residueCount;
    this.atomname = fiber.atomname;

    // FIXME handle less than two atoms

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

        var atomname = this.atomname;
        var n = this.size;
        var n1 = n - 1;

        var pos = new Float32Array( n1 * m * 3 + 3 );
        var col = new Float32Array( n1 * m * 3 + 3 );
        var dir = new Float32Array( n1 * m * 3 + 3 );
        var norm = new Float32Array( n1 * m * 3 + 3 );
        var size = new Float32Array( n1 * m + 1 );

        var subdivideData = this._makeSubdivideData( m, atomname );

        subdivideData(
            this.fiber.residues[ 0 ],
            this.fiber.residues[ 0 ],
            this.fiber.residues[ 1 ],
            this.fiber.residues[ 2 ],
            pos, col, dir, norm, size
        );

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            subdivideData( r1, r2, r3, r4, pos, col, dir, norm, size );

        } );

        var rn1 = this.fiber.residues[ n1 ];

        subdivideData(
            this.fiber.residues[ n1 - 2 ],
            this.fiber.residues[ n1 - 1 ],
            rn1,
            rn1,
            pos, col, dir, norm, size
        );

        var can1 = rn1.getAtomByName( atomname );

        pos[ n1 * m * 3 + 0 ] = can1.x;
        pos[ n1 * m * 3 + 1 ] = can1.y;
        pos[ n1 * m * 3 + 2 ] = can1.z;

        return {

            "pos": pos,
            "col": col,
            "dir": dir,
            "norm": norm,
            "size": size

        }

    },

    _makeSubdivideData: function( m ){

        m = m || 10;

        var elemColors = NGL.ElementColors;
        var atomname = this.atomname
        var interpolate = this.interpolate;
        var dt = 1.0 / m;
        var c = new THREE.Color();
        var a1, a2, a3, a4;
        var j, l;
        var k = 0;

        return function( r1, r2, r3, r4, pos, col, dir, norm, size ){

            a1 = r1.getAtomByName( atomname );
            a2 = r2.getAtomByName( atomname );
            a3 = r3.getAtomByName( atomname );
            a4 = r4.getAtomByName( atomname );

            // c.setRGB( Math.random(), Math.random(), Math.random() );
            c.setHex( elemColors[ a2.element ] || 0xCCCCCC );

            for( j = 0; j < m; ++j ){

                l = k + j * 3;

                pos[ l + 0 ] = interpolate( a1.x, a2.x, a3.x, a4.x, dt * j );
                pos[ l + 1 ] = interpolate( a1.y, a2.y, a3.y, a4.y, dt * j );
                pos[ l + 2 ] = interpolate( a1.z, a2.z, a3.z, a4.z, dt * j );

                col[ l + 0 ] = c.r;
                col[ l + 1 ] = c.g;
                col[ l + 2 ] = c.b;

                size[ k / 3 + j ] = 1.0;

            }

            k += 3 * m;

        }

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













