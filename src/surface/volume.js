/**
 * @file Volume
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Box3, Matrix3, Matrix4 } from "../../lib/three.es6.js";

import { WorkerRegistry, ColorMakerRegistry } from "../globals.js";
import WorkerPool from "../worker/worker-pool.js";
import { uniformArray } from "../math/array-utils";
import MarchingCubes from "./marching-cubes.js";
import { laplacianSmooth, computeVertexNormals } from "./surface-utils.js";
import { applyMatrix4toVector3array, applyMatrix3toVector3array } from "../math/vector-utils.js";
import { m3new, m3makeNormal } from "../math/matrix-utils.js";
import Surface from "./surface.js";


function VolumeSurface( data, nx, ny, nz, atomindex ){

    var mc = new MarchingCubes( data, nx, ny, nz, atomindex );

    function getSurface( isolevel, smooth, box, matrix, contour ){
        var sd = mc.triangulate( isolevel, smooth, box, contour );
        if( smooth ){
            laplacianSmooth( sd.position, sd.index, smooth, true );
            sd.normal = computeVertexNormals( sd.position, sd.index );
        }
        if( matrix ){
            applyMatrix4toVector3array( matrix, sd.position );
            if( sd.normal ){
                var normalMatrix = m3new();
                m3makeNormal( normalMatrix, matrix );
                applyMatrix3toVector3array( normalMatrix, sd.normal );
            }
        }
        return sd;
    }

    this.getSurface = getSurface;

}
VolumeSurface.__deps = [
    laplacianSmooth, computeVertexNormals, MarchingCubes,
    applyMatrix4toVector3array, applyMatrix3toVector3array,
    m3new, m3makeNormal
];


WorkerRegistry.add( "surf", function func( e, callback ){

    var a = e.data.args;
    var p = e.data.params;
    if( a ){
        self.volsurf = new VolumeSurface( a[0], a[1], a[2], a[3], a[4] );
    }
    if( p ){
        var sd = self.volsurf.getSurface( p.isolevel, p.smooth, p.box, p.matrix, p.contour );
        var transferList = [ sd.position.buffer, sd.index.buffer ];
        if( sd.normal ) transferList.push( sd.normal.buffer );
        if( sd.atomindex ) transferList.push( sd.atomindex.buffer );
        callback( {
            sd: sd,
            p: p
        }, transferList );
    }

}, [ VolumeSurface ] );


/**
 * Volume
 * @class
 * @param {String} name - volume name
 * @param {String} path - source path
 * @param {Float32array} data - volume 3d grid
 * @param {Integer} nx - x dimension of the 3d volume
 * @param {Integer} ny - y dimension of the 3d volume
 * @param {Integer} nz - z dimension of the 3d volume
 * @param {Int32Array} dataAtomindex - atom indices corresponding to the cells in the 3d grid
 */
function Volume( name, path, data, nx, ny, nz, dataAtomindex ){

    this.name = name;
    this.path = path;

    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix3();
    this.inverseMatrix = new Matrix4();
    this.center = new Vector3();
    this.boundingBox = new Box3();

    this.setData( data, nx, ny, nz, dataAtomindex );

}

Volume.prototype = {

    constructor: Volume,
    type: "Volume",

    /**
     * set volume data
     * @param {Float32array} data - volume 3d grid
     * @param {Integer} nx - x dimension of the 3d volume
     * @param {Integer} ny - y dimension of the 3d volume
     * @param {Integer} nz - z dimension of the 3d volume
     * @param {Int32Array} dataAtomindex - atom indices corresponding to the cells in the 3d grid
     * @return {undefined}
     */
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

    },

    /**
     * set transformation matrix
     * @param {Matrix4} matrix - 4x4 transformation matrix
     * @return {undefined}
     */
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
        var r0 = new Vector3( me[0], me[1], me[2] );
        var r1 = new Vector3( me[4], me[5], me[6] );
        var r2 = new Vector3( me[8], me[9], me[10] );
        var cp = new Vector3();
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

        this.inverseMatrix.getInverse( this.matrix );

    },

    /**
     * set atom indices
     * @param {Int32Array} dataAtomindex - atom indices corresponding to the cells in the 3d grid
     * @return {undefined}
     */
    setDataAtomindex: function( dataAtomindex ){

        this.dataAtomindex = dataAtomindex;
        this.__dataAtomindex = this.dataAtomindex;

        delete this.__dataAtomindexBuffer;

    },

    getBox: function( center, size, target ){

        if( !target ) target = new Box3();

        target.set( center, center );
        target.expandByScalar( size );
        target.applyMatrix4( this.inverseMatrix );

        target.min.round();
        target.max.round();

        return target;

    },

    __getBox: function( center, size ){

        if( !center || !size ) return;

        if( !this.__box ) this.__box = new Box3();
        var box = this.getBox( center, size, this.__box );
        return [ box.min.toArray(), box.max.toArray() ];

    },

    makeSurface: function( sd, isolevel, smooth ){

        var surface = new Surface( "", "", sd );
        surface.info.isolevel = isolevel;
        surface.info.smooth = smooth;

        return surface;

    },

    getSurface: function( isolevel, smooth, center, size ){

        isolevel = isNaN( isolevel ) ? this.getValueForSigma( 2 ) : isolevel;
        smooth = smooth || 0;

        //

        if( this.volsurf === undefined ){
            this.volsurf = new VolumeSurface(
                this.__data, this.nx, this.ny, this.nz, this.__dataAtomindex
            );
        }

        var box = this.__getBox( center, size );
        var sd = this.volsurf.getSurface( isolevel, smooth, box, this.matrix.elements );

        return this.makeSurface( sd, isolevel, smooth );

    },

    getSurfaceWorker: function( isolevel, smooth, center, size, callback ){

        isolevel = isNaN( isolevel ) ? this.getValueForSigma( 2 ) : isolevel;
        smooth = smooth || 0;

        //

        if( window.Worker ){

            if( this.workerPool === undefined ){
                this.workerPool = new WorkerPool( "surf", 2 );
            }

            var msg = {};
            var worker = this.workerPool.getNextWorker();

            if( worker.postCount === 0 ){
                msg.args = [
                    this.__data, this.nx, this.ny, this.nz, this.__dataAtomindex
                ];
            }

            msg.params = {
                isolevel: isolevel,
                smooth: smooth,
                box: this.__getBox( center, size ),
                matrix: this.matrix.elements
            };

            worker.post( msg, undefined,

                function( e ){
                    var sd = e.data.sd;
                    var p = e.data.p;
                    callback( this.makeSurface( sd, p.isolevel, p.smooth ) );
                }.bind( this ),

                function( e ){
                    console.warn(
                        "Volume.getSurfaceWorker error - trying without worker", e
                    );
                    var surface = this.getSurface( isolevel, smooth, center, size );
                    callback( surface );
                }.bind( this )

            );

        }else{

            var surface = this.getSurface( isolevel, smooth, center, size );
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

        var colorMaker = ColorMakerRegistry.getScheme( p );

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
        var i, array;

        switch( size ){

            case "value":

                array = new Float32Array( this.data );
                break;

            case "abs-value":

                array = new Float32Array( this.data );
                for( i = 0; i < n; ++i ){
                    array[ i ] = Math.abs( array[ i ] );
                }
                break;

            case "value-min":

                array = new Float32Array( this.data );
                var min = this.getDataMin();
                for( i = 0; i < n; ++i ){
                    array[ i ] -= min;
                }
                break;

            case "deviation":

                array = new Float32Array( this.data );
                break;

            default:

                array = uniformArray( n, size );
                break;

        }

        if( scale !== 1.0 ){

            for( i = 0; i < n; ++i ){
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

        var vol = new Volume(

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

    dispose: function(){

        if( this.workerPool ) this.workerPool.terminate();

    }

};


export default Volume;

export {
    VolumeSurface
};
