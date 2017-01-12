/**
 * @file Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Signal from "../../lib/signals.es6.js";


import { Log } from "../globals.js";
import { defaults } from "../utils.js";
import Queue from "../utils/queue.js";
import { circularMean } from "../math/array-utils.js";
import Selection from "../selection.js";
import Superposition from "../align/superposition.js";


function centerPbc( coords, mean, box ){

    if( box[ 0 ]===0 || box[ 8 ]===0 || box[ 4 ]===0 ){
        return;
    }

    var i;
    var n = coords.length;

    var bx = box[ 0 ], by = box[ 1 ], bz = box[ 2 ];
    var mx = mean[ 0 ], my = mean[ 1 ], mz = mean[ 2 ];

    var fx = - mx + bx + bx / 2;
    var fy = - my + by + by / 2;
    var fz = - mz + bz + bz / 2;

    for( i = 0; i < n; i += 3 ){
        coords[ i + 0 ] = ( coords[ i + 0 ] + fx ) % bx;
        coords[ i + 1 ] = ( coords[ i + 1 ] + fy ) % by;
        coords[ i + 2 ] = ( coords[ i + 2 ] + fz ) % bz;
    }

}


function removePbc( x, box ){

    if( box[ 0 ]===0 || box[ 8 ]===0 || box[ 4 ]===0 ){
        return;
    }

    // ported from GROMACS src/gmxlib/rmpbc.c:rm_gropbc()
    // in-place

    var i, j, d, dist;
    var n = x.length;

    for( i = 3; i < n; i += 3 ){

        for( j = 0; j < 3; ++j ){

            dist = x[ i + j ] - x[ i - 3 + j ];

            if( Math.abs( dist ) > 0.9 * box[ j * 3 + j ] ){

                if( dist > 0 ){

                    for( d = 0; d < 3; ++d ){
                        x[ i + d ] -= box[ j * 3 + d ];
                    }

                }else{

                    for( d = 0; d < 3; ++d ){
                        x[ i + d ] += box[ j * 3 + d ];
                    }

                }
            }

        }

    }

    return x;

}


/**
 * Trajectory parameter object.
 * @typedef {Object} TrajectoryParameters - parameters
 *
 * @property {String} sele - to restrict atoms used for superposition
 * @property {Boolean} centerPbc - center on initial frame
 * @property {Boolean} removePbc - try fixing periodic boundary discontinuities
 * @property {Boolean} superpose - superpose on initial frame
 */


/**
 * Trajectory object for tying frames and structure together
 * @class
 * @param {String|Frames} trajPath - trajectory source
 * @param {Structure} structure - the structure object
 * @param {TrajectoryParameters} params - trajectory parameters
 */
function Trajectory( trajPath, structure, params ){

    this.signals = {
        gotNumframes: new Signal(),
        frameChanged: new Signal(),
        selectionChanged: new Signal(),
        playerChanged: new Signal(),
    };

    var p = params || {};
    p.centerPbc = defaults( p.centerPbc, true );
    p.removePbc = defaults( p.removePbc, true );
    p.superpose = defaults( p.superpose, true );
    this.setParameters( p );

    this.name = trajPath.replace( /^.*[\\\/]/, '' );

    // selection to restrict atoms used for superposition
    this.selection = new Selection(
        defaults( p.sele, "backbone and not hydrogen" )
    );

    this.selection.signals.stringChanged.add( function(){
        this.makeIndices();
        this.resetCache();
    }, this );

    // should come after this.selection is set
    this.setStructure( structure );

    this.trajPath = trajPath;

    this.numframes = undefined;
    this.getNumframes();

}

Trajectory.prototype = {

    constructor: Trajectory,

    setStructure: function( structure ){

        this.structure = structure;
        this.atomCount = structure.atomCount;

        this.makeAtomIndices();

        this.saveInitialStructure();

        this.backboneIndices = this.getIndices(
            new Selection( "backbone and not hydrogen" )
        );
        this.makeIndices();

        this.frameCache = [];
        this.boxCache = [];
        this.pathCache = [];
        this.frameCacheSize = 0;
        this.currentFrame = -1;

    },

    saveInitialStructure: function(){

        var i = 0;
        var initialStructure = new Float32Array( 3 * this.atomCount );

        this.structure.eachAtom( function( a ){

            initialStructure[ i + 0 ] = a.x;
            initialStructure[ i + 1 ] = a.y;
            initialStructure[ i + 2 ] = a.z;

            i += 3;

        } );

        this.initialStructure = initialStructure;

    },

    setSelection: function( string ){

        this.selection.setString( string );

        return this;

    },

    getIndices: function( selection ){

        var indices;

        if( selection && selection.test ){

            var i = 0;
            var test = selection.test;
            indices = [];

            this.structure.eachAtom( function( ap ){
                if( test( ap ) ){
                    indices.push( i );
                }
                i += 1;
            } );

        }else{

            indices = this.structure.getAtomIndices( this.selection );

        }

        return indices;

    },

    makeIndices: function(){

        // indices to restrict atoms used for superposition
        this.indices = this.getIndices( this.selection );

        var i, j;
        var n = this.indices.length * 3;

        this.coords1 = new Float32Array( n );
        this.coords2 = new Float32Array( n );

        var y = this.initialStructure;
        var coords2 = this.coords2;

        for( i = 0; i < n; i += 3 ){

            j = this.indices[ i / 3 ] * 3;

            coords2[ i + 0 ] = y[ j + 0 ];
            coords2[ i + 1 ] = y[ j + 1 ];
            coords2[ i + 2 ] = y[ j + 2 ];

        }

    },

    makeAtomIndices: function(){

        Log.error( "Trajectory.makeAtomIndices not implemented" );

    },

    getNumframes: function(){

        Log.error( "Trajectory.loadFrame not implemented" );

    },

    resetCache: function(){

        this.frameCache = [];
        this.boxCache = [];
        this.pathCache = [];
        this.frameCacheSize = 0;
        this.setFrame( this.currentFrame );

        return this;

    },

    setParameters: function( params ){

        var p = params;
        var resetCache = false;

        if( p.centerPbc !== undefined && p.centerPbc !== this.centerPbc ){
            this.centerPbc = p.centerPbc;
            resetCache = true;
        }

        if( p.removePbc !== undefined && p.removePbc !== this.removePbc ){
            this.removePbc = p.removePbc;
            resetCache = true;
        }

        if( p.superpose !== undefined && p.superpose !== this.superpose ){
            this.superpose = p.superpose;
            resetCache = true;
        }

        if( resetCache ) this.resetCache();

    },

    setFrame: function( i, callback ){

        if( i === undefined ) return this;

        this.inProgress = true;

        i = parseInt( i );

        if( i === -1 || this.frameCache[ i ] ){

            this.updateStructure( i, callback );

        }else{

            this.loadFrame( i, function(){

                this.updateStructure( i, callback );

            }.bind( this ) );

        }

        return this;

    },

    interpolate: function(){

        var spline = function( p0, p1, p2, p3, t, tension ) {

            var v0 = ( p2 - p0 ) * tension;
            var v1 = ( p3 - p1 ) * tension;
            var t2 = t * t;
            var t3 = t * t2;

            return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 +
                   ( -3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 +
                   v0 * t + p1;

        };

        var lerp = function( a, b, t ) {

            return a + ( b - a ) * t;

        };

        return function interpolate( i, ip, ipp, ippp, t, type, callback ){

            var fc = this.frameCache;

            var c = fc[ i ];
            var cp = fc[ ip ];
            var cpp = fc[ ipp ];
            var cppp = fc[ ippp ];

            var j;
            var m = c.length;
            var coords = new Float32Array( m );

            if( type === "spline" ){

                for( j = 0; j < m; j += 3 ){

                    coords[ j + 0 ] = spline(
                        cppp[ j + 0 ], cpp[ j + 0 ], cp[ j + 0 ], c[ j + 0 ], t, 1
                    );
                    coords[ j + 1 ] = spline(
                        cppp[ j + 1 ], cpp[ j + 1 ], cp[ j + 1 ], c[ j + 1 ], t, 1
                    );
                    coords[ j + 2 ] = spline(
                        cppp[ j + 2 ], cpp[ j + 2 ], cp[ j + 2 ], c[ j + 2 ], t, 1
                    );

                }

            }else{

                for( j = 0; j < m; j += 3 ){

                    coords[ j + 0 ] = lerp( cp[ j + 0 ], c[ j + 0 ], t );
                    coords[ j + 1 ] = lerp( cp[ j + 1 ], c[ j + 1 ], t );
                    coords[ j + 2 ] = lerp( cp[ j + 2 ], c[ j + 2 ], t );

                }

            }

            this.structure.updatePosition( coords );
            this.currentFrame = i;
            this.signals.frameChanged.dispatch( i );

            if( typeof callback === "function" ){

                callback();

            }

        };

    }(),

    setFrameInterpolated: function( i, ip, ipp, ippp, t, type, callback ){

        if( i === undefined ) return this;

        var fc = this.frameCache;

        var iList = [];

        if( !fc[ ippp ] ) iList.push( ippp );
        if( !fc[ ipp ] ) iList.push( ipp );
        if( !fc[ ip ] ) iList.push( ip );
        if( !fc[ i ] ) iList.push( i );

        if( iList.length ){

            this.loadFrame( iList, function(){

                this.interpolate( i, ip, ipp, ippp, t, type, callback );

            }.bind( this ) );

        }else{

            this.interpolate( i, ip, ipp, ippp, t, type, callback );

        }

        return this;

    },

    loadFrame: function( i, callback ){

        if( Array.isArray( i ) ){

            var queue;
            var fn = function( j, wcallback ){
                this._loadFrame( j, wcallback );
                if( queue.length() === 0 && typeof callback === "function" ) callback();
            }.bind( this );
            queue = new Queue( fn, i );

        }else{

            this._loadFrame( i, callback );

        }

    },

    _loadFrame: function( i, callback ){

        Log.error( "Trajectory._loadFrame not implemented", i, callback );

    },

    updateStructure: function( i, callback ){

        if( this._disposed ) return;

        if( i === -1 ){
            this.structure.updatePosition( this.initialStructure );
        }else{
            this.structure.updatePosition( this.frameCache[ i ] );
        }

        this.structure.trajectory = {
            name: this.trajPath,
            frame: i
        };

        if( typeof callback === "function" ){
            callback();
        }

        this.currentFrame = i;
        this.inProgress = false;
        this.signals.frameChanged.dispatch( i );

    },

    getCircularMean: function( indices, coords, box ){

        return [
            circularMean( coords, box[ 0 ], 3, 0, indices ),
            circularMean( coords, box[ 1 ], 3, 1, indices ),
            circularMean( coords, box[ 2 ], 3, 2, indices )
        ];

    },

    doSuperpose: function( x ){

        var i, j;
        var n = this.indices.length * 3;

        var coords1 = this.coords1;
        var coords2 = this.coords2;

        for( i = 0; i < n; i += 3 ){

            j = this.indices[ i / 3 ] * 3;

            coords1[ i + 0 ] = x[ j + 0 ];
            coords1[ i + 1 ] = x[ j + 1 ];
            coords1[ i + 2 ] = x[ j + 2 ];

        }

        // TODO re-use superposition object
        var sp = new Superposition( coords1, coords2 );
        sp.transform( x );

    },

    process: function( i, box, coords, numframes ){

        this.setNumframes( numframes );

        if( box ){

            if( this.backboneIndices.length > 0 && this.centerPbc ){
                var box2 = [ box[ 0 ], box[ 4 ], box[ 8 ] ];
                var mean = this.getCircularMean(
                    this.backboneIndices, coords, box2
                );
                centerPbc( coords, mean, box2 );
            }

            if( this.removePbc ){
                removePbc( coords, box );
            }

        }

        if( this.indices.length > 0 && this.superpose ){
            this.doSuperpose( coords );
        }

        this.frameCache[ i ] = coords;
        this.boxCache[ i ] = box;
        this.frameCacheSize += 1;

    },

    setNumframes: function( n ){

        if( n !== this.numframes ){

            this.numframes = n;
            this.signals.gotNumframes.dispatch( n );

        }

    },

    dispose: function(){

        this.frameCache = [];  // aid GC
        this._disposed = true;
        if( this.player ) this.player.stop();

    },

    setPlayer: function( player ){

        this.player = player;
        this.signals.playerChanged.dispatch( player );

    },

    getPath: function( index, callback ){

        Log.error( "Trajectory.getPath not implemented", index, callback );

    }

};


export default Trajectory;
