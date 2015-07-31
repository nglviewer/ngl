/**
 * @file Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////////
// Surface

NGL.Surface = function( name, path, geometry ){

    this.name = name;
    this.path = path;

    this.center = new THREE.Vector3();
    this.boundingBox = new THREE.Box3();

    if( geometry ) this.fromGeometry( geometry );

};

NGL.Surface.prototype = {

    constructor: NGL.Surface,

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

        this.position = position;
        this.index = index;
        this.normal = normal;

        this.size = position.length / 3;

        NGL.timeEnd( "NGL.GeometrySurface.setGeometry" );

    },

    getPosition: function(){

        return this.position;

    },

    getColor: function( color ){

        var tc = new THREE.Color( color );
        var col = NGL.Utils.uniformArray3(
            this.size, tc.r, tc.g, tc.b
        );

        return col;

    },

    getNormal: function(){

        return this.normal;

    },

    getIndex: function(){

        return this.index;

    },

    filterData: function( minValue, maxValue ){

        // nothing to do

    },

    getDataPosition: function(){

        return this.getPosition.apply( this, arguments );

    },

    getDataColor: function(){

        return this.getColor.apply( this, arguments );

    },

    getDataSize: function( size ){

        return NGL.Utils.uniformArray( this.size, size );

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

            position: this.position,
            index: this.index,
            normal: this.normal,

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

        this.position = input.position;
        this.index = input.index;
        this.normal = input.normal;

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

        return transferable;

    }

};


///////////
// Volume

NGL.Worker.add( "surf", function( e ){

    NGL.time( "WORKER surf" );

    if( self.vol === undefined ) self.vol = new NGL.Volume();

    var vol = self.vol;
    var d = e.data;
    var p = d.params;

    if( d.vol ) vol.fromJSON( d.vol );

    vol.generateSurface( p.isolevel, p.smooth );

    NGL.timeEnd( "WORKER surf" );

    var meshData = {
        position: vol.position,
        index: vol.index,
        normal: vol.normal
    };

    var transferable = [
        vol.position.buffer,
        vol.index.buffer
    ];

    if( vol.normal ) transferable.push( vol.normal.buffer );

    self.postMessage( meshData, transferable );

} );


NGL.Volume = function( name, path, data, nx, ny, nz ){

    this.name = name;
    this.path = path;

    this.matrix = new THREE.Matrix4();
    this.center = new THREE.Vector3();
    this.boundingBox = new THREE.Box3();

    this.setData( data, nx, ny, nz );

};

NGL.Volume.prototype = {

    constructor: NGL.Volume,

    setData: function( data, nx, ny, nz ){

        this.nx = nx || 1;
        this.ny = ny || 1;
        this.nz = nz || 1;

        this.data = data || new Float32Array( 1 );
        this.__data = this.data;

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

    },

    generateSurface: function( isolevel, smooth ){

        isolevel = isNaN( isolevel ) ? this.getIsolevelForSigma( 2 ) : isolevel;
        smooth = smooth || 0;

        if( isolevel === this.__isolevel && smooth === this.__smooth ){

            // already generated
            return;

        }

        //

        if( this.mc === undefined ){

            this.mc = new NGL.MarchingCubes2(
                this.__data, this.nx, this.ny, this.nz
            );

        }

        var sd;

        if( smooth ){

            sd = this.mc.triangulate( isolevel, true );
            NGL.laplacianSmooth( sd.position, sd.index, smooth, true );

        }else{

            sd = this.mc.triangulate( isolevel );

        }

        this.position = sd.position;
        this.normal = sd.normal;
        this.index = sd.index;

        this.size = this.position.length / 3;

        this.matrix.applyToVector3Array( this.position );

        if( this.normal ){

            var me = this.matrix.elements;
            var r0 = new THREE.Vector3( me[0], me[1], me[2] );
            var r1 = new THREE.Vector3( me[4], me[5], me[6] );
            var r2 = new THREE.Vector3( me[8], me[9], me[10] );
            var cp = new THREE.Vector3();
            //        [ r0 ]       [ r1 x r2 ]
            // M3x3 = [ r1 ]   N = [ r2 x r0 ]
            //        [ r2 ]       [ r0 x r1 ]
            var normalMatrix = new THREE.Matrix3();
            var ne = normalMatrix.elements;
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
            normalMatrix.applyToVector3Array( this.normal );

        }

        this.__isolevel = isolevel;
        this.__smooth = smooth;

    },

    generateSurfaceWorker: function( isolevel, smooth, callback ){

        isolevel = isNaN( isolevel ) ? this.getIsolevelForSigma( 2 ) : isolevel;
        smooth = smooth || 0;

        //

        if( isolevel === this.__isolevel && smooth === this.__smooth ){

            // already generated
            callback();

        }else if( NGL.useWorker && typeof Worker !== "undefined" &&
            typeof importScripts !== 'function'
        ){

            var __timeName = "NGL.Volume.generateSurfaceWorker " + this.name;
            NGL.time( __timeName );

            var vol = undefined;

            if( this.worker === undefined ){

                vol = this.toJSON();
                this.worker = NGL.Worker.make( "surf" );

            }

            this.worker.onerror = function( e ){

                console.warn(
                    "NGL.Volume.generateSurfaceWorker error - trying without worker", e
                );
                this.worker.terminate();
                this.worker = undefined;

                this.generateSurface( isolevel, smooth );
                callback();

            }.bind( this );

            this.worker.onmessage = function( e ){

                NGL.timeEnd( __timeName );

                // if( NGL.debug ) console.log( e.data );

                this.position = e.data.position;
                this.normal = e.data.normal;
                this.index = e.data.index;

                this.size = this.position.length / 3;

                this.__isolevel = isolevel;
                this.__smooth = smooth;

                callback();

            }.bind( this );

            this.worker.postMessage( {
                vol: vol,
                params: {
                    isolevel: isolevel,
                    smooth: smooth
                }
            } );

        }else{

            this.generateSurface( isolevel, smooth );
            callback();

        }

    },

    getIsolevelForSigma: function( sigma ){

        sigma = sigma !== undefined ? sigma : 2;

        return this.getDataMean() + sigma * this.getDataRms();

    },

    getSigmaForIsolevel: function( isolevel ){

        isolevel = isolevel !== undefined ? isolevel : 0;

        return ( isolevel - this.getDataMean() ) / this.getDataRms();

    },

    getPosition: function(){

        return this.position;

    },

    getColor: function( color ){

        // re-use array

        var tc = new THREE.Color( color );
        var col = NGL.Utils.uniformArray3(
            this.size, tc.r, tc.g, tc.b
        );

        return col;

    },

    getNormal: function(){

        return this.normal;

    },

    getIndex: function(){

        return this.index;

    },

    filterData: function( minValue, maxValue ){

        if( isNaN( minValue ) && this.header ){
            minValue = this.header.DMEAN + 2.0 * this.header.ARMS;
        }

        minValue = ( minValue !== undefined && !isNaN( minValue ) ) ? minValue : -Infinity;
        maxValue = maxValue !== undefined ? maxValue : Infinity;

        if( !this.dataPosition ){

            this.makeDataPosition();

        }

        var dataPosition = this.__dataPosition;
        var data = this.__data;

        if( minValue === this.__minValue && maxValue == this.__maxValue ){

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

                if( v >= minValue && v <= maxValue ){

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

    getDataPosition: function(){

        return this.dataPosition;

    },

    getDataColor: function( color ){

        var spectralScale = chroma
            .scale( 'Spectral' )
            .mode('lch')
            .domain( [ this.getDataMin(), this.getDataMax() ]);

        var n = this.dataPosition.length / 3;
        var data = this.data;
        var array;

        switch( color ){

            case "value":

                array = new Float32Array( n * 3 );
                for( var i = 0; i < n; ++i ){
                    var i3 = i * 3;
                    var c = spectralScale( data[ i ] )._rgb
                    array[ i3 + 0 ] = c[ 0 ] / 255;
                    array[ i3 + 1 ] = c[ 1 ] / 255;
                    array[ i3 + 2 ] = c[ 2 ] / 255;
                }
                break;

            default:

                var tc = new THREE.Color( color );
                array = NGL.Utils.uniformArray3(
                    n, tc.r, tc.g, tc.b
                );
                break;

        }

        return array;

    },

    getDataSize: function( size, scale ){

        var n = this.dataPosition.length / 3;
        var array;

        switch( size ){

            case "value":

                array = new Float32Array( this.data );
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

            this.data,

            this.nx,
            this.ny,
            this.nz

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

            data: this.data,

            nx: this.nx,
            ny: this.ny,
            nz: this.nz,

            matrix: this.matrix.toArray(),

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
            input.nz

        );

        this.matrix.fromArray( input.matrix );

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

            this.data.buffer

        ];

        return transferable;

    },

    dispose: function(){

        if( this.worker ) this.worker.terminate();

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

NGL.MarchingCubes2 = function( field, nx, ny, nz ){

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

        NGL.timeEnd( "NGL.MarchingCubes2.triangulate" );

        return {
            position: new Float32Array( positionArray ),
            normal: noNormals ? undefined : new Float32Array( normalArray ),
            index: new Uint32Array( indexArray )
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

NGL.Worker.add( "molsurf", function( e ){

    NGL.time( "WORKER molsurf" );

    var d = e.data;
    var p = d.params;

    if( d.atomSet ){

        self.molsurf = new NGL.MolecularSurface(
            new NGL.AtomSet().fromJSON( d.atomSet )
        );

    }

    var molsurf = self.molsurf;

    molsurf.generateSurface(
        p.type, p.probeRadius, p.scaleFactor, p.smooth, p.lowRes
    );

    NGL.timeEnd( "WORKER molsurf" );

    var meshData = {
        position: molsurf.position,
        index: molsurf.index,
        normal: molsurf.normal
    };

    var transferable = [
        molsurf.position.buffer,
        molsurf.index.buffer
    ];

    if( molsurf.normal ) transferable.push( molsurf.normal.buffer );

    self.postMessage( meshData, transferable );

} );


NGL.MolecularSurface = function( atomSet ){

    this.atomSet = atomSet;

};

NGL.MolecularSurface.prototype = {

    generateSurface: function( type, probeRadius, scaleFactor, smooth, lowRes ){

        if( type === this.__type && probeRadius === this.__probeRadius &&
            scaleFactor === this.__scaleFactor && smooth === this.__smooth &&
            lowRes === this.lowRes
        ){

            // already generated
            return;

        }

        var edtsurf = new NGL.EDTSurface( this.atomSet );
        var vol = edtsurf.getVolume(
            type, probeRadius, scaleFactor, lowRes
        );
        vol.generateSurface( 1, smooth );

        this.position = vol.getPosition();
        this.normal = vol.getNormal();
        this.index = vol.getIndex();

        this.size = this.position.length / 3;

        this.__type = type;
        this.__probeRadius = probeRadius;
        this.__scaleFactor = scaleFactor;
        this.__smooth = smooth;
        this.__lowRes = lowRes;

    },

    generateSurfaceWorker: function( type, probeRadius, scaleFactor, smooth, lowRes, callback ){

        if( type === this.__type && probeRadius === this.__probeRadius &&
            scaleFactor === this.__scaleFactor && smooth === this.__smooth &&
            lowRes === this.__lowRes
        ){

            // already generated
            callback();

        }else if( NGL.useWorker && typeof Worker !== "undefined" &&
            typeof importScripts !== 'function'
        ){

            var __timeName = "NGL.MolecularSurface.generateSurfaceWorker " + type;

            NGL.time( __timeName );

            var atomSet = undefined;

            if( this.worker === undefined ){

                atomSet = this.atomSet.toJSON();
                this.worker = NGL.Worker.make( "molsurf" );

            }

            this.worker.onerror = function( e ){

                console.warn(
                    "NGL.MolecularSurface.generateSurfaceWorker error - trying without worker", e
                );
                this.worker.terminate();
                this.worker = undefined;

                this.generateSurface( type, probeRadius, scaleFactor, smooth, lowRes );
                callback();

            }.bind( this );

            this.worker.onmessage = function( e ){

                NGL.timeEnd( __timeName );

                // if( NGL.debug ) console.log( e.data );

                this.position = e.data.position;
                this.normal = e.data.normal;
                this.index = e.data.index;

                this.size = this.position.length / 3;

                this.__type = type;
                this.__probeRadius = probeRadius;
                this.__scaleFactor = scaleFactor;
                this.__smooth = smooth;
                this.__lowRes = lowRes;

                callback();

            }.bind( this );

            this.worker.postMessage( {
                atomSet: atomSet,
                params: {
                    type: type,
                    probeRadius: probeRadius,
                    scaleFactor: scaleFactor,
                    smooth: smooth,
                    lowRes: lowRes
                }
            } );

        }else{

            this.generateSurface( type, probeRadius, scaleFactor, smooth, lowRes );
            callback();

        }

    },

    getPosition: function(){

        return this.position;

    },

    getColor: function( color ){

        // re-use array

        var tc = new THREE.Color( color );
        var col = NGL.Utils.uniformArray3(
            this.size, tc.r, tc.g, tc.b
        );

        return col;

    },

    getNormal: function(){

        return this.normal;

    },

    getIndex: function(){

        return this.index;

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

    var probeRadius, scaleFactor, cutoff;
    var margin;
    var pmin, pmax, ptran, pbox, pLength, pWidth, pHeight;
    var matrix;
    var depty, widxz;
    var cutRadius;
    var vpBits, vpDistance, vpAtomID;

    var radiusProperty;
    var radiusDict;

    function init( btype, _probeRadius, _scaleFactor, _cutoff, lowRes ){

        if( lowRes ){

            radiusProperty = "resname";
            radiusDict = NGL.ResidueRadii;

            atoms = atomSet.getAtoms( new NGL.Selection( ".CA" ) );

        }else{

            radiusProperty = "element";
            radiusDict = NGL.VdwRadii;

            atoms = atomSet.atoms;

        }

        // 2 is .5A grid; if this is made user configurable and
        // also have to adjust offset used to find non-shown atoms
        // FIXME scaleFactor = 0.5;

        probeRadius = _probeRadius || 1.4;
        scaleFactor = _scaleFactor || 2.0;
        cutoff = _cutoff || 2.0;

        // need margin to avoid boundary/round off effects
        margin = ( 1 / scaleFactor ) * 5.5;
        if( lowRes ) margin += 10.0;

        pmin = new THREE.Vector3().copy( bbox.min );
        pmax = new THREE.Vector3().copy( bbox.max );

        if( !btype ){

            pmin.addScalar( -margin );  // TODO need to update THREE for subScalar
            pmax.addScalar( margin );

        }else{

            pmin.addScalar( -( probeRadius + margin ) );  // TODO need to update THREE for subScalar
            pmax.addScalar( probeRadius + margin );

        }

        ptran = new THREE.Vector3().copy( pmin ).negate();

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

        // console.log( depty );
        // console.log( widxz );

        cutRadius = probeRadius * scaleFactor;

        vpBits = new Uint8Array( pLength * pWidth * pHeight );
        // float32 doesn't play nicely with native floats (which are 64)
        vpDistance = new Float64Array( pLength * pWidth * pHeight );
        vpAtomID = new Int32Array( pLength * pWidth * pHeight );

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

    this.getVolume = function( type, probeRadius, scaleFactor, lowRes ){

        NGL.time( "NGL.EDTSurface.getVolume" );

        init( type !== "vws", probeRadius, scaleFactor, undefined, lowRes );

        fillvoxels();
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
            type, "", vpBits, pHeight, pWidth, pLength
        );

        vol.matrix.copy( matrix );

        NGL.timeEnd( "NGL.EDTSurface.getVolume" );

        return vol;

    };

    function boundingatom( btype ){

        var j, k;
        var txz, tdept, sradius, tradius, widxz_r;
        var indx;

        for( var name in radiusDict ){

            var r = radiusDict[ name ];

            if( depty[ name ] ) continue;

            if( !btype ){
                tradius = r * scaleFactor + 0.5;
            }else{
                tradius = ( r + probeRadius ) * scaleFactor + 0.5;
            }

            sradius = tradius * tradius;
            widxz[ name ] = Math.floor( tradius ) + 1;
            widxz_r = widxz[ name ];
            depty[ name ] = new Int32Array( widxz_r * widxz_r );
            indx = 0;

            for( j = 0; j < widxz_r; ++j ){

                for( k = 0; k < widxz_r; ++k ){

                    txz = j * j + k * k;

                    if( txz > sradius ){

                        depty[ name ][ indx ] = -1;

                    }else{

                        tdept = Math.sqrt( sradius - txz );
                        depty[ name ][ indx ] = Math.floor( tdept );

                    }

                    ++indx;

                }

            }

        }

    }

    function fillatom( atomIndex ){

        var cx, cy, cz, ox, oy, oz, mi, mj, mk, i, j, k, si, sj, sk;
        var ii, jj, kk, n;

        var atom = atoms[ atomIndex ];

        cx = Math.floor( 0.5 + scaleFactor * ( atom.x + ptran.x ) );
        cy = Math.floor( 0.5 + scaleFactor * ( atom.y + ptran.y ) );
        cz = Math.floor( 0.5 + scaleFactor * ( atom.z + ptran.z ) );

        var at = atom[ radiusProperty ];
        var depty_at = depty[ at ];
        var nind = 0;
        var cnt = 0;
        var pWH = pWidth * pHeight;

        for( i = 0, n = widxz[ at ]; i < n; ++i ){
        for( j = 0; j < n; ++j ) {

            if( depty_at[ nind ] != -1 ){

                for( ii = -1; ii < 2; ++ii ){
                for( jj = -1; jj < 2; ++jj ){
                for( kk = -1; kk < 2; ++kk ){

                    if( ii !== 0 && jj !== 0 && kk !== 0 ){

                        mi = ii * i;
                        mk = kk * j;

                        for( k = 0; k <= depty_at[ nind ]; ++k ){

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

                            if( !( vpBits[ index ] & INOUT ) ){

                                vpBits[ index ] |= INOUT;
                                vpAtomID[ index ] = atomIndex;

                            }else{

                                var atom2 = atoms[ vpAtomID[ index ] ];
                                ox = Math.floor( 0.5 + scaleFactor * ( atom2.x + ptran.x ) );
                                oy = Math.floor( 0.5 + scaleFactor * ( atom2.y + ptran.y ) );
                                oz = Math.floor( 0.5 + scaleFactor * ( atom2.z + ptran.z ) );

                                if( mi * mi + mj * mj + mk * mk <
                                    ox * ox + oy * oy + oz * oz
                                ){
                                    vpAtomID[ index ] = atomIndex;
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

    function fillvoxels(){

        var i, il;

        for( i = 0, il = vpBits.length; i < il; ++i ){
            vpBits[ i ] = 0;
            vpDistance[ i ] = -1.0;
            vpAtomID[ i ] = -1;
        }

        for( i = 0, il = atoms.length; i < il; ++i ){
            fillatom( i );
        }

        for( i = 0, il = vpBits.length; i < il; ++i ){
            if( vpBits[ i ] & INOUT ){
                vpBits[ i ] |= ISDONE;
            }
        }

    }

    function fillAtomWaals( atomIndex ){

        var cx, cy, cz, ox, oy, oz, nind = 0;
        var mi, mj, mk, si, sj, sk, i, j, k, ii, jj, kk, n;

        var atom = atoms[ atomIndex ];

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

                            if ( !( vpBits[ index ] & ISDONE ) ){

                                vpBits[ index ] |= ISDONE;
                                vpAtomID[ index ] = atom.index;

                            } else {

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

    function fillvoxelswaals() {

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

                var flagbound = false;
                var ii = 0;

                while( ii < 26 ){

                    var ti = i + nb[ ii ][ 0 ];
                    var tj = j + nb[ ii ][ 2 ];
                    var tk = k + nb[ ii ][ 1 ];

                    if( ti > -1 && ti < pLength &&
                        tk > -1 && tk < pWidth &&
                        tj > -1 && tj < pHeight &&
                        !( vpBits[ ti * pWH + tk * pHeight + tj ] & INOUT )
                    ){

                        vpBits[index] |= ISBOUND;
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

    // a little class for 3d array, should really generalize this and
    // use throughout...
    var PointGrid = function( length, width, height ){

        // the standard says this is zero initialized
        var data = new Int32Array( length * width * height * 3 );

        // set position x,y,z to pt, which has ix,iy,and iz
        this.set = function( x, y, z, pt ){
            var index = ( ( ( ( x * width ) + y ) * height ) + z ) * 3;
            data[ index ] = pt.ix;
            data[ index + 1] = pt.iy;
            data[ index + 2] = pt.iz;
        };

        // return point at x,y,z
        this.get = function( x, y, z ){
            var index = ( ( ( ( x * width ) + y ) * height ) + z ) * 3;
            return {
                ix : data[ index ],
                iy : data[ index + 1],
                iz : data[ index + 2]
            };
        };

    };

    function fastdistancemap(){

        var eliminate = 0;
        var certificate;
        var i, j, k, n;

        var boundPoint = new PointGrid( pLength, pWidth, pHeight );
        var pWH = pWidth * pHeight;
        var cutRSq = cutRadius * cutRadius;

        var inarray = [];
        var outarray = [];

        var index;

        for( i = 0; i < pLength; ++i ){
            for( j = 0; j < pWidth; ++j ){
                for( k = 0; k < pHeight; ++k ){

                    index = i * pWH + j * pHeight + k;
                    vpBits[ index ] &= ~ISDONE;  // isdone = false

                    if( vpBits[ index ] & INOUT ){

                        if( vpBits[ index ] & ISBOUND ){

                            var triple = {
                                ix : i,
                                iy : j,
                                iz : k
                            };

                            boundPoint.set( i, j, k, triple );
                            inarray.push( triple );
                            vpDistance[ index ] = 0;
                            vpBits[ index ] |= ISDONE;
                            vpBits[ index ] &= ~ISBOUND;

                        }

                    }

                }
            }
        }

        do {

            outarray = fastoneshell( inarray, boundPoint );
            inarray = [];

            for( i = 0, n = outarray.length; i < n; ++i ){

                index = pWH * outarray[ i ].ix + pHeight *
                            outarray[ i ].iy + outarray[ i ].iz;
                vpBits[index] &= ~ISBOUND;

                if( vpDistance[ index ] <= 1.0404 * cutRSq ){

                    inarray.push({
                        ix : outarray[ i ].ix,
                        iy : outarray[ i ].iy,
                        iz : outarray[ i ].iz
                    });

                }

            }

        }while( inarray.length !== 0 );

        inarray = [];
        outarray = [];
        boundPoint = null;

        var cutsf = Math.max( 0, scaleFactor - 0.5 );
        // FIXME why does this seem to work?
        // TODO check for other probeRadius and scaleFactor values
        var cutoff = probeRadius * probeRadius;  //1.4 * 1.4// cutRSq - 0.50 / ( 0.1 + cutsf );

        for( i = 0; i < pLength; ++i ){
            for( j = 0; j < pWidth; ++j ){
                for( k = 0; k < pHeight; ++k ){

                    index = i * pWH + j * pHeight + k;
                    vpBits[ index ] &= ~ISBOUND;

                    // ses solid

                    if( vpBits[ index ] & INOUT ) {

                        if( !( vpBits[ index ] & ISDONE ) ||
                            ( ( vpBits[ index ] & ISDONE ) && vpDistance[ index ] >= cutoff )
                        ){
                            vpBits[ index ] |= ISBOUND;
                        }
                    }

                }
            }
        }

    }

    function fastoneshell( inarray, boundPoint ){

        // *allocout,voxel2
        // ***boundPoint, int*
        // outnum, int *elimi)
        var tx, ty, tz;
        var dx, dy, dz;
        var i, j, n;
        var square;
        var bp, index;
        var outarray = [];

        if( inarray.length === 0 ){
            return outarray;
        }

        var tnv = {
            ix : -1,
            iy : -1,
            iz : -1
        };

        var pWH = pWidth*pHeight;

        for( i = 0, n = inarray.length; i < n; ++i ){

            tx = inarray[ i ].ix;
            ty = inarray[ i ].iy;
            tz = inarray[ i ].iz;
            bp = boundPoint.get( tx, ty, tz );

            for( j = 0; j < 6; ++j ){

                tnv.ix = tx + nb[ j ][ 0 ];
                tnv.iy = ty + nb[ j ][ 1 ];
                tnv.iz = tz + nb[ j ][ 2 ];

                if( tnv.ix < pLength && tnv.ix > -1 && tnv.iy < pWidth &&
                    tnv.iy > -1 && tnv.iz < pHeight && tnv.iz > -1
                ){

                    index = tnv.ix * pWH + pHeight * tnv.iy + tnv.iz;

                    if( ( vpBits[ index ] & INOUT ) && !( vpBits[ index ] & ISDONE ) ){

                        boundPoint.set( tnv.ix, tnv.iy, tz + nb[ j ][ 2 ], bp );
                        dx = tnv.ix - bp.ix;
                        dy = tnv.iy - bp.iy;
                        dz = tnv.iz - bp.iz;
                        square = dx * dx + dy * dy + dz * dz;

                        vpDistance[ index ] = square;
                        vpBits[ index ] |= ISDONE;
                        vpBits[ index ] |= ISBOUND;

                        outarray.push({
                            ix : tnv.ix,
                            iy : tnv.iy,
                            iz : tnv.iz
                        });

                    }else if( ( vpBits[ index ] & INOUT ) && ( vpBits[ index ] & ISDONE ) ){

                        dx = tnv.ix - bp.ix;
                        dy = tnv.iy - bp.iy;
                        dz = tnv.iz - bp.iz;
                        square = dx * dx + dy * dy + dz * dz;

                        if( square < vpDistance[ index ] ){

                            boundPoint.set( tnv.ix, tnv.iy, tnv.iz, bp );
                            vpDistance[ index ] = square;

                            if( !( vpBits[ index ] & ISBOUND ) ){

                                vpBits[ index ] |= ISBOUND;

                                outarray.push({
                                    ix : tnv.ix,
                                    iy : tnv.iy,
                                    iz : tnv.iz
                                });

                            }

                        }

                    }

                }
            }
        }

        // console.log("part1", positout);

        for (i = 0, n = inarray.length; i < n; i++) {
            tx = inarray[i].ix;
            ty = inarray[i].iy;
            tz = inarray[i].iz;
            bp = boundPoint.get(tx, ty, tz);

            for (j = 6; j < 18; j++) {
                tnv.ix = tx + nb[j][0];
                tnv.iy = ty + nb[j][1];
                tnv.iz = tz + nb[j][2];

                if(tnv.ix < pLength && tnv.ix > -1 && tnv.iy < pWidth &&
                        tnv.iy > -1 && tnv.iz < pHeight && tnv.iz > -1) {
                    index = tnv.ix * pWH + pHeight * tnv.iy + tnv.iz;

                    if ((vpBits[index] & INOUT) && !(vpBits[index] & ISDONE)) {
                        boundPoint.set(tnv.ix, tnv.iy, tz + nb[j][2], bp);

                        dx = tnv.ix - bp.ix;
                        dy = tnv.iy - bp.iy;
                        dz = tnv.iz - bp.iz;
                        square = dx * dx + dy * dy + dz * dz;
                        vpDistance[index] = square;
                        vpBits[index] |= ISDONE;
                        vpBits[index] |= ISBOUND;

                        outarray.push({
                            ix : tnv.ix,
                            iy : tnv.iy,
                            iz : tnv.iz
                        });
                    } else if ((vpBits[index] & INOUT) && (vpBits[index] & ISDONE)) {
                        dx = tnv.ix - bp.ix;
                        dy = tnv.iy - bp.iy;
                        dz = tnv.iz - bp.iz;
                        square = dx * dx + dy * dy + dz * dz;
                        if (square < vpDistance[index]) {
                            boundPoint.set(tnv.ix, tnv.iy, tnv.iz, bp);
                            vpDistance[index] = square;
                            if (!(vpBits[index] & ISBOUND)) {
                                vpBits[index] |= ISBOUND;
                                outarray.push({
                                    ix : tnv.ix,
                                    iy : tnv.iy,
                                    iz : tnv.iz
                                });
                            }
                        }
                    }
                }
            }
        }

        // console.log("part2", positout);

        for (i = 0, n = inarray.length; i < n; i++) {
            tx = inarray[i].ix;
            ty = inarray[i].iy;
            tz = inarray[i].iz;
            bp = boundPoint.get(tx, ty, tz);

            for (j = 18; j < 26; j++) {
                tnv.ix = tx + nb[j][0];
                tnv.iy = ty + nb[j][1];
                tnv.iz = tz + nb[j][2];

                if (tnv.ix < pLength && tnv.ix > -1 && tnv.iy < pWidth &&
                        tnv.iy > -1 && tnv.iz < pHeight && tnv.iz > -1) {
                    index = tnv.ix * pWH + pHeight * tnv.iy + tnv.iz;

                    if ((vpBits[index] & INOUT) && !(vpBits[index] & ISDONE)) {
                        boundPoint.set(tnv.ix, tnv.iy, tz + nb[j][2], bp);

                        dx = tnv.ix - bp.ix;
                        dy = tnv.iy - bp.iy;
                        dz = tnv.iz - bp.iz;
                        square = dx * dx + dy * dy + dz * dz;
                        vpDistance[index] = square;
                        vpBits[index] |= ISDONE;
                        vpBits[index] |= ISBOUND;

                        outarray.push({
                            ix : tnv.ix,
                            iy : tnv.iy,
                            iz : tnv.iz
                        });
                    } else if ((vpBits[index] & INOUT)  && (vpBits[index] & ISDONE)) {
                        dx = tnv.ix - bp.ix;
                        dy = tnv.iy - bp.iy;
                        dz = tnv.iz - bp.iz;
                        square = dx * dx + dy * dy + dz * dz;
                        if (square < vpDistance[index]) {
                            boundPoint.set(tnv.ix, tnv.iy, tnv.iz, bp);

                            vpDistance[index] = square;
                            if (!(vpBits[index] & ISBOUND)) {
                                vpBits[index] |= ISBOUND;
                                outarray.push({
                                    ix : tnv.ix,
                                    iy : tnv.iy,
                                    iz : tnv.iz
                                });
                            }
                        }
                    }
                }
            }
        }

        // console.log("part3", positout);
        return outarray;

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
