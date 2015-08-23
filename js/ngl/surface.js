/**
 * @file Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////////
// Surface

NGL.Surface = function( name, path, data ){

    this.name = name;
    this.path = path;
    this.info = {};

    this.center = new THREE.Vector3();
    this.boundingBox = new THREE.Box3();

    if( data instanceof THREE.Geometry ||
        data instanceof THREE.BufferGeometry ||
        data instanceof THREE.Group
    ){

        this.fromGeometry( data );

    }else if( data ){

        this.set(
            data.position,
            data.index,
            data.normal,
            data.color,
            data.atomindex
        );

    }

};

NGL.Surface.prototype = {

    constructor: NGL.Surface,

    set: function( position, index, normal, color, atomindex ){

        this.position = position;
        this.index = index;
        this.normal = normal;
        this.color = color;
        this.atomindex = atomindex;

        this.size = position.length / 3;

    },

    fromGeometry: function( geometry ){

        NGL.time( "NGL.GeometrySurface.fromGeometry" );

        var geo;

        if( geometry instanceof THREE.Geometry ){

            geo = geometry;

            // TODO check if needed
            geo.computeFaceNormals( true );
            geo.computeVertexNormals( true );

        }else if( geometry instanceof THREE.BufferGeometry ){

            geo = geometry;

        }else{

            geo = geometry.children[0].geometry;

        }

        // TODO check if needed
        geo.computeBoundingSphere();
        geo.computeBoundingBox();

        this.center.copy( geo.boundingSphere.center );
        this.boundingBox.copy( geo.boundingBox );

        var position, color, index, normal;

        if( geo instanceof THREE.BufferGeometry ){

            var attr = geo.attributes
            var an = attr.normal ? attr.normal.array : false;

            // assume there are no normals if the first is zero
            if( !an || ( an[ 0 ] === 0 && an[ 1 ] === 0 && an[ 2 ] === 0 ) ){
                geo.computeVertexNormals();
            }

            position = attr.position.array;
            index = attr.index ? attr.index.array : null;
            normal = attr.normal.array;

        }else{

            // FIXME
            NGL.log( "TODO non BufferGeometry surface" );

            position = NGL.Utils.positionFromGeometry( geo );
            index = NGL.Utils.indexFromGeometry( geo );
            normal = NGL.Utils.normalFromGeometry( geo );

        }

        this.set( position, index, normal, color, undefined );

        NGL.timeEnd( "NGL.GeometrySurface.setGeometry" );

    },

    getPosition: function(){

        return this.position;

    },

    getColor: function( params ){

        var p = params || {};

        var n = this.size;
        var array;

        if( this.atomindex ){

            p.volume = this;

            var colorMaker = NGL.ColorMakerRegistry.getScheme( p );

            array = new Float32Array( n * 3 );

            var atoms = p.structure.atoms;
            var atomindex = this.atomindex;

            for( var i = 0, a; i < n; ++i ){

                a = atoms[ atomindex[ i ] ];
                colorMaker.atomColorToArray( a, array, i * 3 );

            }

        }else{

            var tc = new THREE.Color( p.value );

            array = NGL.Utils.uniformArray3( n, tc.r, tc.g, tc.b );

        }

        return array;

    },

    getPickingColor: function( params ){

        var p = Object.assign( params || {} );
        p.scheme = "picking";

        return this.getColor( p );

    },

    getNormal: function(){

        return this.normal;

    },

    getSize: function( size ){

        return NGL.Utils.uniformArray( this.size, size );

    },

    getIndex: function(){

        return this.index;

    },

    getFilteredIndex: function( sele, atoms ){

        if( sele && this.atomindex ){

            var selection = new NGL.Selection( sele );
            var filteredIndex = [];

            var atomindex = this.atomindex;
            var index = this.index;
            var n = index.length;
            var test = selection.test;

            for( var i = 0; i < n; i+=3 ){

                var idx1 = index[ i     ];
                var idx2 = index[ i + 1 ];
                var idx3 = index[ i + 2 ];

                var a1 = atoms[ atomindex[ idx1 ] ];
                var a2 = atoms[ atomindex[ idx2 ] ];
                var a3 = atoms[ atomindex[ idx3 ] ];

                if( test( a1 ) && test( a2 ) && test( a3 ) ){

                    filteredIndex.push( idx1 );
                    filteredIndex.push( idx2 );
                    filteredIndex.push( idx3 );

                }

            }

            return new Uint32Array( filteredIndex );

        }else{

            return this.index;

        }

    },

    getAtomindex: function(){

        return this.atomindex;

    },

    toJSON: function(){

        var output = {

            metadata: {
                version: 0.1,
                type: 'Surface',
                generator: 'SurfaceExporter'
            },

            name: this.name,
            path: this.path,
            info: this.info,

            position: this.position,
            index: this.index,
            normal: this.normal,
            color: this.color,
            atomindex: this.atomindex,

            size: this.size,

            center: this.center.toArray(),
            boundingBox: {
                min: this.boundingBox.min.toArray(),
                max: this.boundingBox.max.toArray()
            }

        }

        return output;

    },

    fromJSON: function( input ){

        this.name = input.name;
        this.path = input.path;
        this.info = input.info;

        this.position = input.position;
        this.index = input.index;
        this.normal = input.normal;
        this.color = input.color;
        this.atomindex = input.atomindex;

        this.size = input.size;

        this.center.fromArray( input.center );
        this.boundingBox.set(
            input.boundingBox.min,
            input.boundingBox.max
        );

        return this;

    },

    getTransferable: function(){

        var transferable = [];

        if( this.position ) transferable.push( this.position.buffer );
        if( this.index ) transferable.push( this.index.buffer );
        if( this.normal ) transferable.push( this.normal.buffer );
        if( this.color ) transferable.push( this.color.buffer );
        if( this.atomindex ) transferable.push( this.atomindex.buffer );

        return transferable;

    },

    dispose: function(){

        //

    }

};


/////////
// Grid

NGL.Grid = function( length, width, height, dataCtor, elemSize ){

    dataCtor = dataCtor || Int32Array;
    elemSize = elemSize || 1;

    var j;

    var data = new dataCtor( length * width * height * elemSize );

    function index( x, y, z ){

        return ( ( ( ( x * width ) + y ) * height ) + z ) * elemSize;

    }

    this.data = data;

    this.index = index;

    this.set = function( x, y, z ){

        var i = index( x, y, z );

        for( j = 0; j < elemSize; ++j ){
            data[ i + j ] = arguments[ 3 + j ];
        }

    };

    this.toArray = function( x, y, z, array, offset ){

        var i = index( x, y, z );

        if ( array === undefined ) array = [];
        if ( offset === undefined ) offset = 0;

        for( j = 0; j < elemSize; ++j ){
            array[ j ] = data[ i + j ];
        }

    };

    this.fromArray = function( x, y, z, array, offset ){

        var i = index( x, y, z );

        if ( offset === undefined ) offset = 0;

        for( j = 0; j < elemSize; ++j ){
            data[ i + j ] = array[ offset + j ];
        }

    };

    this.copy = function( grid ){

        this.data.set( grid.data );

    };

    this.clone = function(){

        return new NGL.Grid(

            length, width, height, dataCtor, elemSize

        ).copy( this );

    };

};


///////////
// Volume

NGL.WorkerRegistry.add( "surf", function( e, callback ){

    NGL.time( "WORKER surf" );

    if( self.vol === undefined ) self.vol = new NGL.Volume();

    var vol = self.vol;
    var d = e.data;
    var p = d.params;

    if( d.vol ) vol.fromJSON( d.vol );

    var surface = vol.getSurface( p.isolevel, p.smooth );

    NGL.timeEnd( "WORKER surf" );

    callback( surface.toJSON(), surface.getTransferable() );

} );


NGL.Volume = function( name, path, data, nx, ny, nz, dataAtomindex ){

    this.name = name;
    this.path = path;

    this.matrix = new THREE.Matrix4();
    this.normalMatrix = new THREE.Matrix3();
    this.center = new THREE.Vector3();
    this.boundingBox = new THREE.Box3();

    this.setData( data, nx, ny, nz, dataAtomindex );

    NGL.GidPool.addObject( this );

};

NGL.Volume.prototype = {

    constructor: NGL.Volume,

    setData: function( data, nx, ny, nz, dataAtomindex ){

        this.nx = nx || 1;
        this.ny = ny || 1;
        this.nz = nz || 1;

        this.data = data || new Float32Array( 1 );
        this.__data = this.data;

        this.setDataAtomindex( dataAtomindex );

        delete this.mc;

        delete this.__isolevel;
        delete this.__smooth;
        delete this.__minValue;
        delete this.__maxValue;

        delete this.__dataPositionBuffer;
        delete this.__dataPosition;
        delete this.__dataBuffer;

        delete this.__dataMin;
        delete this.__dataMax;
        delete this.__dataMean;
        delete this.__dataRms;

        if( this.worker ) this.worker.terminate();

        NGL.GidPool.updateObject( this, true );

    },

    setMatrix: function( matrix ){

        this.matrix.copy( matrix );

        var bb = this.boundingBox;
        var v = this.center;  // temporary re-purposing

        var x = this.nx - 1;
        var y = this.ny - 1;
        var z = this.nz - 1;

        bb.makeEmpty();

        bb.expandByPoint( v.set( x, y, z ) );
        bb.expandByPoint( v.set( x, y, 0 ) );
        bb.expandByPoint( v.set( x, 0, z ) );
        bb.expandByPoint( v.set( x, 0, 0 ) );
        bb.expandByPoint( v.set( 0, y, z ) );
        bb.expandByPoint( v.set( 0, 0, z ) );
        bb.expandByPoint( v.set( 0, y, 0 ) );
        bb.expandByPoint( v.set( 0, 0, 0 ) );

        bb.applyMatrix4( this.matrix );
        bb.center( this.center );

        // make normal matrix

        var me = this.matrix.elements;
        var r0 = new THREE.Vector3( me[0], me[1], me[2] );
        var r1 = new THREE.Vector3( me[4], me[5], me[6] );
        var r2 = new THREE.Vector3( me[8], me[9], me[10] );
        var cp = new THREE.Vector3();
        //        [ r0 ]       [ r1 x r2 ]
        // M3x3 = [ r1 ]   N = [ r2 x r0 ]
        //        [ r2 ]       [ r0 x r1 ]
        var ne = this.normalMatrix.elements;
        cp.crossVectors( r1, r2 );
        ne[ 0 ] = cp.x;
        ne[ 1 ] = cp.y;
        ne[ 2 ] = cp.z;
        cp.crossVectors( r2, r0 );
        ne[ 3 ] = cp.x;
        ne[ 4 ] = cp.y;
        ne[ 5 ] = cp.z;
        cp.crossVectors( r0, r1 );
        ne[ 6 ] = cp.x;
        ne[ 7 ] = cp.y;
        ne[ 8 ] = cp.z;

    },

    setDataAtomindex: function( dataAtomindex ){

        this.dataAtomindex = dataAtomindex;
        this.__dataAtomindex = this.dataAtomindex;

        delete this.__dataAtomindexBuffer;

    },

    getSurface: function( isolevel, smooth ){

        isolevel = isNaN( isolevel ) ? this.getValueForSigma( 2 ) : isolevel;
        smooth = smooth || 0;

        //

        if( this.mc === undefined ){

            this.mc = new NGL.MarchingCubes2(
                this.__data, this.nx, this.ny, this.nz, this.__dataAtomindex
            );

        }

        var sd;

        if( smooth ){

            sd = this.mc.triangulate( isolevel, true );
            NGL.laplacianSmooth( sd.position, sd.index, smooth, true );

        }else{

            sd = this.mc.triangulate( isolevel );

        }

        this.matrix.applyToVector3Array( sd.position );

        if( sd.normal ){

            this.normalMatrix.applyToVector3Array( sd.normal );

        }

        var surface = new NGL.Surface( "", "", sd );
        surface.info[ "isolevel" ] = isolevel;
        surface.info[ "smooth" ] = smooth;

        return surface;

    },

    getSurfaceWorker: function( isolevel, smooth, callback ){

        isolevel = isNaN( isolevel ) ? this.getValueForSigma( 2 ) : isolevel;
        smooth = smooth || 0;

        //

        if( NGL.useWorker && typeof Worker !== "undefined" &&
            typeof importScripts !== 'function'
        ){

            var vol = undefined;

            if( this.worker === undefined ){

                vol = this.toJSON();
                this.worker = new NGL.Worker( "surf" );

            }

            this.worker.post(

                {
                    vol: vol,
                    params: {
                        isolevel: isolevel,
                        smooth: smooth
                    }
                },

                undefined,

                function( e ){

                    var surface = NGL.fromJSON( e.data );
                    callback( surface );

                }.bind( this ),

                function( e ){

                    console.warn(
                        "NGL.Volume.generateSurfaceWorker error - trying without worker", e
                    );
                    this.worker.terminate();
                    this.worker = undefined;

                    var surface = this.getSurface( isolevel, smooth );
                    callback( surface );

                }.bind( this )

            );

        }else{

            var surface = this.getSurface( isolevel, smooth );
            callback( surface );

        }

    },

    getValueForSigma: function( sigma ){

        sigma = sigma !== undefined ? sigma : 2;

        return this.getDataMean() + sigma * this.getDataRms();

    },

    getSigmaForValue: function( value ){

        value = value !== undefined ? value : 0;

        return ( value - this.getDataMean() ) / this.getDataRms();

    },

    filterData: function( minValue, maxValue, outside ){

        if( isNaN( minValue ) && this.header ){
            minValue = this.header.DMEAN + 2.0 * this.header.ARMS;
        }

        minValue = ( minValue !== undefined && !isNaN( minValue ) ) ? minValue : -Infinity;
        maxValue = maxValue !== undefined ? maxValue : Infinity;
        outside = outside || false;

        if( !this.dataPosition ){

            this.makeDataPosition();

        }

        var dataPosition = this.__dataPosition;
        var data = this.__data;

        if( minValue === this.__minValue && maxValue == this.__maxValue &&
            outside === this.__outside
        ){

            // already filtered
            return;

        }else if( minValue === -Infinity && maxValue === Infinity ){

            this.dataPosition = dataPosition;
            this.data = data;

        }else{

            var n = data.length;

            if( !this.__dataBuffer ){

                // ArrayBuffer for re-use as Float32Array backend

                this.__dataPositionBuffer = new ArrayBuffer( n * 3 * 4 );
                this.__dataBuffer = new ArrayBuffer( n * 4 );

            }

            var filteredDataPosition = new Float32Array( this.__dataPositionBuffer );
            var filteredData = new Float32Array( this.__dataBuffer );

            var j = 0;

            for( var i = 0; i < n; ++i ){

                var i3 = i * 3;
                var v = data[ i ];

                if( ( !outside && v >= minValue && v <= maxValue ) ||
                    ( outside && ( v < minValue || v > maxValue ) )
                ){

                    var j3 = j * 3;

                    filteredDataPosition[ j3 + 0 ] = dataPosition[ i3 + 0 ];
                    filteredDataPosition[ j3 + 1 ] = dataPosition[ i3 + 1 ];
                    filteredDataPosition[ j3 + 2 ] = dataPosition[ i3 + 2 ];

                    filteredData[ j ] = v;

                    j += 1;

                }

            }

            // set views

            this.dataPosition = new Float32Array( this.__dataPositionBuffer, 0, j * 3 );
            this.data = new Float32Array( this.__dataBuffer, 0, j );

        }

        this.__minValue = minValue;
        this.__maxValue = maxValue;
        this.__outside = outside;

    },

    makeDataPosition: function(){

        var nz = this.nz;
        var ny = this.ny;
        var nx = this.nx;

        var position = new Float32Array( nx * ny * nz * 3 );

        var p = 0;

        for( var z = 0; z < nz; ++z ){

            for( var y = 0; y < ny; ++y ){

                for( var x = 0; x < nx; ++x ){

                    position[ p + 0 ] = x;
                    position[ p + 1 ] = y;
                    position[ p + 2 ] = z;

                    p += 3;

                }

            }

        }

        this.matrix.applyToVector3Array( position );

        this.dataPosition = position;
        this.__dataPosition = position;

    },

    getDataAtomindex: function(){

        return this.dataAtomindex;

    },

    getDataPosition: function(){

        return this.dataPosition;

    },

    getDataColor: function( params ){

        var p = params || {};
        p.volume = this;
        p.scale = p.scale || 'Spectral';
        p.domain = p.domain || [ this.getDataMin(), this.getDataMax() ];

        var colorMaker = NGL.ColorMakerRegistry.getScheme( p );

        var n = this.dataPosition.length / 3;
        var array = new Float32Array( n * 3 );

        // var atoms = p.structure.atoms;
        // var atomindex = this.dataAtomindex;

        for( var i = 0; i < n; ++i ){

            colorMaker.volumeColorToArray( i, array, i * 3 );

            // a = atoms[ atomindex[ i ] ];
            // if( a ) colorMaker.atomColorToArray( a, array, i * 3 );

        }

        return array;

    },

    getPickingDataColor: function( params ){

        var p = Object.assign( params || {} );
        p.scheme = "picking";

        return this.getDataColor( p );

    },

    getDataSize: function( size, scale ){

        var n = this.dataPosition.length / 3;
        var array;

        switch( size ){

            case "value":

                array = new Float32Array( this.data );
                break;

            case "abs-value":

                array = new Float32Array( this.data );
                for( var i = 0; i < n; ++i ){
                    array[ i ] = Math.abs( array[ i ] );
                }
                break;

            case "value-min":

                array = new Float32Array( this.data );
                var min = this.getDataMin();
                for( var i = 0; i < n; ++i ){
                    array[ i ] -= min;
                }
                break;

            case "deviation":

                array = new Float32Array( this.data );
                break;

            default:

                array = NGL.Utils.uniformArray( n, size );
                break;

        }

        if( scale !== 1.0 ){

            for( var i = 0; i < n; ++i ){
                array[ i ] *= scale;
            }

        }

        return array;

    },

    getDataMin: function(){

        if( this.__dataMin === undefined ){

            var data = this.__data;
            var n = data.length;
            var min = Infinity;

            for( var i = 0; i < n; ++i ){
                min = Math.min( min, data[ i ] );
            }

            this.__dataMin = min;

        }

        return this.__dataMin;

    },

    getDataMax: function(){

        if( this.__dataMax === undefined ){

            var data = this.__data;
            var n = data.length;
            var max = -Infinity;

            for( var i = 0; i < n; ++i ){
                max = Math.max( max, data[ i ] );
            }

            this.__dataMax = max;

        }

        return this.__dataMax;

    },

    getDataMean: function(){

        if( this.__dataMean === undefined ){

            var data = this.__data;
            var n = data.length;
            var sum = 0;

            for( var i = 0; i < n; ++i ){
                sum += data[ i ];
            }

            this.__dataMean = sum / n;

        }

        return this.__dataMean;

    },

    getDataRms: function(){

        if( this.__dataRms === undefined ){

            var data = this.__data;
            var n = data.length;
            var sumSq = 0;
            var di, i;

            for( i = 0; i < n; ++i ){
                di = data[ i ];
                sumSq += di * di;
            }

            this.__dataRms = Math.sqrt( sumSq / n );

        }

        return this.__dataRms;

    },

    clone: function(){

        var vol = new NGL.Volume(

            this.name,
            this.path,

            this.__data,

            this.nx,
            this.ny,
            this.nz,

            this.__dataAtomindex

        );

        vol.matrix.copy( this.matrix );

        if( this.header ){

            vol.header = Object.assign( {}, this.header );

        }

        return vol;

    },

    toJSON: function(){

        var output = {

            metadata: {
                version: 0.1,
                type: 'Volume',
                generator: 'VolumeExporter'
            },

            name: this.name,
            path: this.path,

            data: this.__data,

            nx: this.nx,
            ny: this.ny,
            nz: this.nz,

            dataAtomindex: this.__dataAtomindex,

            matrix: this.matrix.toArray(),
            normalMatrix: this.normalMatrix.toArray(),

            center: this.center.toArray(),
            boundingBox: {
                min: this.boundingBox.min.toArray(),
                max: this.boundingBox.max.toArray()
            }

        }

        if( this.header ){

            output.header = Object.assign( {}, this.header );

        }

        return output;

    },

    fromJSON: function( input ){

        this.name = input.name;
        this.path = input.path;

        this.setData(

            input.data,

            input.nx,
            input.ny,
            input.nz,

            input.dataAtomindex

        );

        this.matrix.fromArray( input.matrix );
        this.normalMatrix.fromArray( input.normalMatrix );

        if( input.header ){

            this.header = Object.assign( {}, input.header );

        }

        this.center.fromArray( input.center );
        this.boundingBox.set(
            input.boundingBox.min,
            input.boundingBox.max
        );

        return this;

    },

    getTransferable: function(){

        var transferable = [

            this.__data.buffer

        ];

        if( this.__dataAtomindex ){
            transferable.push( this.__dataAtomindex.buffer );
        }

        return transferable;

    },

    dispose: function(){

        if( this.worker ) this.worker.terminate();

        NGL.GidPool.removeObject( this );

    }

};


///////////////////
// Marching cubes

NGL.MarchingCubes = function( data, nx, ny, nz, isolevel ){

    // The MIT License (MIT) Copyright (c) 2012-2013 Mikola Lysenko
    // http://0fps.net/2012/07/12/smooth-voxel-terrain-part-2/
    //
    // Based on Paul Bourke's classic implementation:
    // http://paulbourke.net/geometry/polygonise/
    // JS port by Mikola Lysenko
    //
    // Adapted for NGL by Alexander Rose

    NGL.time( "NGL.MarchingCubes" );

    var dims = new Int32Array( [ nx, ny, nz ] );

    var edgeTable = NGL.MarchingCubes.edgeTable;
    var triTable = NGL.MarchingCubes.triTable;
    var cubeVerts = NGL.MarchingCubes.cubeVerts;
    var edgeIndex = NGL.MarchingCubes.edgeIndex;

    var vertices = [];
    var faces = [];
    var vc3 = 0;  // vertexCount * 3
    var fc3 = 0;  // faceCount * 3

    var n = 0;
    var grid = new Float32Array( 8 );
    var edges = new Int32Array( 12 );
    var x = new Int32Array( 3 );

    // March over the volume

    for( x[2]=0; x[2] < dims[2]-1; ++x[2], n+=dims[0] ){

        for( x[1]=0; x[1] < dims[1]-1; ++x[1], ++n){

            for( x[0]=0; x[0] < dims[0]-1; ++x[0], ++n) {

                // For each cell, compute cube mask

                var cubeIndex = 0;

                for( var i=0; i<8; ++i ){

                    var v = cubeVerts[ i ]
                    var k = n + v[0] + dims[0] * ( v[1] + dims[1] * v[2] );
                    var s = data[ k ] - isolevel;

                    grid[ i ] = s;
                    cubeIndex |= ( s > 0 ) ? 1 << i : 0;

                }

                // Compute vertices

                var edgeMask = edgeTable[ cubeIndex ];

                if( edgeMask === 0 ) {
                    continue;
                }

                for( var i=0; i<12; ++i ){

                    if( ( edgeMask & ( 1 << i ) ) === 0 ){
                        continue;
                    }

                    edges[ i ] = vc3 / 3;

                    var e = edgeIndex[ i ];
                    var p0 = cubeVerts[ e[ 0 ] ];
                    var p1 = cubeVerts[ e[ 1 ] ];
                    var a = grid[ e[ 0 ] ];
                    var b = grid[ e[ 1 ] ];
                    var d = a - b;
                    var t = 0;

                    if( Math.abs( d ) > 1e-6 ){
                        t = a / d;
                    }

                    vertices[ vc3 + 0 ] = ( x[0] + p0[0] ) + t * ( p1[0] - p0[0] );
                    vertices[ vc3 + 1 ] = ( x[1] + p0[1] ) + t * ( p1[1] - p0[1] );
                    vertices[ vc3 + 2 ] = ( x[2] + p0[2] ) + t * ( p1[2] - p0[2] );

                    vc3 += 3;

                }

                // Add faces

                var f = triTable[ cubeIndex ];

                for( var i=0; i<f.length; i += 3 ){

                    faces[ fc3 + 0 ] = edges[ f[ i + 0 ] ];
                    faces[ fc3 + 1 ] = edges[ f[ i + 1 ] ];
                    faces[ fc3 + 2 ] = edges[ f[ i + 2 ] ];

                    fc3 += 3;

                }

            }

        }

    }

    NGL.timeEnd( "NGL.MarchingCubes" );

    return {
        position: new Float32Array( vertices ),
        normal: undefined,
        index: new Uint32Array( faces )
    };

};

NGL.MarchingCubes2 = function( field, nx, ny, nz, atomindex ){

    // Based on alteredq / http://alteredqualia.com/
    // port of greggman's ThreeD version of marching cubes to Three.js
    // http://webglsamples.googlecode.com/hg/blob/blob.html
    //
    // Adapted for NGL by Alexander Rose

    var edgeTable = NGL.MarchingCubes.edgeTable;
    var triTable = NGL.MarchingCubes.triTable2;

    var isolevel = 0;
    var noNormals = false;

    var n = nx * ny * nz;

    // deltas
    var yd = nx;
    var zd = nx * ny;

    var normalCache, vertexIndex;
    var count, icount;

    var ilist = new Int32Array( 12 );

    var positionArray = [];
    var normalArray = [];
    var indexArray = [];
    var atomindexArray = [];

    //

    this.triangulate = function( _isolevel, _noNormals ){

        NGL.time( "NGL.MarchingCubes2.triangulate" );

        isolevel = _isolevel;
        noNormals = _noNormals;

        if( !noNormals && !normalCache ){
            normalCache = new Float32Array( n * 3 );
        }

        if( !vertexIndex ){
            vertexIndex = new Int32Array( n );
        }

        for( var i = 0; i < n; ++i ){
            vertexIndex[ i ] = -1;
        }

        count = 0;
        icount = 0;

        triangulate();

        positionArray.length = count * 3;
        if( !noNormals ) normalArray.length = count * 3;
        indexArray.length = icount;
        if( atomindex ) atomindexArray.length = count;

        NGL.timeEnd( "NGL.MarchingCubes2.triangulate" );

        return {
            position: new Float32Array( positionArray ),
            normal: noNormals ? undefined : new Float32Array( normalArray ),
            index: new Uint32Array( indexArray ),
            atomindex: atomindex ? new Int32Array( atomindexArray ) : undefined,
        };

    }

    // polygonization

    function lerp( a, b, t ) { return a + ( b - a ) * t; }

    function VIntX( q, offset, x, y, z, valp1, valp2 ) {

        if( vertexIndex[ q ] < 0 ){

            var mu = ( isolevel - valp1 ) / ( valp2 - valp1 );
            var nc = normalCache;

            var c = count * 3;

            positionArray[ c + 0 ] = x + mu;
            positionArray[ c + 1 ] = y;
            positionArray[ c + 2 ] = z;

            if( !noNormals ){

                var q3 = q * 3;

                normalArray[ c ]     = -lerp( nc[ q3 ],     nc[ q3 + 3 ], mu );
                normalArray[ c + 1 ] = -lerp( nc[ q3 + 1 ], nc[ q3 + 4 ], mu );
                normalArray[ c + 2 ] = -lerp( nc[ q3 + 2 ], nc[ q3 + 5 ], mu );

            }

            if( atomindex ) atomindexArray[ count ] = atomindex[ q + mu ];

            vertexIndex[ q ] = count;
            ilist[ offset ] = count;

            count += 1;

        }else{

            ilist[ offset ] = vertexIndex[ q ];

        }

    }

    function VIntY( q, offset, x, y, z, valp1, valp2 ) {

        if( vertexIndex[ q ] < 0 ){

            var mu = ( isolevel - valp1 ) / ( valp2 - valp1 );
            var nc = normalCache;

            var c = count * 3;

            positionArray[ c ]     = x;
            positionArray[ c + 1 ] = y + mu;
            positionArray[ c + 2 ] = z;

            if( !noNormals ){

                var q3 = q * 3;
                var q6 = q3 + yd * 3;

                normalArray[ c ]     = -lerp( nc[ q3 ],     nc[ q6 ],     mu );
                normalArray[ c + 1 ] = -lerp( nc[ q3 + 1 ], nc[ q6 + 1 ], mu );
                normalArray[ c + 2 ] = -lerp( nc[ q3 + 2 ], nc[ q6 + 2 ], mu );

            }

            if( atomindex ) atomindexArray[ count ] = atomindex[ q + mu * yd ];

            vertexIndex[ q ] = count;
            ilist[ offset ] = count;

            count += 1;

        }else{

            ilist[ offset ] = vertexIndex[ q ];

        }

    }

    function VIntZ( q, offset, x, y, z, valp1, valp2 ) {

        if( vertexIndex[ q ] < 0 ){

            var mu = ( isolevel - valp1 ) / ( valp2 - valp1 );
            var nc = normalCache;

            var c = count * 3;

            positionArray[ c ]     = x;
            positionArray[ c + 1 ] = y;
            positionArray[ c + 2 ] = z + mu;

            if( !noNormals ){

                var q3 = q * 3;
                var q6 = q3 + zd * 3;

                normalArray[ c ]     = -lerp( nc[ q3 ],     nc[ q6 ],     mu );
                normalArray[ c + 1 ] = -lerp( nc[ q3 + 1 ], nc[ q6 + 1 ], mu );
                normalArray[ c + 2 ] = -lerp( nc[ q3 + 2 ], nc[ q6 + 2 ], mu );

            }

            if( atomindex ) atomindexArray[ count ] = atomindex[ q + mu * zd ];

            vertexIndex[ q ] = count;
            ilist[ offset ] = count;

            count += 1;

        }else{

            ilist[ offset ] = vertexIndex[ q ];

        }

    }

    function compNorm( q ) {

        var q3 = q * 3;

        if ( normalCache[ q3 ] === 0.0 ) {

            normalCache[ q3     ] = field[ q - 1  ] - field[ q + 1 ];
            normalCache[ q3 + 1 ] = field[ q - yd ] - field[ q + yd ];
            normalCache[ q3 + 2 ] = field[ q - zd ] - field[ q + zd ];

        }

    }

    function polygonize( fx, fy, fz, q ) {

        // cache indices
        var q1 = q + 1,
            qy = q + yd,
            qz = q + zd,
            q1y = q1 + yd,
            q1z = q1 + zd,
            qyz = q + yd + zd,
            q1yz = q1 + yd + zd;

        var cubeindex = 0,
            field0 = field[ q ],
            field1 = field[ q1 ],
            field2 = field[ qy ],
            field3 = field[ q1y ],
            field4 = field[ qz ],
            field5 = field[ q1z ],
            field6 = field[ qyz ],
            field7 = field[ q1yz ];

        if ( field0 < isolevel ) cubeindex |= 1;
        if ( field1 < isolevel ) cubeindex |= 2;
        if ( field2 < isolevel ) cubeindex |= 8;
        if ( field3 < isolevel ) cubeindex |= 4;
        if ( field4 < isolevel ) cubeindex |= 16;
        if ( field5 < isolevel ) cubeindex |= 32;
        if ( field6 < isolevel ) cubeindex |= 128;
        if ( field7 < isolevel ) cubeindex |= 64;

        // if cube is entirely in/out of the surface - bail, nothing to draw

        var bits = edgeTable[ cubeindex ];
        if ( bits === 0 ) return 0;

        var fx2 = fx + 1,
            fy2 = fy + 1,
            fz2 = fz + 1;

        // top of the cube

        if ( bits & 1 ) {

            if( !noNormals ){
                compNorm( q );
                compNorm( q1 );
            }
            VIntX( q, 0, fx, fy, fz, field0, field1 );

        };

        if ( bits & 2 ) {

            if( !noNormals ){
                compNorm( q1 );
                compNorm( q1y );
            }
            VIntY( q1, 1, fx2, fy, fz, field1, field3 );

        };

        if ( bits & 4 ) {

            if( !noNormals ){
                compNorm( qy );
                compNorm( q1y );
            }
            VIntX( qy, 2, fx, fy2, fz, field2, field3 );

        };

        if ( bits & 8 ) {

            if( !noNormals ){
                compNorm( q );
                compNorm( qy );
            }
            VIntY( q, 3, fx, fy, fz, field0, field2 );

        };

        // bottom of the cube

        if ( bits & 16 ) {

            if( !noNormals ){
                compNorm( qz );
                compNorm( q1z );
            }
            VIntX( qz, 4, fx, fy, fz2, field4, field5 );

        };

        if ( bits & 32 ) {

            if( !noNormals ){
                compNorm( q1z );
                compNorm( q1yz );
            }
            VIntY( q1z, 5, fx2, fy, fz2, field5, field7 );

        };

        if ( bits & 64 ) {

            if( !noNormals ){
                compNorm( qyz );
                compNorm( q1yz );
            }
            VIntX( qyz, 6, fx, fy2, fz2, field6, field7 );

        };

        if ( bits & 128 ) {

            if( !noNormals ){
                compNorm( qz );
                compNorm( qyz );
            }
            VIntY( qz, 7, fx, fy, fz2, field4, field6 );

        };

        // vertical lines of the cube

        if ( bits & 256 ) {

            if( !noNormals ){
                compNorm( q );
                compNorm( qz );
            }
            VIntZ( q, 8, fx, fy, fz, field0, field4 );

        };

        if ( bits & 512 ) {

            if( !noNormals ){
                compNorm( q1 );
                compNorm( q1z );
            }
            VIntZ( q1, 9, fx2, fy, fz, field1, field5 );

        };

        if ( bits & 1024 ) {

            if( !noNormals ){
                compNorm( q1y );
                compNorm( q1yz );
            }
            VIntZ( q1y, 10, fx2, fy2, fz, field3, field7 );

        };

        if ( bits & 2048 ) {

            if( !noNormals ){
                compNorm( qy );
                compNorm( qyz );
            }
            VIntZ( qy, 11, fx, fy2, fz, field2, field6 );

        };

        cubeindex <<= 4;  // re-purpose cubeindex into an offset into triTable

        var o1, o2, o3, i = 0;

        // here is where triangles are created

        while ( triTable[ cubeindex + i ] != -1 ) {

            o1 = cubeindex + i;
            o2 = o1 + 1;
            o3 = o1 + 2;

            // FIXME normals flipping (see above) and vertex order reversal
            indexArray[ icount ]     = ilist[ triTable[ o2 ] ];
            indexArray[ icount + 1 ] = ilist[ triTable[ o1 ] ];
            indexArray[ icount + 2 ] = ilist[ triTable[ o3 ] ];

            icount += 3;
            i += 3;

        }

    }

    function triangulate() {

        var q, x, y, z, fx, fy, fz, y_offset, z_offset

        var beg, xEnd, yEnd, zEnd;

        if( noNormals ){

            beg = 0;

            xEnd = nx - 1;
            yEnd = ny - 1;
            zEnd = nz - 1;

        }else{

            beg = 1;

            xEnd = nx - 2;
            yEnd = ny - 2;
            zEnd = nz - 2;

        }

        for ( z = beg; z < zEnd; ++z ) {

            z_offset = zd * z;

            for ( y = beg; y < yEnd; ++y ) {

                y_offset = z_offset + yd * y;

                for ( x = beg; x < xEnd; ++x ) {

                    q = y_offset + x;
                    polygonize( x, y, z, q );

                }

            }

        }

    }

};

NGL.MarchingCubes.edgeTable = new Uint32Array( [
    0x0  , 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
    0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
    0x190, 0x99 , 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
    0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
    0x230, 0x339, 0x33 , 0x13a, 0x636, 0x73f, 0x435, 0x53c,
    0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
    0x3a0, 0x2a9, 0x1a3, 0xaa , 0x7a6, 0x6af, 0x5a5, 0x4ac,
    0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
    0x460, 0x569, 0x663, 0x76a, 0x66 , 0x16f, 0x265, 0x36c,
    0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
    0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff , 0x3f5, 0x2fc,
    0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
    0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55 , 0x15c,
    0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
    0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc ,
    0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
    0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
    0xcc , 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
    0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
    0x15c, 0x55 , 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
    0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
    0x2fc, 0x3f5, 0xff , 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
    0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
    0x36c, 0x265, 0x16f, 0x66 , 0x76a, 0x663, 0x569, 0x460,
    0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
    0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa , 0x1a3, 0x2a9, 0x3a0,
    0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
    0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33 , 0x339, 0x230,
    0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
    0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99 , 0x190,
    0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
    0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
] );

NGL.MarchingCubes.triTable = [
    [],
    [0, 8, 3],
    [0, 1, 9],
    [1, 8, 3, 9, 8, 1],
    [1, 2, 10],
    [0, 8, 3, 1, 2, 10],
    [9, 2, 10, 0, 2, 9],
    [2, 8, 3, 2, 10, 8, 10, 9, 8],
    [3, 11, 2],
    [0, 11, 2, 8, 11, 0],
    [1, 9, 0, 2, 3, 11],
    [1, 11, 2, 1, 9, 11, 9, 8, 11],
    [3, 10, 1, 11, 10, 3],
    [0, 10, 1, 0, 8, 10, 8, 11, 10],
    [3, 9, 0, 3, 11, 9, 11, 10, 9],
    [9, 8, 10, 10, 8, 11],
    [4, 7, 8],
    [4, 3, 0, 7, 3, 4],
    [0, 1, 9, 8, 4, 7],
    [4, 1, 9, 4, 7, 1, 7, 3, 1],
    [1, 2, 10, 8, 4, 7],
    [3, 4, 7, 3, 0, 4, 1, 2, 10],
    [9, 2, 10, 9, 0, 2, 8, 4, 7],
    [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4],
    [8, 4, 7, 3, 11, 2],
    [11, 4, 7, 11, 2, 4, 2, 0, 4],
    [9, 0, 1, 8, 4, 7, 2, 3, 11],
    [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1],
    [3, 10, 1, 3, 11, 10, 7, 8, 4],
    [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4],
    [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3],
    [4, 7, 11, 4, 11, 9, 9, 11, 10],
    [9, 5, 4],
    [9, 5, 4, 0, 8, 3],
    [0, 5, 4, 1, 5, 0],
    [8, 5, 4, 8, 3, 5, 3, 1, 5],
    [1, 2, 10, 9, 5, 4],
    [3, 0, 8, 1, 2, 10, 4, 9, 5],
    [5, 2, 10, 5, 4, 2, 4, 0, 2],
    [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8],
    [9, 5, 4, 2, 3, 11],
    [0, 11, 2, 0, 8, 11, 4, 9, 5],
    [0, 5, 4, 0, 1, 5, 2, 3, 11],
    [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5],
    [10, 3, 11, 10, 1, 3, 9, 5, 4],
    [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10],
    [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3],
    [5, 4, 8, 5, 8, 10, 10, 8, 11],
    [9, 7, 8, 5, 7, 9],
    [9, 3, 0, 9, 5, 3, 5, 7, 3],
    [0, 7, 8, 0, 1, 7, 1, 5, 7],
    [1, 5, 3, 3, 5, 7],
    [9, 7, 8, 9, 5, 7, 10, 1, 2],
    [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3],
    [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2],
    [2, 10, 5, 2, 5, 3, 3, 5, 7],
    [7, 9, 5, 7, 8, 9, 3, 11, 2],
    [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11],
    [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7],
    [11, 2, 1, 11, 1, 7, 7, 1, 5],
    [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11],
    [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0],
    [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0],
    [11, 10, 5, 7, 11, 5],
    [10, 6, 5],
    [0, 8, 3, 5, 10, 6],
    [9, 0, 1, 5, 10, 6],
    [1, 8, 3, 1, 9, 8, 5, 10, 6],
    [1, 6, 5, 2, 6, 1],
    [1, 6, 5, 1, 2, 6, 3, 0, 8],
    [9, 6, 5, 9, 0, 6, 0, 2, 6],
    [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8],
    [2, 3, 11, 10, 6, 5],
    [11, 0, 8, 11, 2, 0, 10, 6, 5],
    [0, 1, 9, 2, 3, 11, 5, 10, 6],
    [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11],
    [6, 3, 11, 6, 5, 3, 5, 1, 3],
    [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6],
    [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9],
    [6, 5, 9, 6, 9, 11, 11, 9, 8],
    [5, 10, 6, 4, 7, 8],
    [4, 3, 0, 4, 7, 3, 6, 5, 10],
    [1, 9, 0, 5, 10, 6, 8, 4, 7],
    [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4],
    [6, 1, 2, 6, 5, 1, 4, 7, 8],
    [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7],
    [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6],
    [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9],
    [3, 11, 2, 7, 8, 4, 10, 6, 5],
    [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11],
    [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6],
    [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6],
    [8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6],
    [5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11],
    [0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7],
    [6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9],
    [10, 4, 9, 6, 4, 10],
    [4, 10, 6, 4, 9, 10, 0, 8, 3],
    [10, 0, 1, 10, 6, 0, 6, 4, 0],
    [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10],
    [1, 4, 9, 1, 2, 4, 2, 6, 4],
    [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4],
    [0, 2, 4, 4, 2, 6],
    [8, 3, 2, 8, 2, 4, 4, 2, 6],
    [10, 4, 9, 10, 6, 4, 11, 2, 3],
    [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6],
    [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10],
    [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1],
    [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3],
    [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1],
    [3, 11, 6, 3, 6, 0, 0, 6, 4],
    [6, 4, 8, 11, 6, 8],
    [7, 10, 6, 7, 8, 10, 8, 9, 10],
    [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10],
    [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0],
    [10, 6, 7, 10, 7, 1, 1, 7, 3],
    [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7],
    [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9],
    [7, 8, 0, 7, 0, 6, 6, 0, 2],
    [7, 3, 2, 6, 7, 2],
    [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7],
    [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7],
    [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11],
    [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1],
    [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6],
    [0, 9, 1, 11, 6, 7],
    [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0],
    [7, 11, 6],
    [7, 6, 11],
    [3, 0, 8, 11, 7, 6],
    [0, 1, 9, 11, 7, 6],
    [8, 1, 9, 8, 3, 1, 11, 7, 6],
    [10, 1, 2, 6, 11, 7],
    [1, 2, 10, 3, 0, 8, 6, 11, 7],
    [2, 9, 0, 2, 10, 9, 6, 11, 7],
    [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8],
    [7, 2, 3, 6, 2, 7],
    [7, 0, 8, 7, 6, 0, 6, 2, 0],
    [2, 7, 6, 2, 3, 7, 0, 1, 9],
    [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6],
    [10, 7, 6, 10, 1, 7, 1, 3, 7],
    [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8],
    [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7],
    [7, 6, 10, 7, 10, 8, 8, 10, 9],
    [6, 8, 4, 11, 8, 6],
    [3, 6, 11, 3, 0, 6, 0, 4, 6],
    [8, 6, 11, 8, 4, 6, 9, 0, 1],
    [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6],
    [6, 8, 4, 6, 11, 8, 2, 10, 1],
    [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6],
    [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9],
    [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3],
    [8, 2, 3, 8, 4, 2, 4, 6, 2],
    [0, 4, 2, 4, 6, 2],
    [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8],
    [1, 9, 4, 1, 4, 2, 2, 4, 6],
    [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1],
    [10, 1, 0, 10, 0, 6, 6, 0, 4],
    [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3],
    [10, 9, 4, 6, 10, 4],
    [4, 9, 5, 7, 6, 11],
    [0, 8, 3, 4, 9, 5, 11, 7, 6],
    [5, 0, 1, 5, 4, 0, 7, 6, 11],
    [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5],
    [9, 5, 4, 10, 1, 2, 7, 6, 11],
    [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5],
    [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2],
    [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6],
    [7, 2, 3, 7, 6, 2, 5, 4, 9],
    [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7],
    [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0],
    [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8],
    [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7],
    [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4],
    [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10],
    [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10],
    [6, 9, 5, 6, 11, 9, 11, 8, 9],
    [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5],
    [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11],
    [6, 11, 3, 6, 3, 5, 5, 3, 1],
    [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6],
    [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10],
    [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5],
    [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3],
    [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2],
    [9, 5, 6, 9, 6, 0, 0, 6, 2],
    [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8],
    [1, 5, 6, 2, 1, 6],
    [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6],
    [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0],
    [0, 3, 8, 5, 6, 10],
    [10, 5, 6],
    [11, 5, 10, 7, 5, 11],
    [11, 5, 10, 11, 7, 5, 8, 3, 0],
    [5, 11, 7, 5, 10, 11, 1, 9, 0],
    [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1],
    [11, 1, 2, 11, 7, 1, 7, 5, 1],
    [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11],
    [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7],
    [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2],
    [2, 5, 10, 2, 3, 5, 3, 7, 5],
    [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5],
    [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2],
    [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2],
    [1, 3, 5, 3, 7, 5],
    [0, 8, 7, 0, 7, 1, 1, 7, 5],
    [9, 0, 3, 9, 3, 5, 5, 3, 7],
    [9, 8, 7, 5, 9, 7],
    [5, 8, 4, 5, 10, 8, 10, 11, 8],
    [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0],
    [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5],
    [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4],
    [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8],
    [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11],
    [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5],
    [9, 4, 5, 2, 11, 3],
    [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4],
    [5, 10, 2, 5, 2, 4, 4, 2, 0],
    [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9],
    [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2],
    [8, 4, 5, 8, 5, 3, 3, 5, 1],
    [0, 4, 5, 1, 0, 5],
    [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5],
    [9, 4, 5],
    [4, 11, 7, 4, 9, 11, 9, 10, 11],
    [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11],
    [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11],
    [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4],
    [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2],
    [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3],
    [11, 7, 4, 11, 4, 2, 2, 4, 0],
    [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4],
    [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9],
    [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7],
    [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10],
    [1, 10, 2, 8, 7, 4],
    [4, 9, 1, 4, 1, 7, 7, 1, 3],
    [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1],
    [4, 0, 3, 7, 4, 3],
    [4, 8, 7],
    [9, 10, 8, 10, 11, 8],
    [3, 0, 9, 3, 9, 11, 11, 9, 10],
    [0, 1, 10, 0, 10, 8, 8, 10, 11],
    [3, 1, 10, 11, 3, 10],
    [1, 2, 11, 1, 11, 9, 9, 11, 8],
    [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9],
    [0, 2, 11, 8, 0, 11],
    [3, 2, 11],
    [2, 3, 8, 2, 8, 10, 10, 8, 9],
    [9, 10, 2, 0, 9, 2],
    [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8],
    [1, 10, 2],
    [1, 3, 8, 9, 1, 8],
    [0, 9, 1],
    [0, 3, 8],
    []
];

NGL.MarchingCubes.triTable2 = new Int32Array( [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
    3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
    3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
    3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
    9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
    9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
    2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1,
    8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
    9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
    4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1,
    3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1,
    1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1,
    4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
    4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
    9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
    5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
    2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1,
    9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
    0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
    2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1,
    10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
    4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1,
    5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
    5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
    9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
    0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
    1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
    10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
    8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1,
    2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
    7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
    9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
    2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
    11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
    9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
    5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1,
    11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
    11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
    1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
    9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
    5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1,
    2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
    5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
    6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
    3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
    6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
    5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
    1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
    10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
    6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
    8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
    7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
    3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
    5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
    0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
    9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
    8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
    5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
    0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
    6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
    10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
    10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
    8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
    1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
    3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
    0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
    10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
    3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
    6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
    9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
    8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
    3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
    6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
    0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
    10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
    10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
    2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
    7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
    7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
    2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
    1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
    11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
    8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
    0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
    7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
    10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
    2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
    6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
    7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
    2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
    1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
    10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
    10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
    0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
    7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
    6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
    8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
    9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
    6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
    4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
    10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
    8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
    0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
    1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
    8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
    10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
    4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
    10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
    5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
    11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
    9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
    6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
    7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
    3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
    7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
    9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
    3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
    6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
    9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
    1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
    4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
    7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
    6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
    3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
    0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
    6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
    0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
    11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
    6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
    5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
    9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
    1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
    1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
    10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
    0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
    5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
    10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
    11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
    9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
    7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
    2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
    8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
    9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
    9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
    1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1,
    9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1,
    9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1,
    5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1,
    0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1,
    10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1,
    2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1,
    0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1,
    0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1,
    9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1,
    5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1,
    3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1,
    5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1,
    8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1,
    0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1,
    9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1,
    1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1,
    3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1,
    4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1,
    9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1,
    11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1,
    11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1,
    2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1,
    9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1,
    3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1,
    1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1,
    4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1,
    4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
    3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1,
    3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1,
    0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1,
    9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1,
    1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
] );

NGL.MarchingCubes.cubeVerts = [
    [0,0,0],
    [1,0,0],
    [1,1,0],
    [0,1,0],
    [0,0,1],
    [1,0,1],
    [1,1,1],
    [0,1,1]
];

NGL.MarchingCubes.edgeIndex = [
    [0,1], [1,2], [2,3], [3,0], [4,5], [5,6],
    [6,7], [7,4], [0,4], [1,5], [2,6], [3,7]
];


//////////////
// Smoothing

NGL.laplacianSmooth = function( verts, faces, numiter, inflate ){

    // based on D. Xu, Y. Zhang (2009) Generating Triangulated Macromolecular
    // Surfaces by Euclidean Distance Transform. PLoS ONE 4(12): e8140.
    //
    // Permission to use, copy, modify, and distribute this program for
    // any purpose, with or without fee, is hereby granted, provided that
    // the notices on the head, the reference information, and this
    // copyright notice appear in all copies or substantial portions of
    // the Software. It is provided "as is" without express or implied
    // warranty.
    //
    // ported to JavaScript and adapted to NGL by Alexander Rose

    NGL.time( "NGL.laplacianSmooth" );

    numiter = numiter || 1;
    inflate = inflate || true;

    var nv = verts.length / 3;
    var nf = faces.length / 3;

    if( inflate ){

        // Buffer geometry is only used to calculate normals

        var bg = new THREE.BufferGeometry();
        bg.addAttribute( "position", new THREE.BufferAttribute( verts, 3 ) );
        bg.addAttribute( "index", new THREE.BufferAttribute( faces, 1 ) );

    }

    var tps = new Float32Array( nv * 3 );

    var ndeg = 20;
    var vertdeg = new Array( ndeg );

    for( var i = 0; i < ndeg; ++i ){
        vertdeg[ i ] = new Uint32Array( nv );
    }

    for( var i = 0; i < nv; ++i ){
        vertdeg[ 0 ][ i ] = 0;
    }

    var j, jl;
    var flagvert;

    // for each face

    for( var i = 0; i < nf; ++i ){

        var ao = i * 3;
        var bo = i * 3 + 1;
        var co = i * 3 + 2;

        // vertex a

        flagvert = true;
        for( j = 0, jl = vertdeg[ 0 ][ faces[ao] ]; j < jl; ++j ){
            if( faces[ bo ] == vertdeg[ j + 1 ][ faces[ ao ]] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ ao ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ ao ] ] ][ faces[ ao ] ] = faces[ bo ];
        }

        flagvert = true;
        for( j = 0, jl = vertdeg[ 0 ][ faces[ ao ] ]; j < jl; ++j ){
            if( faces[ co] == vertdeg[ j + 1 ][ faces[ ao ] ] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ ao ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ ao ] ] ][ faces[ ao ] ] = faces[ co ];
        }

        // vertex b

        flagvert = true;
        for( j = 0, jl = vertdeg[ 0 ][ faces[ bo ] ]; j < jl; ++j ){
            if( faces[ ao ] == vertdeg[ j + 1 ][ faces[ bo ] ] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ bo ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ bo ] ] ][ faces[ bo ] ] = faces[ ao ];
        }

        flagvert = true;
        for( j = 0, jl = vertdeg[ 0 ][ faces[ bo ] ]; j < jl; ++j ){
            if( faces[ co ] == vertdeg[ j + 1 ][ faces[ bo ] ] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ bo ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ bo ] ] ][ faces[ bo ] ] = faces[ co ];
        }

        // vertex c

        flagvert = true;
        for( j = 0; j < vertdeg[ 0 ][ faces[ co ] ]; ++j ){
            if( faces[ ao ] == vertdeg[ j + 1 ][ faces[ co ] ] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ co ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ co ] ] ][ faces[ co ] ] = faces[ ao ];
        }

        flagvert = true;
        for( j = 0, jl = vertdeg[ 0 ][ faces[ co ] ]; j < jl; ++j ){
            if( faces[ bo ] == vertdeg[ j + 1 ][ faces[ co ] ] ){
                flagvert = false;
                break;
            }
        }
        if( flagvert ){
            vertdeg[ 0 ][ faces[ co ] ]++;
            vertdeg[ vertdeg[ 0 ][ faces[ co ] ] ][ faces[ co ] ] = faces[ bo ];
        }

    }

    var wt = 1.0;
    var wt2 = 0.5;
    var i3, vi3, vi, vdi, wt_vi, wt2_vi;
    var ssign = -1;
    var scaleFactor = 1;
    var outwt = 0.75 / ( scaleFactor + 3.5 );  // area-preserving

    // smoothing iterations

    for( var k = 0; k < numiter; ++k ){

        // for each vertex

        for( var i = 0; i < nv; ++i ){

            i3 = i * 3;
            vdi = vertdeg[ 0 ][ i ];

            if( vdi < 3 ){

                tps[ i3     ] = verts[ i3     ];
                tps[ i3 + 1 ] = verts[ i3 + 1 ];
                tps[ i3 + 2 ] = verts[ i3 + 2 ];

            }else if( vdi === 3 || vdi === 4 ){

                tps[ i3     ] = 0;
                tps[ i3 + 1 ] = 0;
                tps[ i3 + 2 ] = 0;

                for( j = 0; j < vdi; ++j ){
                    vi3 = vertdeg[ j + 1 ][ i ] * 3;
                    tps[ i3     ] += verts[ vi3     ];
                    tps[ i3 + 1 ] += verts[ vi3 + 1 ];
                    tps[ i3 + 2 ] += verts[ vi3 + 2 ];
                }

                tps[ i3     ] += wt2 * verts[ i3 ];
                tps[ i3 + 1 ] += wt2 * verts[ i3 + 1 ];
                tps[ i3 + 2 ] += wt2 * verts[ i3 + 2 ];

                wt2_vi = wt2 + vdi;
                tps[ i3     ] /= wt2_vi;
                tps[ i3 + 1 ] /= wt2_vi;
                tps[ i3 + 2 ] /= wt2_vi;

            }else{

                tps[ i3     ] = 0;
                tps[ i3 + 1 ] = 0;
                tps[ i3 + 2 ] = 0;

                for( j = 0; j < vdi; ++j ){
                    vi3 = vertdeg[ j + 1 ][ i ] * 3;
                    tps[ i3     ] += verts[ vi3     ];
                    tps[ i3 + 1 ] += verts[ vi3 + 1 ];
                    tps[ i3 + 2 ] += verts[ vi3 + 2 ];
                }

                tps[ i3     ] += wt * verts[ i3 ];
                tps[ i3 + 1 ] += wt * verts[ i3 + 1 ];
                tps[ i3 + 2 ] += wt * verts[ i3 + 2 ];

                wt_vi = wt + vdi;
                tps[ i3     ] /= wt_vi;
                tps[ i3 + 1 ] /= wt_vi;
                tps[ i3 + 2 ] /= wt_vi;

            }

        }

        verts.set( tps );  // copy smoothed positions

        if( inflate ){

            bg.computeVertexNormals();
            var norms = bg.attributes.normal.array;
            var nv3 = nv * 3;

            for( i3 = 0; i3 < nv3; i3 += 3 ){

                // if(verts[i].inout) ssign=1;
                // else ssign=-1;

                verts[ i3     ] += ssign * outwt * norms[ i3     ];
                verts[ i3 + 1 ] += ssign * outwt * norms[ i3 + 1 ];
                verts[ i3 + 2 ] += ssign * outwt * norms[ i3 + 2 ];

            }

        }

    }

    if( inflate ){

        bg.dispose();

    }

    NGL.timeEnd( "NGL.laplacianSmooth" );

};


//////////////////////
// Molecular surface

NGL.WorkerRegistry.add( "molsurf", function( e, callback ){

    NGL.time( "WORKER molsurf" );

    var d = e.data;
    var p = d.params;

    if( d.atomSet ){

        self.molsurf = new NGL.MolecularSurface(
            new NGL.AtomSet().fromJSON( d.atomSet )
        );

    }

    var molsurf = self.molsurf;

    var surface = molsurf.getSurface(
        p.type, p.probeRadius, p.scaleFactor, p.smooth, p.lowRes, p.cutoff
    );

    NGL.timeEnd( "WORKER molsurf" );

    callback( surface.toJSON(), surface.getTransferable() );

} );


NGL.MolecularSurface = function( atomSet ){

    this.atomSet = atomSet;

};

NGL.MolecularSurface.prototype = {

    getSurface: function( type, probeRadius, scaleFactor, smooth, lowRes, cutoff ){

        var edtsurf = new NGL.EDTSurface( this.atomSet );
        var vol = edtsurf.getVolume(
            type, probeRadius, scaleFactor, lowRes, cutoff
        );
        var surface = vol.getSurface( 1, smooth );

        surface.info[ "type" ] = type;
        surface.info[ "probeRadius" ] = probeRadius;
        surface.info[ "scaleFactor" ] = scaleFactor;
        surface.info[ "smooth" ] = smooth;
        surface.info[ "lowRes" ] = lowRes;
        surface.info[ "cutoff" ] = cutoff;

        vol.dispose();

        return surface;

    },

    getSurfaceWorker: function( type, probeRadius, scaleFactor, smooth, lowRes, cutoff, callback ){

        if( NGL.useWorker && typeof Worker !== "undefined" &&
            typeof importScripts !== 'function'
        ){

            var atomSet = undefined;

            if( this.worker === undefined ){

                atomSet = this.atomSet.toJSON();
                this.worker = new NGL.Worker( "molsurf" );

            }

            this.worker.post(

                {
                    atomSet: atomSet,
                    params: {
                        type: type,
                        probeRadius: probeRadius,
                        scaleFactor: scaleFactor,
                        smooth: smooth,
                        lowRes: lowRes,
                        cutoff: cutoff
                    }
                },

                undefined,

                function( e ){

                    var surface = NGL.fromJSON( e.data );
                    callback( surface );

                }.bind( this ),

                function( e ){

                    console.warn(
                        "NGL.MolecularSurface.generateSurfaceWorker error - trying without worker", e
                    );
                    this.worker.terminate();
                    this.worker = undefined;

                    var surface = this.getSurface(
                        type, probeRadius, scaleFactor, smooth, lowRes, cutoff
                    );
                    callback( surface );

                }.bind( this )

            );

        }else{

            var surface = this.getSurface(
                type, probeRadius, scaleFactor, smooth, lowRes, cutoff
            );
            callback( surface );

        }

    },

    dispose: function(){

        if( this.worker ) this.worker.terminate();

    }

};


NGL.EDTSurface = function( atomSet ){

    // based on D. Xu, Y. Zhang (2009) Generating Triangulated Macromolecular
    // Surfaces by Euclidean Distance Transform. PLoS ONE 4(12): e8140.
    //
    // Permission to use, copy, modify, and distribute this program for
    // any purpose, with or without fee, is hereby granted, provided that
    // the notices on the head, the reference information, and this
    // copyright notice appear in all copies or substantial portions of
    // the Software. It is provided "as is" without express or implied
    // warranty.
    //
    // ported to JavaScript by biochem_fan (http://webglmol.sourceforge.jp/)
    // refactored by dkoes (https://github.com/dkoes)
    //
    // adapted to NGL by Alexander Rose

    var atoms = atomSet.atoms;
    var bbox = atomSet.getBoundingBox();

    var probeRadius, scaleFactor, cutoff, lowRes;
    var margin;
    var pmin, pmax, ptran, pbox, pLength, pWidth, pHeight;
    var matrix;
    var depty, widxz;
    var cutRadius;
    var setAtomID;
    var vpBits, vpDistance, vpAtomID;

    var radiusProperty;
    var radiusDict;
    var selection;

    function init( btype, _probeRadius, _scaleFactor, _cutoff, _lowRes, _setAtomID ){

        probeRadius = _probeRadius || 1.4;
        scaleFactor = _scaleFactor || 2.0;
        lowRes = _lowRes || false;
        setAtomID = _setAtomID || true;

        if( lowRes ){

            radiusProperty = "resname";
            radiusDict = NGL.ResidueRadii;

            selection = new NGL.Selection( ".CA" );

        }else{

            radiusProperty = "element";
            radiusDict = NGL.VdwRadii;

            selection = undefined;

        }

        var maxRadius = 0;
        for( var name in radiusDict ){
            maxRadius = Math.max( maxRadius, radiusDict[ name ] );
        }

        // need margin to avoid boundary/round off effects
        margin = ( 1 / scaleFactor ) * 3;
        margin += maxRadius;

        pmin = new THREE.Vector3().copy( bbox.min );
        pmax = new THREE.Vector3().copy( bbox.max );

        if( !btype ){

            pmin.subScalar( margin );
            pmax.addScalar( margin );

        }else{

            pmin.subScalar( probeRadius + margin );
            pmax.addScalar( probeRadius + margin );

        }

        pmin.multiplyScalar( scaleFactor ).floor().divideScalar( scaleFactor );
        pmax.multiplyScalar( scaleFactor ).ceil().divideScalar( scaleFactor );

        pbox = new THREE.Vector3()
            .subVectors( pmax, pmin )
            .multiplyScalar( scaleFactor )
            .ceil()
            .addScalar( 1 );

        pLength = pbox.x;
        pWidth = pbox.y;
        pHeight = pbox.z;

        var maxSize = Math.pow( 10, 6 ) * 256;
        var tmpSize = pHeight * pWidth * pLength * 3;

        if( maxSize <= tmpSize ){

            scaleFactor *= Math.pow( maxSize / tmpSize, 1/3 );

            pmin.multiplyScalar( scaleFactor ).floor().divideScalar( scaleFactor );
            pmax.multiplyScalar( scaleFactor ).ceil().divideScalar( scaleFactor );

            pbox = new THREE.Vector3()
                .subVectors( pmax, pmin )
                .multiplyScalar( scaleFactor )
                .ceil()
                .addScalar( 1 );

            pLength = pbox.x;
            pWidth = pbox.y;
            pHeight = pbox.z;

        }

        ptran = new THREE.Vector3().copy( pmin ).negate();

        // coordinate transformation matrix
        matrix = new THREE.Matrix4();
        matrix.multiply(
            new THREE.Matrix4().makeRotationY( THREE.Math.degToRad( 90 ) )
        );
        matrix.multiply(
            new THREE.Matrix4().makeScale(
                -1/scaleFactor, 1/scaleFactor, 1/scaleFactor
            )
        );
        matrix.multiply(
            new THREE.Matrix4().makeTranslation(
                -scaleFactor*ptran.z,
                -scaleFactor*ptran.y,
                -scaleFactor*ptran.x
            )
        );

        // boundingatom caches
        depty = {};
        widxz = {};
        boundingatom( btype );

        cutRadius = probeRadius * scaleFactor;

        if( _cutoff ){
            cutoff = _cutoff;
        }else{
            cutoff = Math.max( 0.1, -1.2 + scaleFactor * probeRadius );
        }

        vpBits = new Uint8Array( pLength * pWidth * pHeight );
        if( btype ){
            vpDistance = new Float64Array( pLength * pWidth * pHeight );
        }
        if( setAtomID ){
            vpAtomID = new Int32Array( pLength * pWidth * pHeight );
        }

    }

    // constants for vpBits bitmasks
    var INOUT = 1;
    var ISDONE = 2;
    var ISBOUND = 4;

    var nb = [
        new Int32Array([  1,  0,  0 ]), new Int32Array([ -1,  0,  0 ]),
        new Int32Array([  0,  1,  0 ]), new Int32Array([  0, -1,  0 ]),
        new Int32Array([  0,  0,  1 ]), new Int32Array([  0,  0, -1 ]),
        new Int32Array([  1,  1,  0 ]), new Int32Array([  1, -1,  0 ]),
        new Int32Array([ -1,  1,  0 ]), new Int32Array([ -1, -1,  0 ]),
        new Int32Array([  1,  0,  1 ]), new Int32Array([  1,  0, -1 ]),
        new Int32Array([ -1,  0,  1 ]), new Int32Array([ -1,  0, -1 ]),
        new Int32Array([  0,  1,  1 ]), new Int32Array([  0,  1, -1 ]),
        new Int32Array([  0, -1,  1 ]), new Int32Array([  0, -1, -1 ]),
        new Int32Array([  1,  1,  1 ]), new Int32Array([  1,  1, -1 ]),
        new Int32Array([  1, -1,  1 ]), new Int32Array([ -1,  1,  1 ]),
        new Int32Array([  1, -1, -1 ]), new Int32Array([ -1, -1,  1 ]),
        new Int32Array([ -1,  1, -1 ]), new Int32Array([ -1, -1, -1 ])
    ];

    //

    this.getVolume = function( type, probeRadius, scaleFactor, lowRes, cutoff, setAtomID ){

        NGL.time( "NGL.EDTSurface.getVolume" );

        var btype = type !== "vws";
        setAtomID = true;

        init( btype, probeRadius, scaleFactor, cutoff, lowRes, setAtomID );

        fillvoxels( btype );
        buildboundary();

        if( type === "ms" || type === "ses" ){

            fastdistancemap();

        }

        if( type === "ses" ){

            boundingatom( false );
            fillvoxelswaals();

        }

        marchingcubeinit( type );

        var vol = new NGL.Volume(
            type, "", vpBits, pHeight, pWidth, pLength, vpAtomID
        );

        vol.matrix.copy( matrix );

        NGL.timeEnd( "NGL.EDTSurface.getVolume" );

        return vol;

    };


    function boundingatom( btype ){

        var r, j, k;
        var txz, tdept, sradius, tradius, widxz_r;
        var depty_name, indx;

        for( var name in radiusDict ){

            r = radiusDict[ name ];

            if( depty[ name ] ) continue;

            if( !btype ){
                tradius = r * scaleFactor + 0.5;
            }else{
                tradius = ( r + probeRadius ) * scaleFactor + 0.5;
            }

            sradius = tradius * tradius;
            widxz_r = Math.floor( tradius ) + 1;
            depty_name = new Int32Array( widxz_r * widxz_r );
            indx = 0;

            for( j = 0; j < widxz_r; ++j ){

                for( k = 0; k < widxz_r; ++k ){

                    txz = j * j + k * k;

                    if( txz > sradius ){

                        depty_name[ indx ] = -1;

                    }else{

                        tdept = Math.sqrt( sradius - txz );
                        depty_name[ indx ] = Math.floor( tdept );

                    }

                    ++indx;

                }

            }

            widxz[ name ] = widxz_r;
            depty[ name ] = depty_name;

        }

    }

    function fillatom( atomIndex ){

        var cx, cy, cz, ox, oy, oz, mi, mj, mk, i, j, k, si, sj, sk;
        var ii, jj, kk;

        var atom = atoms[ atomIndex ];

        if( selection && !selection.test( atom ) ) return;

        cx = Math.floor( 0.5 + scaleFactor * ( atom.x + ptran.x ) );
        cy = Math.floor( 0.5 + scaleFactor * ( atom.y + ptran.y ) );
        cz = Math.floor( 0.5 + scaleFactor * ( atom.z + ptran.z ) );

        var at = atom[ radiusProperty ];
        var depty_at = depty[ at ];
        var nind = 0;
        var cnt = 0;
        var pWH = pWidth * pHeight;
        var n = widxz[ at ];

        var depty_at_nind;

        for( i = 0; i < n; ++i ){
        for( j = 0; j < n; ++j ) {

            depty_at_nind = depty_at[ nind ];

            if( depty_at_nind != -1 ){

                for( ii = -1; ii < 2; ++ii ){
                for( jj = -1; jj < 2; ++jj ){
                for( kk = -1; kk < 2; ++kk ){

                    if( ii !== 0 && jj !== 0 && kk !== 0 ){

                        mi = ii * i;
                        mk = kk * j;

                        for( k = 0; k <= depty_at_nind; ++k ){

                            mj = k * jj;
                            si = cx + mi;
                            sj = cy + mj;
                            sk = cz + mk;

                            if( si < 0 || sj < 0 || sk < 0 ||
                                si >= pLength || sj >= pWidth || sk >= pHeight
                            ){
                                continue;
                            }

                            var index = si * pWH + sj * pHeight + sk;

                            if( !setAtomID ){

                                vpBits[ index ] |= INOUT;

                            }else{

                                if( !( vpBits[ index ] & INOUT ) ){

                                    vpBits[ index ] |= INOUT;
                                    vpAtomID[ index ] = atomIndex;

                                }else if( vpBits[ index ] & INOUT ){
                                // }else{

                                    var atom2 = atoms[ vpAtomID[ index ] ];

                                    if( atom2 !== atom ){

                                        ox = cx + mi - Math.floor( 0.5 + scaleFactor * ( atom2.x + ptran.x ) );
                                        oy = cy + mj - Math.floor( 0.5 + scaleFactor * ( atom2.y + ptran.y ) );
                                        oz = cz + mk - Math.floor( 0.5 + scaleFactor * ( atom2.z + ptran.z ) );

                                        if( mi * mi + mj * mj + mk * mk <
                                            ox * ox + oy * oy + oz * oz
                                        ){
                                            vpAtomID[ index ] = atomIndex;
                                        }

                                    }

                                }

                            }

                        }// k

                    }// if

                }// kk
                }// jj
                }// ii

            }// if

            nind++;

        }// j
        }// i

    }

    function fillvoxels( btype ){

        NGL.time( "NGL.EDTSurface fillvoxels" );

        var i, il;

        for( i = 0, il = vpBits.length; i < il; ++i ){
            vpBits[ i ] = 0;
            if( btype ) vpDistance[ i ] = -1.0;
            if( setAtomID ) vpAtomID[ i ] = -1;
        }

        for( i = 0, il = atoms.length; i < il; ++i ){
            fillatom( i );
        }

        for( i = 0, il = vpBits.length; i < il; ++i ){
            if( vpBits[ i ] & INOUT ){
                vpBits[ i ] |= ISDONE;
            }
        }

        NGL.timeEnd( "NGL.EDTSurface fillvoxels" );

    }

    function fillAtomWaals( atomIndex ){

        var cx, cy, cz, ox, oy, oz, nind = 0;
        var mi, mj, mk, si, sj, sk, i, j, k, ii, jj, kk, n;

        var atom = atoms[ atomIndex ];

        if( selection && !selection.test( atom ) ) return;

        cx = Math.floor( 0.5 + scaleFactor * ( atom.x + ptran.x ) );
        cy = Math.floor( 0.5 + scaleFactor * ( atom.y + ptran.y ) );
        cz = Math.floor( 0.5 + scaleFactor * ( atom.z + ptran.z ) );

        var at = atom[ radiusProperty ];
        var pWH = pWidth * pHeight;

        for( i = 0, n = widxz[at]; i < n; ++i ){
        for( j = 0; j < n; ++j ){

            if( depty[ at ][ nind ] != -1 ){

                for( ii = -1; ii < 2; ++ii ){
                for( jj = -1; jj < 2; ++jj ){
                for( kk = -1; kk < 2; ++kk ){

                    if( ii !== 0 && jj !== 0 && kk !== 0 ){

                        mi = ii * i;
                        mk = kk * j;

                        for( k = 0; k <= depty[ at ][ nind ]; ++k ){

                            mj = k * jj;
                            si = cx + mi;
                            sj = cy + mj;
                            sk = cz + mk;

                            if( si < 0 || sj < 0 || sk < 0 ||
                                si >= pLength || sj >= pWidth || sk >= pHeight
                            ){
                                continue;
                            }

                            var index = si * pWH + sj * pHeight + sk;

                            if( !( vpBits[ index ] & ISDONE ) ){

                                vpBits[ index ] |= ISDONE;
                                if( setAtomID ) vpAtomID[ index ] = atom.index;

                            }else if( setAtomID ){

                                var atom2 = atoms[ vpAtomID[ index ] ];
                                ox = Math.floor( 0.5 + scaleFactor * ( atom2.x + ptran.x ) );
                                oy = Math.floor( 0.5 + scaleFactor * ( atom2.y + ptran.y ) );
                                oz = Math.floor( 0.5 + scaleFactor * ( atom2.z + ptran.z ) );

                                if( mi * mi + mj * mj + mk * mk <
                                    ox * ox + oy * oy + oz * oz
                                ){
                                    vpAtomID[ index ] = atom.index;
                                }

                            }

                        }// k

                    }// if

                }// kk
                }// jj
                }// ii

            }// if

            nind++;

        }// j
        }// i

    }

    function fillvoxelswaals(){

        var i, il;

        for( i = 0, il = vpBits.length; i < il; ++i ){
            vpBits[ i ] &= ~ISDONE;  // not isdone
        }

        for( i = 0, il = atoms.length; i < il; ++i ){
            fillAtomWaals( i );
        }

    }

    function buildboundary(){

        var i, j, k;
        var pWH = pWidth * pHeight;

        for( i = 0; i < pLength; ++i ){
        for( j = 0; j < pHeight; ++j ){
        for( k = 0; k < pWidth; ++k ){

            var index = i * pWH + k * pHeight + j;

            if( vpBits[ index ] & INOUT ){

                // var flagbound = false;
                var ii = 0;

                // while( !flagbound && ii < 26 ){
                while( ii < 26 ){

                    var ti = i + nb[ ii ][ 0 ];
                    var tj = j + nb[ ii ][ 2 ];
                    var tk = k + nb[ ii ][ 1 ];

                    if( ti > -1 && ti < pLength &&
                        tk > -1 && tk < pWidth &&
                        tj > -1 && tj < pHeight &&
                        !( vpBits[ ti * pWH + tk * pHeight + tj ] & INOUT )
                    ){

                        vpBits[ index ] |= ISBOUND;
                        // flagbound = true;
                        break;

                    }else{

                        ii++;

                    }

                }

            }

        } // k
        } // j
        } // i

    }

    function fastdistancemap(){

        NGL.time( "NGL.EDTSurface fastdistancemap" );

        var eliminate = 0;
        var certificate;
        var i, j, k, n;

        var boundPoint = new NGL.Grid(
            pLength, pWidth, pHeight, Uint16Array, 3
        );
        var pWH = pWidth * pHeight;
        var cutRSq = cutRadius * cutRadius;

        var totalsurfacevox = 0;
        var totalinnervox = 0;

        var index;

        // console.log( "lwh", pLength * pWidth * pHeight );
        console.log( "l, w, h", pLength, pWidth, pHeight );

        for( i = 0; i < pLength; ++i ){
            for( j = 0; j < pWidth; ++j ){
                for( k = 0; k < pHeight; ++k ){

                    index = i * pWH + j * pHeight + k;

                    vpBits[ index ] &= ~ISDONE;

                    if( vpBits[ index ] & INOUT ){

                        if( vpBits[ index ] & ISBOUND ){

                            boundPoint.set(
                                i, j, k,
                                i, j, k
                            );

                            vpDistance[ index ] = 0;
                            vpBits[ index ] |= ISDONE;

                            totalsurfacevox += 1;

                        }else{

                            totalinnervox += 1;

                        }

                    }

                }
            }
        }

        console.log( "totalsurfacevox", totalsurfacevox );
        console.log( "totalinnervox", totalinnervox );

        var inarray = new Int32Array( 3 * totalsurfacevox );
        var positin = 0;
        var outarray = new Int32Array( 3 * totalsurfacevox );
        var positout = 0;

        for( i = 0; i < pLength; ++i ){
            for( j = 0; j < pWidth; ++j ){
                for( k = 0; k < pHeight; ++k ){

                    index = i * pWH + j * pHeight + k;

                    if( vpBits[ index ] & ISBOUND ){

                        inarray[ positin     ] = i;
                        inarray[ positin + 1 ] = j;
                        inarray[ positin + 2 ] = k;
                        positin += 3;

                        vpBits[ index ] &= ~ISBOUND;

                    }

                }
            }
        }

        do{

            positout = fastoneshell( inarray, boundPoint, positin, outarray );
            positin = 0;

            console.log( "positout", positout / 3 );

            for( i = 0, n = positout; i < n; i+=3 ){

                index = pWH * outarray[ i ] + pHeight * outarray[ i + 1 ] + outarray[ i + 2 ];
                vpBits[ index ] &= ~ISBOUND;

                if( vpDistance[ index ] <= 1.0404 * cutRSq ){
                //if( vpDistance[ index ] <= 1.02 * cutRadius ){

                    inarray[ positin     ] = outarray[ i     ];
                    inarray[ positin + 1 ] = outarray[ i + 1 ];
                    inarray[ positin + 2 ] = outarray[ i + 2 ];
                    positin += 3;

                }

            }

        }while( positin > 0 );

        // var cutsf = Math.max( 0, scaleFactor - 0.5 );
        // cutoff = cutRadius - 0.5 / ( 0.1 + cutsf );
        var cutoffSq = cutoff * cutoff;

        var index2;
        var bp = new Uint16Array( 3 );

        for( i = 0; i < pLength; ++i ){
            for( j = 0; j < pWidth; ++j ){
                for( k = 0; k < pHeight; ++k ){

                    index = i * pWH + j * pHeight + k;
                    vpBits[ index ] &= ~ISBOUND;

                    // ses solid

                    if( vpBits[ index ] & INOUT ) {

                        if( !( vpBits[ index ] & ISDONE ) ||
                            ( ( vpBits[ index ] & ISDONE ) && vpDistance[ index ] >= cutoffSq )
                        ){

                            vpBits[ index ] |= ISBOUND;

                            if( setAtomID && ( vpBits[ index ] & ISDONE ) ){

                                boundPoint.toArray( i, j, k, bp );
                                index2 = bp[ 0 ] * pWH + bp[ 1 ] * pHeight + bp[ 2 ];

                                vpAtomID[ index ] = vpAtomID[ index2 ];

                            }

                        }
                    }

                }
            }
        }

        NGL.timeEnd( "NGL.EDTSurface fastdistancemap" );

    }

    function fastoneshell( inarray, boundPoint, positin, outarray ){

        console.log( "positin", positin / 3 );

        // *allocout,voxel2
        // ***boundPoint, int*
        // outnum, int *elimi)
        var tx, ty, tz;
        var dx, dy, dz;
        var i, j, n;
        var square;
        var index;
        var nb_j;
        var bp = new Uint16Array( 3 );
        var positout = 0;

        if( positin === 0 ){
            return positout;
        }

        var tnv_ix = -1;
        var tnv_iy = -1;
        var tnv_iz = -1;

        var pWH = pWidth * pHeight;

        for( i = 0, n = positin; i < n; i+=3 ){

            tx = inarray[ i     ];
            ty = inarray[ i + 1 ];
            tz = inarray[ i + 2 ];
            boundPoint.toArray( tx, ty, tz, bp );

            for( j = 0; j < 6; ++j ){

                nb_j = nb[ j ];
                tnv_ix = tx + nb_j[ 0 ];
                tnv_iy = ty + nb_j[ 1 ];
                tnv_iz = tz + nb_j[ 2 ];

                if( tnv_ix < pLength && tnv_ix > -1 &&
                    tnv_iy < pWidth  && tnv_iy > -1 &&
                    tnv_iz < pHeight && tnv_iz > -1
                ){

                    index = tnv_ix * pWH + pHeight * tnv_iy + tnv_iz;

                    if( ( vpBits[ index ] & INOUT ) && !( vpBits[ index ] & ISDONE ) ){

                        boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        vpDistance[ index ] = square;
                        vpBits[ index ] |= ISDONE;
                        vpBits[ index ] |= ISBOUND;

                        outarray[ positout     ] = tnv_ix;
                        outarray[ positout + 1 ] = tnv_iy;
                        outarray[ positout + 2 ] = tnv_iz;
                        positout += 3;

                    }else if( ( vpBits[ index ] & INOUT ) && ( vpBits[ index ] & ISDONE ) ){

                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        if( square < vpDistance[ index ] ){

                            boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                            vpDistance[ index ] = square;

                            if( !( vpBits[ index ] & ISBOUND ) ){

                                vpBits[ index ] |= ISBOUND;

                                outarray[ positout     ] = tnv_ix;
                                outarray[ positout + 1 ] = tnv_iy;
                                outarray[ positout + 2 ] = tnv_iz;
                                positout += 3;

                            }

                        }

                    }

                }
            }
        }

        // console.log("part1", positout);

        for( i = 0, n = positin; i < n; i+=3 ){

            tx = inarray[ i     ];
            ty = inarray[ i + 1 ];
            tz = inarray[ i + 2 ];
            boundPoint.toArray( tx, ty, tz, bp );

            for (j = 6; j < 18; j++) {

                nb_j = nb[ j ];
                tnv_ix = tx + nb_j[ 0 ];
                tnv_iy = ty + nb_j[ 1 ];
                tnv_iz = tz + nb_j[ 2 ];

                if( tnv_ix < pLength && tnv_ix > -1 &&
                    tnv_iy < pWidth  && tnv_iy > -1 &&
                    tnv_iz < pHeight && tnv_iz > -1
                ) {

                    index = tnv_ix * pWH + pHeight * tnv_iy + tnv_iz;

                    if ((vpBits[index] & INOUT) && !(vpBits[index] & ISDONE)) {

                        boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        vpDistance[index] = square;
                        vpBits[index] |= ISDONE;
                        vpBits[index] |= ISBOUND;

                        outarray[ positout     ] = tnv_ix;
                        outarray[ positout + 1 ] = tnv_iy;
                        outarray[ positout + 2 ] = tnv_iz;
                        positout += 3;

                    } else if ((vpBits[index] & INOUT) && (vpBits[index] & ISDONE)) {

                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        if (square < vpDistance[index]) {

                            boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                            vpDistance[index] = square;

                            if (!(vpBits[index] & ISBOUND)) {

                                vpBits[index] |= ISBOUND;

                                outarray[ positout     ] = tnv_ix;
                                outarray[ positout + 1 ] = tnv_iy;
                                outarray[ positout + 2 ] = tnv_iz;
                                positout += 3;

                            }

                        }

                    }

                }
            }
        }

        // console.log("part2", positout);

        for( i = 0, n = positin; i < n; i+=3 ){

            tx = inarray[ i     ];
            ty = inarray[ i + 1 ];
            tz = inarray[ i + 2 ];
            boundPoint.toArray( tx, ty, tz, bp );

            for (j = 18; j < 26; j++) {

                nb_j = nb[ j ];
                tnv_ix = tx + nb_j[ 0 ];
                tnv_iy = ty + nb_j[ 1 ];
                tnv_iz = tz + nb_j[ 2 ];

                if( tnv_ix < pLength && tnv_ix > -1 &&
                    tnv_iy < pWidth  && tnv_iy > -1 &&
                    tnv_iz < pHeight && tnv_iz > -1
                ){

                    index = tnv_ix * pWH + pHeight * tnv_iy + tnv_iz;

                    if ((vpBits[index] & INOUT) && !(vpBits[index] & ISDONE)) {

                        boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        vpDistance[index] = square;
                        vpBits[index] |= ISDONE;
                        vpBits[index] |= ISBOUND;

                        outarray[ positout     ] = tnv_ix;
                        outarray[ positout + 1 ] = tnv_iy;
                        outarray[ positout + 2 ] = tnv_iz;
                        positout += 3;

                    } else if ((vpBits[index] & INOUT)  && (vpBits[index] & ISDONE)) {

                        dx = tnv_ix - bp[ 0 ];
                        dy = tnv_iy - bp[ 1 ];
                        dz = tnv_iz - bp[ 2 ];
                        square = dx * dx + dy * dy + dz * dz;
                        //square = Math.sqrt( square );

                        if (square < vpDistance[index]) {

                            boundPoint.fromArray( tnv_ix, tnv_iy, tnv_iz, bp );
                            vpDistance[index] = square;

                            if (!(vpBits[index] & ISBOUND)) {

                                vpBits[index] |= ISBOUND;

                                outarray[ positout     ] = tnv_ix;
                                outarray[ positout + 1 ] = tnv_iy;
                                outarray[ positout + 2 ] = tnv_iz;
                                positout += 3;

                            }

                        }

                    }

                }
            }
        }

        // console.log("part3", positout);

        return positout;

    }

    function marchingcubeinit( stype ){

        var n = vpBits.length;

        if( stype === "vws" ) {

            for( var i = 0; i < n; ++i ){

                vpBits[ i ] &= ~ISBOUND;
                vpBits[ i ] = !!( vpBits[ i ] & ISDONE ) ? 1 : 0;

            }

        }else if( stype === "ms" ){  // ses without vdw => ms

            for( var i = 0; i < n; ++i ){

                vpBits[ i ] &= ~ISDONE;
                if( vpBits[ i ] & ISBOUND ){
                    vpBits[ i ] |= ISDONE;
                }
                vpBits[ i ] &= ~ISBOUND;
                vpBits[ i ] = !!( vpBits[ i ] & ISDONE ) ? 1 : 0;

            }

        }else if( stype === "ses" ){

            for( var i = 0; i < n; ++i ){

                if( ( vpBits[ i ] & ISBOUND ) && ( vpBits[ i ] & ISDONE ) ){
                    vpBits[ i ] &= ~ISBOUND;
                }else if( ( vpBits[ i ] & ISBOUND ) && !( vpBits[ i ] & ISDONE ) ){
                    vpBits[ i ] |= ISDONE;
                }
                vpBits[ i ] = !!( vpBits[ i ] & ISDONE ) ? 1 : 0;

            }

        }else if( stype === "sas" ){

            for( var i = 0; i < n; ++i ){

                vpBits[ i ] &= ~ISBOUND;
                vpBits[ i ] = !!( vpBits[ i ] & ISDONE ) ? 1 : 0;

            }

        }

    };

};
